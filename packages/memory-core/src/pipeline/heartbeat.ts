import type { L0SessionRecord, MemoryMessage } from "../types.js";
import { buildL0IndexId, nowIso } from "../utils/id.js";
import { extractL1FromL0 } from "../indexers/l1-extractor.js";
import { buildL2ProjectsFromL1, buildL2TimeFromL1 } from "../indexers/l2-builder.js";
import { MemoryRepository } from "../storage/sqlite.js";

export interface HeartbeatOptions {
  batchSize?: number;
  source?: string;
}

export interface HeartbeatStats {
  l0Captured: number;
  l1Created: number;
  l2TimeUpdated: number;
  l2ProjectUpdated: number;
  factsUpdated: number;
}

export class HeartbeatIndexer {
  private readonly batchSize: number;
  private readonly source: string;

  constructor(private readonly repository: MemoryRepository, options: HeartbeatOptions = {}) {
    this.batchSize = options.batchSize ?? 30;
    this.source = options.source ?? "openclaw";
  }

  captureL0Session(input: {
    sessionKey: string;
    timestamp?: string;
    messages: MemoryMessage[];
    source?: string;
  }): L0SessionRecord {
    const timestamp = input.timestamp ?? nowIso();
    const payload = JSON.stringify(input.messages);
    const l0IndexId = buildL0IndexId(input.sessionKey, timestamp, payload);
    const record: L0SessionRecord = {
      l0IndexId,
      sessionKey: input.sessionKey,
      timestamp,
      messages: input.messages,
      source: input.source ?? this.source,
      indexed: false,
      createdAt: nowIso(),
    };
    this.repository.insertL0Session(record);
    return record;
  }

  runHeartbeat(): HeartbeatStats {
    const pending = this.repository.listUnindexedL0Sessions(this.batchSize);
    const indexedIds: string[] = [];
    const stats: HeartbeatStats = {
      l0Captured: pending.length,
      l1Created: 0,
      l2TimeUpdated: 0,
      l2ProjectUpdated: 0,
      factsUpdated: 0,
    };

    for (const l0 of pending) {
      const l1 = extractL1FromL0(l0);
      this.repository.insertL1Window(l1);
      this.repository.insertLink("l1", l1.l1IndexId, "l0", l0.l0IndexId);
      stats.l1Created += 1;

      const l2Time = buildL2TimeFromL1(l1);
      this.repository.upsertL2TimeIndex(l2Time);
      this.repository.insertLink("l2", l2Time.l2IndexId, "l1", l1.l1IndexId);
      stats.l2TimeUpdated += 1;

      const projectIndexes = buildL2ProjectsFromL1(l1);
      for (const l2Project of projectIndexes) {
        this.repository.upsertL2ProjectIndex(l2Project);
        this.repository.insertLink("l2", l2Project.l2IndexId, "l1", l1.l1IndexId);
        stats.l2ProjectUpdated += 1;
      }

      this.repository.upsertGlobalFacts(l1.facts, l1.l1IndexId);
      stats.factsUpdated += l1.facts.length;
      indexedIds.push(l0.l0IndexId);
    }

    this.repository.markL0Indexed(indexedIds);
    this.repository.setPipelineState("lastIndexedAt", nowIso());
    return stats;
  }
}
