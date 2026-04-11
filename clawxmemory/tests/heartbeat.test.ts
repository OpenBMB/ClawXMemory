import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MemoryCandidate, MemoryMessage } from "../src/core/index.js";
import { HeartbeatIndexer, MemoryRepository } from "../src/core/index.js";

const DEFAULT_SETTINGS = {
  reasoningMode: "accuracy_first" as const,
  recallTopK: 8,
  autoIndexIntervalMinutes: 60,
  autoDreamIntervalMinutes: 360,
  autoDreamMinNewL1: 10,
  dreamProjectRebuildTimeoutMs: 180_000,
};

function createMessages(user: string, assistant: string): MemoryMessage[] {
  return [
    { role: "user", content: user },
    { role: "assistant", content: assistant },
  ];
}

describe("HeartbeatIndexer batch indexing", () => {
  const cleanupPaths: string[] = [];

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(cleanupPaths.splice(0).map((target) => rm(target, { recursive: true, force: true })));
  });

  it("processes all pending l0 rows in the same session with a shared batch context", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-heartbeat-"));
    cleanupPaths.push(dir);
    const repository = new MemoryRepository(join(dir, "memory.sqlite"), {
      memoryDir: join(dir, "memory"),
    });

    repository.insertL0Session({
      l0IndexId: "l0-1",
      sessionKey: "agent:main:main#window:1",
      timestamp: "2026-04-10T07:00:00.000Z",
      source: "openclaw",
      indexed: false,
      messages: createMessages(
        "记住，在这个项目里，你给我汇报时要先说完成了什么，再说风险。",
        "好的，我记住这条项目内规则。",
      ),
    });
    repository.insertL0Session({
      l0IndexId: "l0-2",
      sessionKey: "agent:main:main#window:1",
      timestamp: "2026-04-10T07:01:00.000Z",
      source: "openclaw",
      indexed: false,
      messages: createMessages(
        "这个项目先叫 Boreal。它是一个本地知识库整理工具，目前还在设计阶段。",
        "好的，我记下 Boreal 了。",
      ),
    });

    const extractFileMemoryCandidates = vi.fn(async (input: {
      timestamp: string;
      batchContextMessages?: MemoryMessage[];
      messages: MemoryMessage[];
    }): Promise<MemoryCandidate[]> => {
      expect(input.batchContextMessages?.length).toBe(4);
      expect(input.messages).toHaveLength(1);
      expect(input.messages.every((message) => message.role === "user")).toBe(true);
      const userText = input.messages.find((message) => message.role === "user")?.content ?? "";
      if (userText.includes("汇报时要先说完成了什么")) {
        return [{
          type: "feedback",
          scope: "project",
          name: "collaboration-rule",
          description: "你给我汇报时要先说完成了什么，再说风险。",
          capturedAt: input.timestamp,
          sourceSessionKey: "agent:main:main#window:1",
          rule: "你给我汇报时要先说完成了什么，再说风险。",
        }];
      }
      return [{
        type: "project",
        scope: "project",
        name: "Boreal",
        description: "本地知识库整理工具",
        capturedAt: input.timestamp,
        sourceSessionKey: "agent:main:main#window:1",
        stage: "目前还在设计阶段。",
      }];
    });

    const rewriteUserProfile = vi.fn().mockResolvedValue(null);
    const indexer = new HeartbeatIndexer(
      repository,
      {
        extractFileMemoryCandidates,
        rewriteUserProfile,
      } as never,
      { settings: DEFAULT_SETTINGS },
    );

    const stats = await indexer.runHeartbeat({ reason: "manual" });

    expect(extractFileMemoryCandidates).toHaveBeenCalledTimes(2);
    expect(repository.listPendingSessionKeys()).toEqual([]);
    expect(repository.listRecentL0(10).every((record) => record.indexed)).toBe(true);
    const tmpEntries = repository.getFileMemoryStore().listTmpEntries(10);
    expect(tmpEntries.map((entry) => entry.type).sort()).toEqual(["feedback", "project"]);
    const indexTraces = repository.listRecentIndexTraces(5);
    expect(indexTraces).toHaveLength(1);
    expect(indexTraces[0]?.trigger).toBe("manual_sync");
    expect(indexTraces[0]?.batchSummary).toMatchObject({
      l0Ids: ["l0-1", "l0-2"],
      segmentCount: 2,
      focusUserTurnCount: 2,
    });
    expect(indexTraces[0]?.steps.map((step) => step.kind)).toEqual([
      "index_start",
      "batch_loaded",
      "focus_turns_selected",
      "turn_classified",
      "candidate_validated",
      "candidate_grouped",
      "candidate_persisted",
      "turn_classified",
      "candidate_validated",
      "candidate_grouped",
      "candidate_persisted",
      "index_finished",
    ]);
    const batchLoaded = indexTraces[0]?.steps.find((step) => step.kind === "batch_loaded");
    expect(batchLoaded?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Batch Summary" }),
      expect.objectContaining({ label: "Batch Context" }),
    ]));
    const persistedStep = indexTraces[0]?.steps.find((step) => step.kind === "candidate_persisted");
    expect(persistedStep?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Persisted Files" }),
    ]));
    expect(indexTraces[0]?.storedResults.map((result) => result.relativePath).sort()).toEqual(
      tmpEntries.map((entry) => entry.relativePath).sort(),
    );
    expect(stats).toMatchObject({
      l0Captured: 2,
      l1Created: 2,
      l2ProjectUpdated: 2,
      failed: 0,
    });

    repository.close();
  });

  it("stages a readable project_id in tmp instead of treating it as a formal project id", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-heartbeat-"));
    cleanupPaths.push(dir);
    const repository = new MemoryRepository(join(dir, "memory.sqlite"), {
      memoryDir: join(dir, "memory"),
    });

    repository.insertL0Session({
      l0IndexId: "l0-1",
      sessionKey: "agent:main:main#window:2",
      timestamp: "2026-04-10T07:05:00.000Z",
      source: "openclaw",
      indexed: false,
      messages: createMessages(
        "这个项目先叫 Boreal。它是一个本地知识库整理工具，目前还在设计阶段。",
        "好的，我记下 Boreal 了。",
      ),
    });

    const indexer = new HeartbeatIndexer(
      repository,
      {
        extractFileMemoryCandidates: vi.fn().mockResolvedValue([{
          type: "project",
          scope: "project",
          projectId: "boreal",
          name: "Boreal",
          description: "本地知识库整理工具",
          capturedAt: "2026-04-10T07:05:00.000Z",
          stage: "目前还在设计阶段。",
        }]),
        rewriteUserProfile: vi.fn().mockResolvedValue(null),
      } as never,
      { settings: DEFAULT_SETTINGS },
    );

    await indexer.runHeartbeat({ reason: "manual" });

    const store = repository.getFileMemoryStore();
    expect(store.listProjectIds().filter((projectId) => projectId !== "_tmp")).toEqual([]);
    const tmpEntries = store.listTmpEntries(10);
    expect(tmpEntries).toHaveLength(1);
    expect(tmpEntries[0]?.name).toBe("Boreal");
    repository.close();
  });
});
