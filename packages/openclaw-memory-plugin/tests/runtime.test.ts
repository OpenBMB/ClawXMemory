import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryPluginRuntime } from "../src/runtime.js";

describe("MemoryPluginRuntime", () => {
  const cleanupPaths: string[] = [];

  afterEach(async () => {
    vi.restoreAllMocks();
    await Promise.all(cleanupPaths.splice(0).map((target) => rm(target, { recursive: true, force: true })));
  });

  it("injects dynamic recall through prependSystemContext", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-runtime-"));
    cleanupPaths.push(dir);

    const runtime = new MemoryPluginRuntime({
      apiConfig: {},
      pluginRuntime: undefined,
      pluginConfig: {
        dbPath: join(dir, "memory.sqlite"),
        uiEnabled: false,
      },
      logger: undefined,
    });

    (runtime as { retriever: { retrieve: ReturnType<typeof vi.fn> } }).retriever = {
      retrieve: vi.fn().mockResolvedValue({
        query: "What happened yesterday?",
        intent: "time",
        enoughAt: "l2",
        profile: null,
        l2Results: [],
        l1Results: [],
        l0Results: [],
        context: "2026-03-23: OpenClaw plugin SDK migration started.",
        debug: {
          mode: "local_fallback",
          elapsedMs: 25,
          cacheHit: false,
        },
      }),
    };

    const result = await runtime.handleBeforePromptBuild(
      { prompt: "What happened yesterday?", messages: [] },
      {},
    );

    expect(result).toMatchObject({
      prependSystemContext: expect.stringContaining("## ClawXMemory Recall"),
    });
    expect(result).not.toHaveProperty("prependContext");

    runtime.stop();
  });

  it("sanitizes recall scaffolding when agent_end falls back to raw event messages", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-runtime-"));
    cleanupPaths.push(dir);

    const runtime = new MemoryPluginRuntime({
      apiConfig: {},
      pluginRuntime: undefined,
      pluginConfig: {
        dbPath: join(dir, "memory.sqlite"),
        uiEnabled: false,
      },
      logger: undefined,
    });

    await runtime.handleAgentEnd(
      {
        messages: [
          {
            role: "user",
            content: [
              "## ClawXMemory Recall",
              "",
              "Use the following retrieved ClawXMemory evidence for this turn.",
              "",
              "## ClawXMemory Retrieved Evidence",
              "intent=general",
              "enoughAt=l0",
              "",
              "Treat the selected evidence above as authoritative historical memory for this turn when it is relevant.",
              "If the needed answer is already shown above, do not claim that memory is missing or that this is a fresh conversation.",
              "",
              "[Tue 2026-03-24 16:24 GMT+8] 感觉冒菜可以",
            ].join("\n"),
          },
          {
            role: "assistant",
            content: "胃菜不错！热乎又管饱。",
          },
        ],
      } as never,
      {
        sessionKey: "session-recall-fallback",
      } as never,
    );

    const record = runtime.repository.listRecentL0(1)[0];
    expect(record).toBeDefined();
    expect(record?.messages).toEqual([
      { role: "user", content: "感觉冒菜可以" },
      { role: "assistant", content: "胃菜不错！热乎又管饱。" },
    ]);

    runtime.stop();
  });

  it("repairs contaminated l0 records on startup and requeues rebuild", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-runtime-"));
    cleanupPaths.push(dir);

    const runtime = new MemoryPluginRuntime({
      apiConfig: {},
      pluginRuntime: undefined,
      pluginConfig: {
        dbPath: join(dir, "memory.sqlite"),
        uiEnabled: false,
      },
      logger: undefined,
    });

    runtime.repository.insertL0Session({
      l0IndexId: "l0-contaminated",
      sessionKey: "session-repair",
      timestamp: "2026-03-24T08:24:13.000Z",
      source: "openclaw",
      indexed: true,
      createdAt: "2026-03-24T08:24:13.000Z",
      messages: [
        {
          role: "user",
          content: [
            "## ClawXMemory Recall",
            "",
            "Use the following retrieved ClawXMemory evidence for this turn.",
            "",
            "## ClawXMemory Retrieved Evidence",
            "intent=general",
            "enoughAt=l0",
            "",
            "Treat the selected evidence above as authoritative historical memory for this turn when it is relevant.",
            "If the needed answer is already shown above, do not claim that memory is missing or that this is a fresh conversation.",
            "",
            "System: [2026-03-24 16:24:10] Gateway restart update ok (npm)",
            "",
            "[Tue 2026-03-24 16:24 GMT+8] 感觉冒菜可以",
          ].join("\n"),
        },
        {
          role: "assistant",
          content: "胃菜不错！热乎又管饱。",
        },
      ],
    });

    const runHeartbeat = vi.spyOn(runtime.indexer, "runHeartbeat").mockResolvedValue({
      l0Captured: 0,
      l1Created: 0,
      l2TimeUpdated: 0,
      l2ProjectUpdated: 0,
      profileUpdated: 0,
      failed: 0,
    });

    runtime.start();

    await vi.waitFor(() => {
      const record = runtime.repository.listRecentL0(1)[0];
      expect(record?.messages).toEqual([
        { role: "user", content: "感觉冒菜可以" },
        { role: "assistant", content: "胃菜不错！热乎又管饱。" },
      ]);
      expect(record?.indexed).toBe(false);
      expect(runHeartbeat).toHaveBeenCalledWith({ reason: "repair" });
    });

    runtime.stop();
  });
});
