import type {
  IndexingSettings,
  L0SessionRecord,
  MemoryMessage,
} from "../types.js";
import { LlmMemoryExtractor } from "../skills/llm-extraction.js";
import { MemoryRepository } from "../storage/sqlite.js";
import { buildL0IndexId, nowIso } from "../utils/id.js";
import { hasExplicitRememberIntent } from "../../message-utils.js";

const LAST_INDEXED_AT_STATE_KEY = "lastIndexedAt" as const;

export interface HeartbeatOptions {
  batchSize?: number;
  source?: string;
  settings: IndexingSettings;
  logger?: {
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
  };
}

export interface HeartbeatRunOptions {
  batchSize?: number;
  sessionKeys?: string[];
  reason?: string;
}

export interface HeartbeatStats {
  l0Captured: number;
  l1Created: number;
  l2TimeUpdated: number;
  l2ProjectUpdated: number;
  profileUpdated: number;
  failed: number;
}

function sameMessage(left: MemoryMessage | undefined, right: MemoryMessage | undefined): boolean {
  if (!left || !right) return false;
  return left.role === right.role && left.content === right.content;
}

function hasNewContent(previous: MemoryMessage[], incoming: MemoryMessage[]): boolean {
  if (incoming.length === 0) return false;
  if (previous.length === 0) return true;
  if (incoming.length > previous.length) return true;
  for (let index = 0; index < incoming.length; index += 1) {
    if (!sameMessage(previous[index], incoming[index])) return true;
  }
  return false;
}

function emptyStats(): HeartbeatStats {
  return {
    l0Captured: 0,
    l1Created: 0,
    l2TimeUpdated: 0,
    l2ProjectUpdated: 0,
    profileUpdated: 0,
    failed: 0,
  };
}

export class HeartbeatIndexer {
  private readonly batchSize: number;
  private readonly source: string;
  private readonly logger: HeartbeatOptions["logger"];
  private settings: IndexingSettings;

  constructor(
    private readonly repository: MemoryRepository,
    private readonly extractor: LlmMemoryExtractor,
    options: HeartbeatOptions,
  ) {
    this.batchSize = options.batchSize ?? 30;
    this.source = options.source ?? "openclaw";
    this.settings = options.settings;
    this.logger = options.logger;
  }

  getSettings(): IndexingSettings {
    return { ...this.settings };
  }

  setSettings(settings: IndexingSettings): void {
    this.settings = { ...settings };
  }

  captureL0Session(input: {
    sessionKey: string;
    timestamp?: string;
    messages: MemoryMessage[];
    source?: string;
  }): L0SessionRecord | undefined {
    const timestamp = input.timestamp ?? nowIso();
    const recent = this.repository.listRecentL0(1)[0];
    if (recent?.sessionKey === input.sessionKey && !hasNewContent(recent.messages, input.messages)) {
      this.logger?.info?.(`[clawxmemory] skip duplicate l0 capture for session=${input.sessionKey}`);
      return undefined;
    }
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

  async runHeartbeat(options: HeartbeatRunOptions = {}): Promise<HeartbeatStats> {
    const stats = emptyStats();
    const sessions = this.repository.listUnindexedL0Sessions(
      Math.max(1, options.batchSize ?? this.batchSize),
      options.sessionKeys,
    );
    if (sessions.length === 0) return stats;

    const processedIds: string[] = [];
    for (const session of sessions) {
      try {
        const candidates = await this.extractor.extractFileMemoryCandidates({
          timestamp: session.timestamp,
          sessionKey: session.sessionKey,
          messages: session.messages,
          explicitRemember: hasExplicitRememberIntent(session.messages),
        });
        for (const candidate of candidates) {
          this.repository.getFileMemoryStore().upsertCandidate(candidate);
          stats.l1Created += 1;
          if (candidate.type === "project" || candidate.type === "feedback") {
            stats.l2ProjectUpdated += 1;
          } else {
            stats.profileUpdated += 1;
          }
        }
        processedIds.push(session.l0IndexId);
        stats.l0Captured += 1;
        this.repository.setPipelineState(LAST_INDEXED_AT_STATE_KEY, session.timestamp);
      } catch (error) {
        stats.failed += 1;
        this.logger?.warn?.(`[clawxmemory] heartbeat file-memory extraction failed for ${session.l0IndexId}: ${String(error)}`);
      }
    }

    if (processedIds.length > 0) {
      this.repository.markL0Indexed(processedIds);
    }
    return stats;
  }
}
