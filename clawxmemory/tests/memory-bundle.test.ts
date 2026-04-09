import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  LEGACY_MEMORY_EXPORT_FORMAT_VERSION,
  MEMORY_EXPORT_FORMAT_VERSION,
  MemoryRepository,
  type GlobalProfileRecord,
  type L2ProjectIndexRecord,
} from "../src/core/index.js";

async function createRepositoryHarness() {
  const dir = await mkdtemp(join(tmpdir(), "clawxmemory-bundle-"));
  const repository = new MemoryRepository(join(dir, "memory.sqlite"), { memoryDir: join(dir, "memory") });
  return { dir, repository };
}

async function seedFileMemory(repository: MemoryRepository): Promise<void> {
  const store = repository.getFileMemoryStore();
  store.upsertCandidate({
    type: "user",
    scope: "global",
    name: "user-profile",
    description: "Prefers concise updates",
    summary: "Prefers concise updates and TypeScript-first examples.",
    preferences: ["TypeScript", "Lead with the outcome"],
  });
  store.upsertCandidate({
    type: "project",
    scope: "project",
    projectId: "project_alpha",
    name: "Alpha Retrieval",
    description: "Alpha retrieval refactor",
    stage: "Shipping the file-memory retriever",
    decisions: ["Use MEMORY.md as manifest"],
  });
  store.upsertCandidate({
    type: "feedback",
    scope: "project",
    projectId: "project_alpha",
    name: "review-style",
    description: "Keep status updates concise",
    rule: "Keep status updates concise",
    why: "Faster review",
    howToApply: "Lead with outcome, then key risk",
  });
  store.upsertCandidate({
    type: "project",
    scope: "project",
    projectId: "_tmp",
    name: "Unresolved Idea",
    description: "Pending project grouping",
    stage: "Still being grouped by Dream",
  });
  repository.setPipelineState("lastIndexedAt", "2026-04-09T08:00:00.000Z");
  repository.setPipelineState("lastDreamAt", "2026-04-09T08:30:00.000Z");
  repository.setPipelineState("lastDreamStatus", "success");
  repository.setPipelineState("lastDreamSummary", "Organized current file memories.");
}

describe("memory bundle import/export", () => {
  const cleanupDirs: string[] = [];
  const repositories: MemoryRepository[] = [];

  afterEach(async () => {
    for (const repository of repositories.splice(0)) {
      repository.close();
    }
    await Promise.all(cleanupDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  async function createRepository(): Promise<MemoryRepository> {
    const { dir, repository } = await createRepositoryHarness();
    cleanupDirs.push(dir);
    repositories.push(repository);
    return repository;
  }

  it("exports the file-memory bundle instead of legacy sqlite collections", async () => {
    const repository = await createRepository();
    await seedFileMemory(repository);

    const bundle = repository.exportMemoryBundle();

    expect(bundle.formatVersion).toBe(MEMORY_EXPORT_FORMAT_VERSION);
    expect("l0Sessions" in (bundle as Record<string, unknown>)).toBe(false);
    expect(bundle.projectMetas).toHaveLength(1);
    expect(bundle.memoryFiles).toHaveLength(4);
    expect(bundle.memoryFiles.some((record) => record.type === "user")).toBe(true);
    expect(bundle.memoryFiles.some((record) => record.type === "feedback")).toBe(true);
    expect(bundle.memoryFiles.some((record) => record.projectId === "_tmp")).toBe(true);
    expect(bundle.lastDreamStatus).toBe("success");
  });

  it("round-trips file-memory bundles into markdown truth", async () => {
    const source = await createRepository();
    await seedFileMemory(source);
    const bundle = source.exportMemoryBundle();

    const target = await createRepository();
    const result = target.importMemoryBundle(bundle);

    expect(result.formatVersion).toBe(MEMORY_EXPORT_FORMAT_VERSION);
    expect(result.imported.memoryFiles).toBe(4);
    expect(result.imported.projectMetas).toBe(1);
    expect(result.imported.project).toBe(1);
    expect(result.imported.feedback).toBe(1);
    expect(result.imported.user).toBe(1);
    expect(result.imported.tmp).toBe(1);
    expect(target.getPipelineState("lastIndexedAt")).toBe("2026-04-09T08:00:00.000Z");
    expect(target.getPipelineState("lastDreamStatus")).toBe("success");
    expect(target.listAllL0()).toHaveLength(0);

    const userSummary = target.getFileMemoryStore().getUserSummary();
    expect(userSummary.summary).toContain("Prefers concise updates");
    const projectEntries = target.listMemoryEntries({
      scope: "project",
      projectId: "project_alpha",
      limit: 20,
    });
    expect(projectEntries).toHaveLength(2);
    const tmpEntries = target.listMemoryEntries({
      scope: "project",
      projectId: "_tmp",
      includeTmp: true,
      limit: 20,
    });
    expect(tmpEntries).toHaveLength(1);
  });

  it("imports legacy bundles and synthesizes file-memory records", async () => {
    const repository = await createRepository();
    const legacyProject: L2ProjectIndexRecord = {
      l2IndexId: "l2-project-alpha",
      projectKey: "alpha-retrieval",
      projectName: "Alpha Retrieval",
      summary: "Alpha retrieval is moving to file-memory.",
      currentStatus: "in_progress",
      latestProgress: "Retriever now reads MEMORY.md first.",
      l1Source: ["l1-alpha"],
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T01:00:00.000Z",
    };
    const globalProfile: GlobalProfileRecord = {
      recordId: "global_profile_record",
      profileText: "The user prefers concise updates and practical code.",
      sourceL1Ids: [],
      createdAt: "2026-04-08T00:00:00.000Z",
      updatedAt: "2026-04-08T00:30:00.000Z",
    };

    const result = repository.importMemoryBundle({
      formatVersion: LEGACY_MEMORY_EXPORT_FORMAT_VERSION,
      exportedAt: "2026-04-09T09:00:00.000Z",
      lastIndexedAt: "2026-04-09T08:00:00.000Z",
      l0Sessions: [],
      l1Windows: [],
      l2TimeIndexes: [],
      l2ProjectIndexes: [legacyProject],
      globalProfile,
      indexLinks: [],
    });

    expect(result.formatVersion).toBe(LEGACY_MEMORY_EXPORT_FORMAT_VERSION);
    expect(result.imported.project).toBe(1);
    expect(result.imported.user).toBe(1);
    expect(result.imported.feedback).toBe(0);
    expect(result.imported.legacyL2Project).toBe(1);
    expect(repository.listAllL2Projects()).toHaveLength(1);
    expect(repository.getFileMemoryStore().listProjectMetas()).toHaveLength(1);
    const entries = repository.listMemoryEntries({ limit: 20 });
    expect(entries.some((entry) => entry.type === "user")).toBe(true);
    expect(entries.some((entry) => entry.type === "project")).toBe(true);
  });
});
