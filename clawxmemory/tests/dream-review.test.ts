import { mkdtemp, rm, unlink, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DreamRewriteRunner, LlmMemoryExtractor, MemoryRepository } from "../src/core/index.js";

describe("DreamRewriteRunner", () => {
  const cleanupPaths: string[] = [];

  afterEach(async () => {
    await Promise.all(cleanupPaths.splice(0).map((target) => rm(target, { recursive: true, force: true })));
  });

  it("returns a no-op summary when no file-based memory exists", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-dream-"));
    cleanupPaths.push(dir);
    const repository = new MemoryRepository(join(dir, "memory.sqlite"), {
      memoryDir: join(dir, "memory"),
    });
    const runner = new DreamRewriteRunner(repository, {
      reviewDream: async () => ({ summary: "", projectRebuild: [], profileSuggestions: [], cleanup: [], ambiguous: [], noAction: [] }),
    } as never as LlmMemoryExtractor);

    const result = await runner.run();

    expect(result).toMatchObject({
      reviewedL1: 0,
      rewrittenProjects: 0,
      profileUpdated: false,
    });
    expect(result.summary).toContain("No file-based memory exists yet");
    repository.close();
  });

  it("promotes tmp project memories into a formal project and rebuilds manifests", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-dream-"));
    cleanupPaths.push(dir);
    const memoryDir = join(dir, "memory");
    const repository = new MemoryRepository(join(dir, "memory.sqlite"), { memoryDir });
    const store = repository.getFileMemoryStore();
    store.upsertCandidate({
      type: "user",
      scope: "global",
      name: "user-profile",
      description: "Stable user profile.",
      summary: "The user prefers direct engineering language.",
      preferences: ["中文"],
    });
    store.upsertCandidate({
      type: "feedback",
      scope: "project",
      name: "review-style",
      description: "This project needs engineering-style review notes.",
      rule: "For this project, start with findings and concrete risks.",
      why: "The project is in an architecture refactor stage.",
      howToApply: "Focus on regressions and missing tests.",
    });
    store.upsertCandidate({
      type: "project",
      scope: "project",
      name: "ClawXMemory memory refactor",
      description: "Memory refactor progress for ClawXMemory.",
      stage: "The file-based memory migration is in progress.",
      nextSteps: ["Wire retriever and tools to the new memory files."],
      timeline: ["2026-04-09: started the file-memory refactor."],
    });

    await unlink(join(memoryDir, "global", "MEMORY.md"));
    await unlink(join(memoryDir, "projects", "_tmp", "MEMORY.md"));

    const runner = new DreamRewriteRunner(repository, {} as never as LlmMemoryExtractor);
    const result = await runner.run();

    await expect(access(join(memoryDir, "global", "MEMORY.md"))).resolves.toBeUndefined();
    const projectIds = store.listProjectIds().filter((projectId) => projectId !== "_tmp");
    expect(projectIds).toHaveLength(1);
    const projectId = projectIds[0]!;
    await expect(access(join(memoryDir, "projects", projectId, "MEMORY.md"))).resolves.toBeUndefined();
    await expect(access(join(memoryDir, "projects", projectId, "project.meta.md"))).resolves.toBeUndefined();
    const meta = store.getProjectMeta(projectId);
    expect(meta?.projectName).toBe("ClawXMemory memory refactor");
    expect(meta?.description).toBe("Memory refactor progress for ClawXMemory.");
    expect(store.listTmpEntries()).toHaveLength(0);
    expect(result.reviewedL1).toBe(3);
    expect(result.rewrittenProjects).toBe(1);
    expect(result.summary).toContain("Dream reviewed 3 memory files");
    expect(result.summary).toContain("Promoted 2 temporary project memories into 1 formal projects");
    repository.close();
  });

  it("keeps unresolved tmp project memories in separate files even when they share a generic name", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-dream-"));
    cleanupPaths.push(dir);
    const repository = new MemoryRepository(join(dir, "memory.sqlite"), {
      memoryDir: join(dir, "memory"),
    });
    const store = repository.getFileMemoryStore();

    store.upsertCandidate({
      type: "project",
      scope: "project",
      name: "overview",
      description: "Project A progress",
      stage: "Project A is in discovery.",
    });
    store.upsertCandidate({
      type: "project",
      scope: "project",
      name: "overview",
      description: "Project B progress",
      stage: "Project B is in implementation.",
    });

    const tmpEntries = store.listTmpEntries(20).filter((entry) => entry.type === "project");
    expect(tmpEntries).toHaveLength(2);
    expect(new Set(tmpEntries.map((entry) => entry.file)).size).toBe(2);
    repository.close();
  });

  it("promotes feedback-only tmp memory into a formal project instead of dropping it", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-dream-"));
    cleanupPaths.push(dir);
    const repository = new MemoryRepository(join(dir, "memory.sqlite"), {
      memoryDir: join(dir, "memory"),
    });
    const store = repository.getFileMemoryStore();

    store.upsertCandidate({
      type: "feedback",
      scope: "project",
      name: "api-review-style",
      description: "This API redesign needs stricter contract reviews.",
      rule: "Review API contracts before implementation in this project.",
      why: "The project is changing retrieval and tool boundaries quickly.",
      howToApply: "Start every review from contract drift and compatibility risk.",
    });

    const runner = new DreamRewriteRunner(repository, {} as never as LlmMemoryExtractor);
    const result = await runner.run();

    const projectIds = store.listProjectIds().filter((projectId) => projectId !== "_tmp");
    expect(projectIds).toHaveLength(1);
    expect(store.listTmpEntries()).toHaveLength(0);
    expect(result.rewrittenProjects).toBe(1);
    expect(result.summary).toContain("Promoted 1 temporary project memories into 1 formal projects");
    repository.close();
  });

  it("uses session and time proximity to attach tmp feedback to the right tmp project", async () => {
    const dir = await mkdtemp(join(tmpdir(), "clawxmemory-dream-"));
    cleanupPaths.push(dir);
    const repository = new MemoryRepository(join(dir, "memory.sqlite"), {
      memoryDir: join(dir, "memory"),
    });
    const store = repository.getFileMemoryStore();

    store.upsertCandidate({
      type: "project",
      scope: "project",
      name: "Aster",
      description: "OpenClaw memory migration",
      capturedAt: "2026-04-09T09:25:00.000Z",
      sourceSessionKey: "session-aster",
      stage: "Move the memory system to markdown files.",
    });
    store.upsertCandidate({
      type: "feedback",
      scope: "project",
      name: "collaboration-rule",
      description: "同步进展时要非常工程化。",
      capturedAt: "2026-04-09T09:26:00.000Z",
      sourceSessionKey: "session-aster",
      rule: "先说完成了什么，再说风险，不要写成泛泛总结。",
      why: "This guidance belongs to the same active project discussion.",
      howToApply: "Use engineering-style status updates.",
    });

    const runner = new DreamRewriteRunner(repository, {} as never as LlmMemoryExtractor);
    const result = await runner.run();

    const projectIds = store.listProjectIds().filter((projectId) => projectId !== "_tmp");
    expect(projectIds).toHaveLength(1);
    const projectId = projectIds[0]!;
    const entries = store.listMemoryEntries({ scope: "project", projectId, limit: 20 });
    expect(entries.map((entry) => entry.type).sort()).toEqual(["feedback", "project"]);
    expect(store.listTmpEntries()).toHaveLength(0);
    expect(result.rewrittenProjects).toBe(1);
    repository.close();
  });
});
