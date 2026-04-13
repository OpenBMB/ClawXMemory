import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRepository } from "../src/core/index.js";

const repositories: MemoryRepository[] = [];

function createRepository(): MemoryRepository {
  const dir = mkdtempSync(join(tmpdir(), "clawxmemory-settings-"));
  const repository = new MemoryRepository(join(dir, "memory.sqlite"));
  repositories.push(repository);
  return repository;
}

afterEach(() => {
  while (repositories.length > 0) {
    repositories.pop()?.close();
  }
});

describe("MemoryRepository indexing settings", () => {
  it("drops legacy recallTopK and autoDreamMinTmpEntries values from persisted settings", () => {
    const repository = createRepository();
    const defaults = {
      reasoningMode: "answer_first" as const,
      autoIndexIntervalMinutes: 60,
      autoDreamIntervalMinutes: 360,
    };

    repository.setPipelineState("indexingSettings", {
      reasoningMode: "accuracy_first",
      recallTopK: 10,
      autoIndexIntervalMinutes: 60,
      autoDreamIntervalMinutes: 360,
      autoDreamMinTmpEntries: 10,
      dreamProjectRebuildTimeoutMs: 180_000,
    });

    expect(repository.getIndexingSettings(defaults)).toEqual({
      reasoningMode: "accuracy_first",
      autoIndexIntervalMinutes: 60,
      autoDreamIntervalMinutes: 360,
    });
  });

  it("fills in new auto scheduling defaults when reading legacy settings", () => {
    const repository = createRepository();
    const defaults = {
      reasoningMode: "answer_first" as const,
      autoIndexIntervalMinutes: 60,
      autoDreamIntervalMinutes: 360,
    };

    repository.saveIndexingSettings({
      reasoningMode: "accuracy_first",
    }, defaults);

    expect(repository.getIndexingSettings(defaults)).toEqual({
      reasoningMode: "accuracy_first",
      autoIndexIntervalMinutes: 60,
      autoDreamIntervalMinutes: 360,
    });
  });

  it("drops legacy dream rebuild timeout values from persisted settings", () => {
    const repository = createRepository();
    const defaults = {
      reasoningMode: "answer_first" as const,
      autoIndexIntervalMinutes: 60,
      autoDreamIntervalMinutes: 360,
    };

    expect(repository.saveIndexingSettings({
      dreamProjectRebuildTimeoutMs: 0,
    } as never, defaults)).toEqual(defaults);

    expect(repository.saveIndexingSettings({
      dreamProjectRebuildTimeoutMs: -1,
    } as never, defaults)).toEqual(defaults);

    expect(repository.saveIndexingSettings({
      dreamProjectRebuildTimeoutMs: "bad",
    } as never, defaults)).toEqual(defaults);
  });
});
