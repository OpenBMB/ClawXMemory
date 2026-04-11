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
    countMemoryEntries: vi.fn().mockReturnValue(0),
    listMemoryEntries: vi.fn().mockReturnValue([]),
    getMemoryRecordsByIds: vi.fn().mockReturnValue([]),
    getFileMemoryStore: vi.fn().mockReturnValue({
      getUserSummary: vi.fn().mockReturnValue({
        profile: "The user prefers concise Chinese answers.",
        preferences: ["中文", "先结论后展开"],
        constraints: [],
        relationships: [],
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
      countMemoryEntries: vi.fn().mockReturnValue(1),
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
    expect(repository.countMemoryEntries).toHaveBeenCalledWith({
      kinds: ["project"],
      projectId: "project_clawxmemory",
      scope: "project",
    });
    expect(repository.getMemoryRecordsByIds).toHaveBeenCalledWith(
      ["projects/project_clawxmemory/Project/overview.md"],
      80,
    );
    expect(result.intent).toBe("project");
    expect(result.enoughAt).toBe("file");
    expect(result.context).toContain("global/User/user-profile.md");
    expect(result.context).toContain("## Profile");
    expect(result.context).not.toContain("## Notes");
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
    const manifestBuilt = result.trace?.steps.find((step) => step.kind === "manifest_built");
    expect(manifestBuilt?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Manifest" }),
      expect.objectContaining({ label: "Sorted Candidates" }),
    ]));
    const projectResolved = result.trace?.steps.find((step) => step.kind === "project_resolved");
    expect(projectResolved?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Project Resolution" }),
      expect.objectContaining({ label: "Resolver Candidate Scores" }),
    ]));
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

  it("decodes escaped unicode in recall queries before writing trace details", async () => {
    const manifest = [createManifestEntry()];
    const repository = createRepository({
      countMemoryEntries: vi.fn().mockReturnValue(1),
      listMemoryEntries: vi.fn().mockReturnValue(manifest),
      getMemoryRecordsByIds: vi.fn().mockReturnValue([]),
    });
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("project"),
      selectFileManifestEntries: vi.fn().mockResolvedValue([]),
    });

    const retriever = new ReasoningRetriever(
      repository as never,
      createSkillsRuntime() as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("\\u8fd9\\u4e2a\\u9879\\u76ee\\u5148\\u53eb \\u590f\\u65e5\\u996e\\u54c1\\u6d4b\\u8bc4\\u3002", {
      retrievalMode: "explicit",
      workspaceHint: "/tmp/clawxmemory",
    });

    expect(result.query).toBe("这个项目先叫 夏日饮品测评。");
    expect(result.trace?.query).toBe("这个项目先叫 夏日饮品测评。");
    const recallStart = result.trace?.steps.find((step) => step.kind === "recall_start");
    expect(recallStart?.inputSummary).toBe("这个项目先叫 夏日饮品测评。");
    expect(recallStart?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: "Recall Inputs",
        entries: expect.arrayContaining([
          expect.objectContaining({ label: "query", value: "这个项目先叫 夏日饮品测评。" }),
        ]),
      }),
    ]));
  });

  it("prefers an explicit project mention in the current query over noisy recent messages", async () => {
    const manifest = [createManifestEntry({
      name: "城市咖啡探店爆文",
      description: "给本地生活博主批量生成咖啡店和餐厅探店小红书文案",
      projectId: "project_citycoffee",
      relativePath: "projects/project_citycoffee/Project/city-coffee.md",
      absolutePath: "/tmp/projects/project_citycoffee/Project/city-coffee.md",
    })];
    const repository = createRepository({
      listMemoryEntries: vi.fn().mockReturnValue(manifest),
      getMemoryRecordsByIds: vi.fn().mockReturnValue([
        {
          ...manifest[0],
          content: "## Current Stage\n规划中。",
          preview: "规划中。",
        },
      ]),
      getFileMemoryStore: vi.fn().mockReturnValue({
        getUserSummary: vi.fn().mockReturnValue({
          profile: "",
          preferences: [],
          constraints: [],
          relationships: [],
          files: [],
        }),
        listProjectMetas: vi.fn().mockReturnValue([
          {
            projectId: "project_citycoffee",
            projectName: "城市咖啡探店爆文",
            description: "给本地生活博主批量生成咖啡店和餐厅探店小红书文案",
            aliases: ["城市咖啡探店爆文"],
            status: "active",
            createdAt: "2026-04-10T00:00:00.000Z",
            updatedAt: "2026-04-10T00:00:00.000Z",
            relativePath: "projects/project_citycoffee/project.meta.md",
            absolutePath: "/tmp/projects/project_citycoffee/project.meta.md",
          },
          {
            projectId: "project_maternity",
            projectName: "母婴好物种草",
            description: "测试中",
            aliases: ["母婴好物种草", "测试中"],
            status: "active",
            createdAt: "2026-04-10T00:00:00.000Z",
            updatedAt: "2026-04-10T00:00:01.000Z",
            relativePath: "projects/project_maternity/project.meta.md",
            absolutePath: "/tmp/projects/project_maternity/project.meta.md",
          },
        ]),
      }),
    });
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("project"),
      selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_citycoffee/Project/city-coffee.md"]),
    });

    const retriever = new ReasoningRetriever(
      repository as never,
      createSkillsRuntime() as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("我们继续聊 城市咖啡探店爆文。这个项目现在的阶段、下一步，以及你应该怎么给我交付？", {
      retrievalMode: "explicit",
      recentMessages: [
        { role: "assistant", content: "刚才我们在聊母婴好物种草。" },
        { role: "user", content: "母婴好物种草目前在测试中。" },
      ],
    });

    expect(repository.listMemoryEntries).toHaveBeenCalledWith({
      kinds: ["project"],
      projectId: "project_citycoffee",
      scope: "project",
      limit: 200,
    });
    expect(result.debug?.resolvedProjectId).toBe("project_citycoffee");
  });

  it("uses recent user context when the current query only has a generic project anchor", async () => {
    const manifest = [createManifestEntry({
      name: "boreal",
      description: "本地知识库整理工具",
      projectId: "project_boreal",
      relativePath: "projects/project_boreal/Project/boreal.md",
      absolutePath: "/tmp/projects/project_boreal/Project/boreal.md",
    })];
    const repository = createRepository({
      listMemoryEntries: vi.fn().mockReturnValue(manifest),
      getMemoryRecordsByIds: vi.fn().mockReturnValue([
        {
          ...manifest[0],
          content: "## Current Stage\n目前还在设计阶段。",
          preview: "目前还在设计阶段。",
        },
      ]),
      getFileMemoryStore: vi.fn().mockReturnValue({
        getUserSummary: vi.fn().mockReturnValue({
          profile: "",
          preferences: [],
          constraints: [],
          relationships: [],
          files: [],
        }),
        listProjectMetas: vi.fn().mockReturnValue([
          {
            projectId: "project_boreal",
            projectName: "Boreal",
            description: "本地知识库整理工具",
            aliases: ["boreal"],
            status: "active",
            createdAt: "2026-04-10T00:00:00.000Z",
            updatedAt: "2026-04-10T00:00:00.000Z",
            relativePath: "projects/project_boreal/project.meta.md",
            absolutePath: "/tmp/projects/project_boreal/project.meta.md",
          },
        ]),
      }),
    });
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("project"),
      selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_boreal/Project/boreal.md"]),
    });

    const retriever = new ReasoningRetriever(
      repository as never,
      createSkillsRuntime() as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("这个项目现在到哪一步了？", {
      retrievalMode: "explicit",
      recentMessages: [
        { role: "assistant", content: "好的。" },
        { role: "user", content: "这个项目先叫 Boreal。它是一个本地知识库整理工具，目前还在设计阶段。" },
      ],
    });

    expect(repository.listMemoryEntries).toHaveBeenCalledWith({
      kinds: ["project"],
      projectId: "project_boreal",
      scope: "project",
      limit: 200,
    });
    expect(result.debug?.resolvedProjectId).toBe("project_boreal");
  });

  it("prefers the latest formal project meta when duplicate Boreal identities exist", async () => {
    const manifest = [createManifestEntry({
      name: "boreal",
      description: "本地知识库整理工具",
      projectId: "project_new_boreal",
      relativePath: "projects/project_new_boreal/Project/boreal.md",
      absolutePath: "/tmp/projects/project_new_boreal/Project/boreal.md",
    })];
    const repository = createRepository({
      listMemoryEntries: vi.fn().mockReturnValue(manifest),
      getMemoryRecordsByIds: vi.fn().mockReturnValue([
        {
          ...manifest[0],
          content: "## Current Stage\n目前还在设计阶段。",
          preview: "目前还在设计阶段。",
        },
      ]),
      getFileMemoryStore: vi.fn().mockReturnValue({
        getUserSummary: vi.fn().mockReturnValue({
          profile: "",
          preferences: [],
          constraints: [],
          relationships: [],
          files: [],
        }),
        listProjectMetas: vi.fn().mockReturnValue([
          {
            projectId: "project_old_boreal",
            projectName: "Boreal",
            description: "旧的 Boreal 项目",
            aliases: ["boreal"],
            status: "active",
            createdAt: "2026-04-09T00:00:00.000Z",
            updatedAt: "2026-04-09T00:00:00.000Z",
            relativePath: "projects/project_old_boreal/project.meta.md",
            absolutePath: "/tmp/projects/project_old_boreal/project.meta.md",
          },
          {
            projectId: "project_new_boreal",
            projectName: "Boreal",
            description: "新的 Boreal 项目",
            aliases: ["boreal"],
            status: "active",
            createdAt: "2026-04-10T00:00:00.000Z",
            updatedAt: "2026-04-10T00:00:00.000Z",
            relativePath: "projects/project_new_boreal/project.meta.md",
            absolutePath: "/tmp/projects/project_new_boreal/project.meta.md",
          },
        ]),
      }),
    });
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("project"),
      selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_new_boreal/Project/boreal.md"]),
    });

    const retriever = new ReasoningRetriever(
      repository as never,
      createSkillsRuntime() as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("我们继续聊 Boreal", {
      retrievalMode: "explicit",
      workspaceHint: "/tmp/boreal",
    });

    expect(repository.listMemoryEntries).toHaveBeenCalledWith({
      kinds: ["project"],
      projectId: "project_new_boreal",
      scope: "project",
      limit: 200,
    });
    expect(result.debug?.resolvedProjectId).toBe("project_new_boreal");
  });
});
