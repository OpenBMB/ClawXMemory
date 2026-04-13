import { afterEach, describe, expect, it, vi } from "vitest";
import { ReasoningRetriever } from "../src/core/index.js";

function createSettings(overrides: Record<string, unknown> = {}) {
  return {
    reasoningMode: "accuracy_first",
    recallTopK: 5,
    autoIndexIntervalMinutes: 60,
    autoDreamIntervalMinutes: 360,
    autoDreamMinTmpEntries: 10,
    dreamProjectRebuildTimeoutMs: 180_000,
    ...overrides,
  };
}

function createProjectMeta(overrides: Record<string, unknown> = {}) {
  return {
    projectId: "project_clawxmemory",
    projectName: "clawxmemory",
    description: "ClawXMemory memory refactor",
    aliases: ["clawxmemory", "memory refactor"],
    status: "active",
    createdAt: "2026-04-09T00:00:00.000Z",
    updatedAt: "2026-04-09T00:00:00.000Z",
    relativePath: "projects/project_clawxmemory/project.meta.md",
    absolutePath: "/tmp/projects/project_clawxmemory/project.meta.md",
    ...overrides,
  };
}

function createHeaderEntry(overrides: Record<string, unknown> = {}) {
  return {
    name: "current-stage",
    description: "Project progress memory.",
    type: "project",
    scope: "project",
    projectId: "project_clawxmemory",
    updatedAt: "2026-04-09T00:00:00.000Z",
    file: "current-stage.md",
    relativePath: "projects/project_clawxmemory/Project/current-stage.md",
    absolutePath: "/tmp/projects/project_clawxmemory/Project/current-stage.md",
    ...overrides,
  };
}

function createMemoryRecord(overrides: Record<string, unknown> = {}) {
  return {
    ...createHeaderEntry(),
    content: "## Current Stage\nMemory refactor is in progress.",
    preview: "Memory refactor is in progress.",
    ...overrides,
  };
}

function createUserSummary(overrides: Record<string, unknown> = {}) {
  return {
    profile: "The user prefers concise Chinese answers.",
    preferences: ["中文", "先结论后展开"],
    constraints: [],
    relationships: [],
    files: [{
      name: "user-profile",
      description: "Stable user profile",
      type: "user",
      scope: "global",
      updatedAt: "2026-04-09T00:00:00.000Z",
      file: "user-profile.md",
      relativePath: "global/User/user-profile.md",
      absolutePath: "/tmp/global/User/user-profile.md",
    }],
    ...overrides,
  };
}

function createStore(overrides: Record<string, unknown> = {}) {
  return {
    getUserSummary: vi.fn().mockReturnValue(createUserSummary()),
    listProjectMetas: vi.fn().mockReturnValue([createProjectMeta()]),
    scanRecallHeaderEntries: vi.fn().mockReturnValue([]),
    getFullMemoryRecordsByIds: vi.fn().mockReturnValue([]),
    ...overrides,
  };
}

function createRepository(overrides: Record<string, unknown> = {}) {
  const store = createStore(overrides.store as Record<string, unknown> | undefined);
  return {
    store,
    repository: {
      getSnapshotVersion: vi.fn().mockReturnValue("snapshot-1"),
      getFileMemoryStore: vi.fn().mockReturnValue(store),
      ...(overrides.repository as Record<string, unknown> | undefined),
    },
  };
}

function createExtractor(overrides: Record<string, unknown> = {}) {
  return {
    decideFileMemoryRoute: vi.fn().mockResolvedValue("project_memory"),
    selectRecallProject: vi.fn().mockResolvedValue({ projectId: "project_clawxmemory", reason: "query_explicit_project" }),
    selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_clawxmemory/Project/current-stage.md"]),
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReasoningRetriever", () => {
  it("skips recall when the memory gate returns none", async () => {
    const { repository, store } = createRepository();
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("none"),
    });
    const retriever = new ReasoningRetriever(
      repository as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("今天天气怎么样", { retrievalMode: "explicit" });

    expect(result.intent).toBe("none");
    expect(result.context).toBe("");
    expect(result.trace?.steps.map((step) => step.kind)).toEqual([
      "recall_start",
      "memory_gate",
      "recall_skipped",
      "context_rendered",
    ]);
    expect(store.scanRecallHeaderEntries).not.toHaveBeenCalled();
  });

  it("builds header-scan recall and renders the selected memory files", async () => {
    const header = createHeaderEntry();
    const { repository, store } = createRepository({
      store: {
        scanRecallHeaderEntries: vi.fn().mockReturnValue([header]),
        getFullMemoryRecordsByIds: vi.fn().mockReturnValue([createMemoryRecord()]),
      },
    });
    const extractor = createExtractor();
    const retriever = new ReasoningRetriever(
      repository as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("这个项目现在到哪一步了", {
      retrievalMode: "explicit",
      workspaceHint: "/tmp/clawxmemory",
      recentMessages: [
        { role: "assistant", content: "我们继续。" },
        { role: "user", content: "继续聊这个项目。" },
      ],
    });

    expect(store.scanRecallHeaderEntries).toHaveBeenCalledWith({
      projectId: "project_clawxmemory",
      kinds: ["feedback", "project"],
      limit: 200,
    });
    expect(store.getFullMemoryRecordsByIds).toHaveBeenCalledWith([
      "projects/project_clawxmemory/Project/current-stage.md",
    ]);
    expect(result.intent).toBe("project_memory");
    expect(result.context).toContain("global/User/user-profile.md");
    expect(result.context).toContain("projects/project_clawxmemory/project.meta.md");
    expect(result.context).toContain("projects/project_clawxmemory/Project/current-stage.md");
    expect(result.debug).toMatchObject({
      route: "project_memory",
      manifestCount: 1,
      resolvedProjectId: "project_clawxmemory",
      selectedFileIds: ["projects/project_clawxmemory/Project/current-stage.md"],
    });
    expect(result.trace?.steps.map((step) => step.kind)).toEqual([
      "recall_start",
      "memory_gate",
      "user_base_loaded",
      "project_shortlist_built",
      "project_selected",
      "manifest_scanned",
      "manifest_selected",
      "files_loaded",
      "context_rendered",
    ]);
    const manifestScanned = result.trace?.steps.find((step) => step.kind === "manifest_scanned");
    expect(manifestScanned?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Manifest Scan" }),
      expect.objectContaining({ label: "Sorted Candidates" }),
    ]));
    const projectSelected = result.trace?.steps.find((step) => step.kind === "project_selected");
    expect(projectSelected?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Project Selection" }),
      expect.objectContaining({ label: "Shortlist Candidates" }),
    ]));
  });

  it("reuses the cached result when the query and snapshot are unchanged", async () => {
    const { repository, store } = createRepository({
      store: {
        scanRecallHeaderEntries: vi.fn().mockReturnValue([createHeaderEntry()]),
        getFullMemoryRecordsByIds: vi.fn().mockReturnValue([createMemoryRecord({
          content: "## Current Stage\nCached project memory.",
          preview: "Cached project memory.",
        })]),
      },
    });
    const extractor = createExtractor();
    const retriever = new ReasoningRetriever(
      repository as never,
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
    expect(store.scanRecallHeaderEntries).toHaveBeenCalledTimes(1);
  });

  it("decodes escaped unicode in recall queries before writing trace details", async () => {
    const { repository } = createRepository();
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("user"),
    });
    const retriever = new ReasoningRetriever(
      repository as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("\\u6211\\u5e73\\u65f6\\u66f4\\u4e60\\u60ef\\u4ec0\\u4e48\\u8bed\\u8a00\\u4ea4\\u6d41\\uff1f", {
      retrievalMode: "explicit",
    });

    expect(result.query).toBe("我平时更习惯什么语言交流？");
    expect(result.trace?.query).toBe("我平时更习惯什么语言交流？");
    const recallStart = result.trace?.steps.find((step) => step.kind === "recall_start");
    expect(recallStart?.inputSummary).toBe("我平时更习惯什么语言交流？");
  });

  it("uses only recent user messages for project selection context", async () => {
    const cityMeta = createProjectMeta({
      projectId: "project_citycoffee",
      projectName: "城市咖啡探店爆文",
      description: "给本地生活博主批量生成咖啡店和餐厅探店小红书文案",
      aliases: ["城市咖啡探店爆文"],
      relativePath: "projects/project_citycoffee/project.meta.md",
      absolutePath: "/tmp/projects/project_citycoffee/project.meta.md",
    });
    const maternityMeta = createProjectMeta({
      projectId: "project_maternity",
      projectName: "母婴好物种草",
      description: "给母婴博主批量生成小红书图文和口播脚本",
      aliases: ["母婴好物种草"],
      updatedAt: "2026-04-10T00:00:01.000Z",
      relativePath: "projects/project_maternity/project.meta.md",
      absolutePath: "/tmp/projects/project_maternity/project.meta.md",
    });
    const { repository, store } = createRepository({
      store: {
        listProjectMetas: vi.fn().mockReturnValue([cityMeta, maternityMeta]),
        scanRecallHeaderEntries: vi.fn().mockReturnValue([createHeaderEntry({
          projectId: "project_citycoffee",
          name: "city-coffee",
          description: "咖啡探店项目当前阶段",
          relativePath: "projects/project_citycoffee/Project/city-coffee.md",
          absolutePath: "/tmp/projects/project_citycoffee/Project/city-coffee.md",
        })]),
        getFullMemoryRecordsByIds: vi.fn().mockReturnValue([createMemoryRecord({
          projectId: "project_citycoffee",
          name: "city-coffee",
          description: "咖啡探店项目当前阶段",
          relativePath: "projects/project_citycoffee/Project/city-coffee.md",
          absolutePath: "/tmp/projects/project_citycoffee/Project/city-coffee.md",
        })]),
      },
    });
    const extractor = createExtractor({
      selectRecallProject: vi.fn().mockResolvedValue({ projectId: "project_citycoffee", reason: "query_mentions_project_name" }),
      selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_citycoffee/Project/city-coffee.md"]),
    });
    const retriever = new ReasoningRetriever(
      repository as never,
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

    expect(extractor.selectRecallProject).toHaveBeenCalledWith(expect.objectContaining({
      query: "我们继续聊 城市咖啡探店爆文。这个项目现在的阶段、下一步，以及你应该怎么给我交付？",
      recentUserMessages: [{ role: "user", content: "母婴好物种草目前在测试中。" }],
    }));
    expect(store.scanRecallHeaderEntries).toHaveBeenCalledWith({
      projectId: "project_citycoffee",
      kinds: ["feedback", "project"],
      limit: 200,
    });
    expect(result.debug?.resolvedProjectId).toBe("project_citycoffee");
  });

  it("uses recent user context when the current query only has a generic project anchor", async () => {
    const borealMeta = createProjectMeta({
      projectId: "project_boreal",
      projectName: "Boreal",
      description: "本地知识库整理工具",
      aliases: ["boreal"],
      relativePath: "projects/project_boreal/project.meta.md",
      absolutePath: "/tmp/projects/project_boreal/project.meta.md",
    });
    const { repository, store } = createRepository({
      store: {
        listProjectMetas: vi.fn().mockReturnValue([borealMeta]),
        scanRecallHeaderEntries: vi.fn().mockReturnValue([createHeaderEntry({
          projectId: "project_boreal",
          name: "boreal",
          description: "目前还在设计阶段。",
          relativePath: "projects/project_boreal/Project/boreal.md",
          absolutePath: "/tmp/projects/project_boreal/Project/boreal.md",
        })]),
        getFullMemoryRecordsByIds: vi.fn().mockReturnValue([createMemoryRecord({
          projectId: "project_boreal",
          name: "boreal",
          description: "目前还在设计阶段。",
          content: "## Current Stage\n目前还在设计阶段。",
          preview: "目前还在设计阶段。",
          relativePath: "projects/project_boreal/Project/boreal.md",
          absolutePath: "/tmp/projects/project_boreal/Project/boreal.md",
        })]),
      },
    });
    const extractor = createExtractor({
      selectRecallProject: vi.fn().mockResolvedValue({ projectId: "project_boreal", reason: "recent_user_context" }),
      selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_boreal/Project/boreal.md"]),
    });
    const retriever = new ReasoningRetriever(
      repository as never,
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

    expect(store.scanRecallHeaderEntries).toHaveBeenCalledWith({
      projectId: "project_boreal",
      kinds: ["feedback", "project"],
      limit: 200,
    });
    expect(result.debug?.resolvedProjectId).toBe("project_boreal");
  });

  it("sorts project_memory manifests only by updatedAt without forcing project over feedback", async () => {
    const feedbackEntry = createHeaderEntry({
      type: "feedback",
      name: "delivery-rule",
      description: "先标题后正文再封面文案",
      updatedAt: "2026-04-11T00:00:00.000Z",
      relativePath: "projects/project_clawxmemory/Feedback/delivery-rule.md",
      absolutePath: "/tmp/projects/project_clawxmemory/Feedback/delivery-rule.md",
    });
    const projectEntry = createHeaderEntry({
      type: "project",
      name: "current-stage",
      description: "项目当前阶段",
      updatedAt: "2026-04-10T00:00:00.000Z",
    });
    const { repository } = createRepository({
      store: {
        scanRecallHeaderEntries: vi.fn().mockReturnValue([projectEntry, feedbackEntry]),
        getFullMemoryRecordsByIds: vi.fn().mockReturnValue([]),
      },
    });
    const selectFileManifestEntries = vi.fn().mockResolvedValue([]);
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("project_memory"),
      selectFileManifestEntries,
    });
    const retriever = new ReasoningRetriever(
      repository as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    await retriever.retrieve("这个项目现在的阶段、下一步，以及你应该怎么给我交付？", {
      retrievalMode: "explicit",
      recentMessages: [
        { role: "user", content: "这个项目先叫 clawxmemory，目前在重构 recall。" },
      ],
    });

    const manifestArg = selectFileManifestEntries.mock.calls[0]?.[0]?.manifest;
    expect(manifestArg.map((entry: { relativePath: string }) => entry.relativePath)).toEqual([
      "projects/project_clawxmemory/Feedback/delivery-rule.md",
      "projects/project_clawxmemory/Project/current-stage.md",
    ]);
  });

  it("lets feedback-only recall load feedback files through project_memory", async () => {
    const feedbackEntry = createHeaderEntry({
      type: "feedback",
      name: "delivery-rule",
      description: "先标题后正文再封面文案",
      updatedAt: "2026-04-11T00:00:00.000Z",
      relativePath: "projects/project_clawxmemory/Feedback/delivery-rule.md",
      absolutePath: "/tmp/projects/project_clawxmemory/Feedback/delivery-rule.md",
    });
    const feedbackRecord = createMemoryRecord({
      type: "feedback",
      name: "delivery-rule",
      description: "先标题后正文再封面文案",
      content: "## Rule\n先标题，再正文，最后封面文案。",
      preview: "先标题，再正文，最后封面文案。",
      relativePath: "projects/project_clawxmemory/Feedback/delivery-rule.md",
      absolutePath: "/tmp/projects/project_clawxmemory/Feedback/delivery-rule.md",
    });
    const { repository, store } = createRepository({
      store: {
        scanRecallHeaderEntries: vi.fn().mockReturnValue([feedbackEntry]),
        getFullMemoryRecordsByIds: vi.fn().mockReturnValue([feedbackRecord]),
      },
    });
    const extractor = createExtractor({
      decideFileMemoryRoute: vi.fn().mockResolvedValue("project_memory"),
      selectFileManifestEntries: vi.fn().mockResolvedValue(["projects/project_clawxmemory/Feedback/delivery-rule.md"]),
    });
    const retriever = new ReasoningRetriever(
      repository as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("这个项目你应该怎么给我交付？", {
      retrievalMode: "explicit",
      recentMessages: [
        { role: "user", content: "这个项目先叫 clawxmemory，目前在重构 recall。" },
      ],
    });

    expect(store.scanRecallHeaderEntries).toHaveBeenCalledWith({
      projectId: "project_clawxmemory",
      kinds: ["feedback", "project"],
      limit: 200,
    });
    expect(result.intent).toBe("project_memory");
    expect(result.context).toContain("projects/project_clawxmemory/Feedback/delivery-rule.md");
    expect(result.debug).toMatchObject({
      route: "project_memory",
      selectedFileIds: ["projects/project_clawxmemory/Feedback/delivery-rule.md"],
    });
  });

  it("falls back to user-only recall when project selection is ambiguous", async () => {
    const { repository, store } = createRepository({
      store: {
        listProjectMetas: vi.fn().mockReturnValue([
          createProjectMeta({
            projectId: "project_a",
            projectName: "城市咖啡探店爆文",
            aliases: ["城市咖啡探店爆文"],
            relativePath: "projects/project_a/project.meta.md",
            absolutePath: "/tmp/projects/project_a/project.meta.md",
          }),
          createProjectMeta({
            projectId: "project_b",
            projectName: "城市咖啡馆探店爆文",
            aliases: ["城市咖啡馆探店爆文"],
            updatedAt: "2026-04-10T00:00:01.000Z",
            relativePath: "projects/project_b/project.meta.md",
            absolutePath: "/tmp/projects/project_b/project.meta.md",
          }),
        ]),
      },
    });
    const extractor = createExtractor({
      selectRecallProject: vi.fn().mockResolvedValue({}),
    });
    const retriever = new ReasoningRetriever(
      repository as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("这个项目现在怎么样了？", {
      retrievalMode: "explicit",
    });

    expect(store.scanRecallHeaderEntries).not.toHaveBeenCalled();
    expect(result.debug?.resolvedProjectId).toBeUndefined();
    expect(result.context).toContain("global/User/user-profile.md");
    expect(result.context).not.toContain("project.meta.md");
  });

  it("prefers full text loading and shows truncation when a file exceeds recall budgets", async () => {
    const longContent = `# Long Memory\n\n${"A".repeat(12_500)}`;
    const { repository } = createRepository({
      store: {
        scanRecallHeaderEntries: vi.fn().mockReturnValue([createHeaderEntry()]),
        getFullMemoryRecordsByIds: vi.fn().mockReturnValue([createMemoryRecord({
          content: longContent,
          preview: `${"A".repeat(120)}...`,
        })]),
      },
    });
    const extractor = createExtractor();
    const retriever = new ReasoningRetriever(
      repository as never,
      extractor as never,
      { getSettings: () => createSettings() },
    );

    const result = await retriever.retrieve("这个项目的完整情况是什么？", {
      retrievalMode: "explicit",
    });

    expect(result.context).toContain("...[truncated for recall budget]");
    const filesLoaded = result.trace?.steps.find((step) => step.kind === "files_loaded");
    expect(filesLoaded?.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Truncated Files" }),
    ]));
  });
});
