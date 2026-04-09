import { afterEach, describe, expect, it, vi } from "vitest";
import type { MemoryManifestEntry } from "../src/core/index.js";
import { ReasoningRetriever } from "../src/core/index.js";

function createSettings(overrides: Record<string, unknown> = {}) {
  return {
    reasoningMode: "accuracy_first",
    recallTopK: 5,
    autoIndexIntervalMinutes: 60,
    autoDreamIntervalMinutes: 360,
    autoDreamMinNewL1: 10,
    dreamProjectRebuildTimeoutMs: 180_000,
    ...overrides,
  };
}

function createSkillsRuntime() {
  return {
    intentRules: { timeKeywords: [], projectKeywords: [], factKeywords: [] },
    extractionRules: {
      projectPatterns: [],
      factRules: [],
      maxProjectTags: 8,
      maxFacts: 16,
      projectTagMinLength: 2,
      projectTagMaxLength: 50,
      summaryLimits: { head: 80, tail: 80, assistant: 80 },
    },
    projectStatusRules: { defaultStatus: "in_progress", rules: [] },
    contextTemplate: "",
    metadata: {
      source: "fallback" as const,
      skillsDir: "",
      errors: [],
    },
  };
}

function createManifestEntry(overrides: Partial<MemoryManifestEntry> = {}): MemoryManifestEntry {
  return {
    name: "overview",
    description: "Project progress memory.",
    type: "project",
    scope: "project",
    projectId: "project_clawxmemory",
    updatedAt: "2026-04-09T00:00:00.000Z",
    file: "overview.md",
    relativePath: "projects/project_clawxmemory/Project/overview.md",
    absolutePath: "/tmp/projects/project_clawxmemory/Project/overview.md",
    ...overrides,
  };
}

function createRepository(overrides: Record<string, unknown> = {}) {
  return {
    getSnapshotVersion: vi.fn().mockReturnValue("snapshot-1"),
    listMemoryEntries: vi.fn().mockReturnValue([]),
    getMemoryRecordsByIds: vi.fn().mockReturnValue([]),
    getFileMemoryStore: vi.fn().mockReturnValue({
      getUserSummary: vi.fn().mockReturnValue({
        summary: "The user prefers concise Chinese answers.",
        preferences: ["中文", "先结论后展开"],
        constraints: [],
        relationships: [],
        notes: [],
        files: [],
      }),
      listProjectMetas: vi.fn().mockReturnValue([{
        projectId: "project_clawxmemory",
        projectName: "clawxmemory",
        description: "ClawXMemory memory refactor",
        aliases: ["clawxmemory", "memory refactor"],
        status: "active",
        createdAt: "2026-04-09T00:00:00.000Z",
        updatedAt: "2026-04-09T00:00:00.000Z",
        relativePath: "projects/project_clawxmemory/project.meta.md",
        absolutePath: "/tmp/projects/project_clawxmemory/project.meta.md",
      }]),
    }),
    ...overrides,
  };
}

function createExtractor(overrides: Record<string, unknown> = {}) {
  return {
    decideFileMemoryRoute: vi.fn().mockResolvedValue("project"),
    selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_clawxmemory/Project/overview.md"]),
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReasoningRetriever", () => {
  it("skips recall when the memory gate returns none", async () => {
    const repository = createRepository();
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("none"),
    });

    const retriever = new ReasoningRetriever(
      repository as never,
      createSkillsRuntime() as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("今天天气怎么样", { retrievalMode: "explicit" });

    expect(result.intent).toBe("none");
    expect(result.enoughAt).toBe("none");
    expect(result.context).toBe("");
    expect(result.trace?.steps.map((step) => step.kind)).toEqual([
      "recall_start",
      "memory_gate",
      "recall_skipped",
      "context_rendered",
    ]);
    expect(repository.listMemoryEntries).not.toHaveBeenCalled();
  });

  it("builds manifest-first recall and renders the selected memory files", async () => {
    const manifest = [createManifestEntry()];
    const repository = createRepository({
      listMemoryEntries: vi.fn().mockReturnValue(manifest),
      getMemoryRecordsByIds: vi.fn().mockReturnValue([
        {
          ...manifest[0],
          content: "## Current Stage\nMemory refactor is in progress.",
          preview: "Memory refactor is in progress.",
        },
      ]),
    });
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("project"),
      selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_clawxmemory/Project/overview.md"]),
    });

    const retriever = new ReasoningRetriever(
      repository as never,
      createSkillsRuntime() as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("这个项目现在到哪一步了", {
      retrievalMode: "explicit",
      workspaceHint: "/tmp/clawxmemory",
    });

    expect(repository.listMemoryEntries).toHaveBeenCalledWith({
      kinds: ["project"],
      projectId: "project_clawxmemory",
      scope: "project",
      limit: 200,
    });
    expect(repository.getMemoryRecordsByIds).toHaveBeenCalledWith(
      ["projects/project_clawxmemory/Project/overview.md"],
      80,
    );
    expect(result.intent).toBe("project");
    expect(result.enoughAt).toBe("file");
    expect(result.context).toContain("global/User/user-profile.md");
    expect(result.context).toContain("projects/project_clawxmemory/Project/overview.md");
    expect(result.debug).toMatchObject({
      route: "project",
      manifestCount: 1,
      resolvedProjectId: "project_clawxmemory",
      selectedFileIds: ["projects/project_clawxmemory/Project/overview.md"],
    });
    expect(result.trace?.steps.map((step) => step.kind)).toEqual([
      "recall_start",
      "memory_gate",
      "user_base_loaded",
      "project_resolved",
      "manifest_built",
      "manifest_selected",
      "files_loaded",
      "context_rendered",
    ]);
  });

  it("reuses the cached result when the query and snapshot are unchanged", async () => {
    const manifest = [createManifestEntry()];
    const repository = createRepository({
      listMemoryEntries: vi.fn().mockReturnValue(manifest),
      getMemoryRecordsByIds: vi.fn().mockReturnValue([
        {
          ...manifest[0],
          content: "## Current Stage\nCached project memory.",
          preview: "Cached project memory.",
        },
      ]),
    });
    const extractor = createExtractor();
    const retriever = new ReasoningRetriever(
      repository as never,
      createSkillsRuntime() as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const first = await retriever.retrieve("项目进展", {
      retrievalMode: "explicit",
      workspaceHint: "/tmp/clawxmemory",
    });
    const second = await retriever.retrieve("项目进展", {
      retrievalMode: "explicit",
      workspaceHint: "/tmp/clawxmemory",
    });

    expect(first.context).toContain("Cached project memory");
    expect(second.debug?.cacheHit).toBe(true);
    expect(extractor.decideFileMemoryRoute).toHaveBeenCalledTimes(1);
    expect(repository.listMemoryEntries).toHaveBeenCalledTimes(1);
  });
});
