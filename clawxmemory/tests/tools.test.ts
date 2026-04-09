import { describe, expect, it, vi } from "vitest";
import type {
  DashboardOverview,
  DreamRunResult,
  HeartbeatStats,
  MemoryRepository,
  ReasoningRetriever,
  RetrievalResult,
} from "../src/core/index.js";
import { buildPluginTools } from "../src/tools.js";

const retrievalResult: RetrievalResult = {
  query: "project status",
  intent: "project",
  enoughAt: "file",
  profile: null,
  evidenceNote: "Selected 1 memory files from 2 manifest entries.",
  l2Results: [],
  l1Results: [],
  l0Results: [],
  context: "## ClawXMemory Recall\nroute=project",
  debug: {
    mode: "llm",
    elapsedMs: 42,
    cacheHit: false,
    route: "project",
    manifestCount: 2,
    selectedFileIds: ["projects/clawxmemory/Project/overview.md"],
  },
};

const baseOverview: DashboardOverview = {
  totalL0: 3,
  pendingL0: 1,
  openTopics: 0,
  totalL1: 0,
  totalL2Time: 0,
  totalL2Project: 0,
  totalProfiles: 0,
  totalMemoryFiles: 3,
  totalUserMemories: 1,
  totalFeedbackMemories: 1,
  totalProjectMemories: 1,
  changedFilesSinceLastDream: 2,
  queuedSessions: 0,
  lastRecallMs: 20,
  recallTimeouts: 0,
  lastRecallMode: "llm",
  currentReasoningMode: "answer_first",
  lastRecallPath: "explicit",
  lastRecallBudgetLimited: false,
  lastShadowDeepQueued: false,
  lastRecallInjected: true,
  lastRecallEnoughAt: "file",
  lastRecallCacheHit: false,
  slotOwner: "openbmb-clawxmemory",
  dynamicMemoryRuntime: "healthy",
  workspaceBootstrapPresent: true,
  memoryRuntimeHealthy: true,
  runtimeIssues: [],
  lastIndexedAt: "2026-04-09T01:00:00.000Z",
  lastDreamAt: "2026-04-09T00:30:00.000Z",
  lastDreamStatus: "success",
  lastDreamSummary: "Dream reviewed 3 memory files.",
  startupRepairStatus: "idle",
};

function createRepository() {
  return {
    getOverview: vi.fn().mockReturnValue(baseOverview),
    listMemoryEntries: vi.fn().mockReturnValue([
      {
        type: "user" as const,
        scope: "global" as const,
        name: "profile",
        description: "Stable user profile.",
        updatedAt: "2026-04-09T00:10:00.000Z",
        file: "profile.md",
        relativePath: "global/User/profile.md",
        absolutePath: "/tmp/global/User/profile.md",
      },
      {
        type: "project" as const,
        scope: "project" as const,
        projectId: "clawxmemory",
        name: "overview",
        description: "Project progress.",
        updatedAt: "2026-04-09T00:20:00.000Z",
        file: "overview.md",
        relativePath: "projects/clawxmemory/Project/overview.md",
        absolutePath: "/tmp/projects/clawxmemory/Project/overview.md",
      },
    ]),
    getMemoryRecordsByIds: vi.fn().mockReturnValue([
      {
        type: "project" as const,
        scope: "project" as const,
        projectId: "clawxmemory",
        name: "overview",
        description: "Project progress.",
        updatedAt: "2026-04-09T00:20:00.000Z",
        file: "overview.md",
        relativePath: "projects/clawxmemory/Project/overview.md",
        absolutePath: "/tmp/projects/clawxmemory/Project/overview.md",
        content: "## Current Stage\nMemory refactor is in progress.",
        preview: "Memory refactor is in progress.",
      },
    ]),
  } as unknown as MemoryRepository;
}

function createRetriever() {
  return {
    retrieve: vi.fn().mockResolvedValue(retrievalResult),
  } as unknown as ReasoningRetriever;
}

describe("buildPluginTools", () => {
  it("exposes search, overview, list, get, flush, and dream tools", async () => {
    const repository = createRepository();
    const retriever = createRetriever();
    const getOverview = vi.fn().mockReturnValue(baseOverview);
    const flushAll = vi.fn().mockResolvedValue({
      l0Captured: 1,
      l1Created: 1,
      l2TimeUpdated: 0,
      l2ProjectUpdated: 1,
      profileUpdated: 0,
      failed: 0,
    } satisfies HeartbeatStats);
    const runDream = vi.fn().mockResolvedValue({
      prepFlush: {
        l0Captured: 0,
        l1Created: 0,
        l2TimeUpdated: 0,
        l2ProjectUpdated: 0,
        profileUpdated: 0,
        failed: 0,
      },
      reviewedL1: 3,
      rewrittenProjects: 1,
      deletedProjects: 0,
      profileUpdated: true,
      duplicateTopicCount: 0,
      conflictTopicCount: 0,
      prunedProjectL1Refs: 0,
      prunedProfileL1Refs: 0,
      summary: "Dream reviewed 3 memory files.",
      trigger: "manual",
      status: "success",
    } satisfies DreamRunResult);
    const tools = buildPluginTools(repository, retriever, { getOverview, flushAll, runDream });
    expect(tools.map((tool) => tool.name)).toEqual([
      "memory_search",
      "memory_overview",
      "memory_list",
      "memory_get",
      "memory_flush",
      "memory_dream",
    ]);

    const searchResult = await tools[0]!.execute("call-1", { query: "project status", limit: 5 });
    expect(searchResult.details).toMatchObject({
      ok: true,
      route: "project",
      enoughAt: "file",
      refs: {
        files: ["projects/clawxmemory/Project/overview.md"],
      },
    });

    const overviewTool = tools.find((tool) => tool.name === "memory_overview");
    const overviewResult = await overviewTool!.execute("call-2", {});
    expect(overviewResult.details).toMatchObject({
      ok: true,
      overview: baseOverview,
    });

    const dreamTool = tools.find((tool) => tool.name === "memory_dream");
    const dreamResult = await dreamTool!.execute("call-3", {});
    expect(dreamResult.details).toMatchObject({
      ok: true,
      result: {
        status: "success",
        reviewedL1: 3,
      },
    });
  });

  it("lists file-based memories and validates inputs", async () => {
    const repository = createRepository();
    const tools = buildPluginTools(repository, createRetriever(), {
      getOverview: () => baseOverview,
      flushAll: async () => ({
        l0Captured: 0,
        l1Created: 0,
        l2TimeUpdated: 0,
        l2ProjectUpdated: 0,
        profileUpdated: 0,
        failed: 0,
      }),
      runDream: async () => ({
        prepFlush: {
          l0Captured: 0,
          l1Created: 0,
          l2TimeUpdated: 0,
          l2ProjectUpdated: 0,
          profileUpdated: 0,
          failed: 0,
        },
        reviewedL1: 2,
        rewrittenProjects: 1,
        deletedProjects: 0,
        profileUpdated: false,
        duplicateTopicCount: 0,
        conflictTopicCount: 0,
        prunedProjectL1Refs: 0,
        prunedProfileL1Refs: 0,
        summary: "ok",
      }),
    });
    const memoryList = tools.find((tool) => tool.name === "memory_list");
    expect(memoryList).toBeDefined();

    const defaultList = await memoryList!.execute("call-4", {});
    expect(defaultList.details).toMatchObject({
      ok: true,
      kind: "all",
      query: "",
      count: 2,
    });

    const filtered = await memoryList!.execute("call-5", {
      kind: "project",
      query: "progress",
      projectId: "clawxmemory",
      limit: 1,
      offset: 0,
    });
    expect((repository as unknown as { listMemoryEntries: ReturnType<typeof vi.fn> }).listMemoryEntries).toHaveBeenCalledWith({
      kinds: ["project"],
      query: "progress",
      projectId: "clawxmemory",
      limit: 1,
      offset: 0,
    });
    expect(filtered.details).toMatchObject({
      ok: true,
      kind: "project",
      projectId: "clawxmemory",
    });

    const invalidKind = await memoryList!.execute("call-6", { kind: "l2" });
    expect(invalidKind.details).toMatchObject({ ok: false });
  });

  it("gets file memories and validates missing ids", async () => {
    const repository = createRepository();
    const tools = buildPluginTools(repository, createRetriever(), {
      getOverview: () => baseOverview,
      flushAll: async () => ({
        l0Captured: 0,
        l1Created: 0,
        l2TimeUpdated: 0,
        l2ProjectUpdated: 0,
        profileUpdated: 0,
        failed: 0,
      }),
      runDream: async () => ({
        prepFlush: {
          l0Captured: 0,
          l1Created: 0,
          l2TimeUpdated: 0,
          l2ProjectUpdated: 0,
          profileUpdated: 0,
          failed: 0,
        },
        reviewedL1: 1,
        rewrittenProjects: 1,
        deletedProjects: 0,
        profileUpdated: false,
        duplicateTopicCount: 0,
        conflictTopicCount: 0,
        prunedProjectL1Refs: 0,
        prunedProfileL1Refs: 0,
        summary: "ok",
      }),
    });
    const memoryGet = tools.find((tool) => tool.name === "memory_get");
    expect(memoryGet).toBeDefined();

    const ok = await memoryGet!.execute("call-7", { ids: ["projects/clawxmemory/Project/overview.md"] });
    expect(ok.details).toMatchObject({
      ok: true,
      foundIds: ["projects/clawxmemory/Project/overview.md"],
      missingIds: [],
      count: 1,
    });

    const missingIds = await memoryGet!.execute("call-8", { ids: [] });
    expect(missingIds.details).toMatchObject({ ok: false });
  });
});
