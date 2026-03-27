import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  DashboardOverview,
  FactCandidate,
  GlobalFactItem,
  GlobalFactRecord,
  L0SessionRecord,
  L1WindowRecord,
  L2ProjectIndexRecord,
  L2SearchResult,
  L2TimeIndexRecord,
  MemoryUiSnapshot,
} from "../types.js";
import { buildLinkId, nowIso } from "../utils/id.js";
import { safeJsonParse, scoreMatch } from "../utils/text.js";

type DbRow = Record<string, unknown>;

const GLOBAL_FACT_RECORD_ID = "global_fact_record" as const;

export interface ClearMemoryResult {
  cleared: {
    l0: number;
    l1: number;
    l2Time: number;
    l2Project: number;
    facts: number;
    links: number;
    pipelineState: number;
  };
  clearedAt: string;
}

function parseL0Row(row: DbRow): L0SessionRecord {
  return {
    l0IndexId: String(row.l0_index_id),
    sessionKey: String(row.session_key),
    timestamp: String(row.timestamp),
    messages: safeJsonParse(String(row.messages_json ?? "[]"), []),
    source: String(row.source ?? "openclaw"),
    indexed: Number(row.indexed ?? 0) === 1,
    createdAt: String(row.created_at),
  };
}

function parseL1Row(row: DbRow): L1WindowRecord {
  return {
    l1IndexId: String(row.l1_index_id),
    timePeriod: String(row.time_period),
    summary: String(row.summary),
    facts: safeJsonParse(String(row.facts_json ?? "[]"), []),
    situationTimeInfo: String(row.situation_time_info ?? ""),
    projectTags: safeJsonParse(String(row.project_tags_json ?? "[]"), []),
    l0Source: safeJsonParse(String(row.l0_source_json ?? "[]"), []),
    createdAt: String(row.created_at),
  };
}

function parseL2TimeRow(row: DbRow): L2TimeIndexRecord {
  return {
    l2IndexId: String(row.l2_index_id),
    dateKey: String(row.date_key),
    summary: String(row.summary),
    l1Source: safeJsonParse(String(row.l1_source_json ?? "[]"), []),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function parseL2ProjectRow(row: DbRow): L2ProjectIndexRecord {
  return {
    l2IndexId: String(row.l2_index_id),
    projectName: String(row.project_name),
    summary: String(row.summary),
    currentStatus: String(row.current_status),
    latestProgress: String(row.latest_progress),
    l1Source: safeJsonParse(String(row.l1_source_json ?? "[]"), []),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function sortFactsByUpdatedAt(items: GlobalFactItem[]): GlobalFactItem[] {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function parseGlobalFactRecordRow(row: DbRow): GlobalFactRecord {
  return {
    recordId: GLOBAL_FACT_RECORD_ID,
    facts: sortFactsByUpdatedAt(safeJsonParse(String(row.facts_json ?? "[]"), [])),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mergeSourceIds(existing: string[], incoming: string[]): string[] {
  return Array.from(new Set([...existing, ...incoming]));
}

function mergeSummary(existing: string, incoming: string, maxLength = 800): string {
  const base = existing.trim();
  const add = incoming.trim();
  if (!base) return add.slice(0, maxLength);
  if (!add) return base.slice(0, maxLength);
  if (base.includes(add)) return base.slice(0, maxLength);
  const merged = `${base}\n- ${add}`;
  return merged.slice(0, maxLength);
}

function tokenizeQuery(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const tokens = new Set<string>();
  tokens.add(trimmed);
  for (const token of trimmed.split(/[\s,.;:!?，。！？、]+/g)) {
    const cleaned = token.trim();
    if (cleaned.length >= 2) tokens.add(cleaned);
  }
  return Array.from(tokens);
}

function computeTokenScore(query: string, candidates: string[]): number {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return 1;
  let best = 0;
  for (const text of candidates) {
    for (const token of tokens) {
      best = Math.max(best, scoreMatch(token, text));
    }
  }
  return best;
}

export class MemoryRepository {
  private readonly db: DatabaseSync;

  constructor(private readonly dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA synchronous = NORMAL;");
    this.db.exec("PRAGMA temp_store = MEMORY;");
    this.migrate();
  }

  close(): void {
    this.db.close();
  }

  private ensureGlobalFactRecord(): void {
    const now = nowIso();
    const stmt = this.db.prepare(`
      INSERT INTO global_fact_record (
        record_id, facts_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?)
      ON CONFLICT(record_id) DO NOTHING
    `);
    stmt.run(GLOBAL_FACT_RECORD_ID, "[]", now, now);
  }

  private saveGlobalFactRecord(record: GlobalFactRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO global_fact_record (
        record_id, facts_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?)
      ON CONFLICT(record_id) DO UPDATE SET
        facts_json = excluded.facts_json,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
    `);
    stmt.run(record.recordId, JSON.stringify(record.facts), record.createdAt, record.updatedAt);
  }

  migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS l0_sessions (
        l0_index_id TEXT PRIMARY KEY,
        session_key TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        messages_json TEXT NOT NULL,
        source TEXT NOT NULL,
        indexed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS l1_windows (
        l1_index_id TEXT PRIMARY KEY,
        time_period TEXT NOT NULL,
        summary TEXT NOT NULL,
        facts_json TEXT NOT NULL,
        situation_time_info TEXT NOT NULL,
        project_tags_json TEXT NOT NULL,
        l0_source_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS l2_time_indexes (
        l2_index_id TEXT PRIMARY KEY,
        date_key TEXT NOT NULL UNIQUE,
        summary TEXT NOT NULL,
        l1_source_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS l2_project_indexes (
        l2_index_id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL UNIQUE,
        summary TEXT NOT NULL,
        current_status TEXT NOT NULL,
        latest_progress TEXT NOT NULL,
        l1_source_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS global_fact_record (
        record_id TEXT PRIMARY KEY,
        facts_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS global_facts (
        fact_id TEXT PRIMARY KEY,
        fact_key TEXT NOT NULL UNIQUE,
        fact_value TEXT NOT NULL,
        confidence REAL NOT NULL,
        source_l1_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS index_links (
        link_id TEXT PRIMARY KEY,
        from_level TEXT NOT NULL,
        from_id TEXT NOT NULL,
        to_level TEXT NOT NULL,
        to_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(from_level, from_id, to_level, to_id)
      );

      CREATE TABLE IF NOT EXISTS pipeline_state (
        state_key TEXT PRIMARY KEY,
        state_value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_l0_session_time ON l0_sessions(session_key, timestamp);
      CREATE INDEX IF NOT EXISTS idx_l0_indexed ON l0_sessions(indexed, timestamp);
      CREATE INDEX IF NOT EXISTS idx_l1_time_period ON l1_windows(time_period);
      CREATE INDEX IF NOT EXISTS idx_l2_time_date ON l2_time_indexes(date_key);
      CREATE INDEX IF NOT EXISTS idx_l2_project_name ON l2_project_indexes(project_name);
      CREATE INDEX IF NOT EXISTS idx_facts_key ON global_facts(fact_key);
    `);
    this.ensureGlobalFactRecord();
  }

  insertL0Session(record: Omit<L0SessionRecord, "createdAt"> & { createdAt?: string }): void {
    const createdAt = record.createdAt ?? nowIso();
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO l0_sessions (
        l0_index_id, session_key, timestamp, messages_json, source, indexed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      record.l0IndexId,
      record.sessionKey,
      record.timestamp,
      JSON.stringify(record.messages),
      record.source,
      record.indexed ? 1 : 0,
      createdAt,
    );
  }

  listUnindexedL0Sessions(limit = 20): L0SessionRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM l0_sessions
      WHERE indexed = 0
      ORDER BY timestamp ASC
      LIMIT ?
    `);
    const rows = stmt.all(limit) as DbRow[];
    return rows.map(parseL0Row);
  }

  markL0Indexed(ids: string[]): void {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => "?").join(", ");
    const stmt = this.db.prepare(`UPDATE l0_sessions SET indexed = 1 WHERE l0_index_id IN (${placeholders})`);
    stmt.run(...ids);
  }

  getL0ByIds(ids: string[]): L0SessionRecord[] {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(", ");
    const stmt = this.db.prepare(`SELECT * FROM l0_sessions WHERE l0_index_id IN (${placeholders}) ORDER BY timestamp DESC`);
    const rows = stmt.all(...ids) as DbRow[];
    return rows.map(parseL0Row);
  }

  searchL0(query: string, limit = 8): L0SessionRecord[] {
    const rows = this.listRecentL0(Math.max(50, limit * 10));
    const scored = rows.map((item) => ({
      item,
      score: computeTokenScore(query, [item.sessionKey, JSON.stringify(item.messages)]),
    }));
    return scored
      .filter((hit) => hit.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((hit) => hit.item);
  }

  listRecentL0(limit = 20): L0SessionRecord[] {
    const stmt = this.db.prepare("SELECT * FROM l0_sessions ORDER BY timestamp DESC LIMIT ?");
    const rows = stmt.all(limit) as DbRow[];
    return rows.map(parseL0Row);
  }

  insertL1Window(window: L1WindowRecord): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO l1_windows (
        l1_index_id, time_period, summary, facts_json, situation_time_info, project_tags_json, l0_source_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      window.l1IndexId,
      window.timePeriod,
      window.summary,
      JSON.stringify(window.facts),
      window.situationTimeInfo,
      JSON.stringify(window.projectTags),
      JSON.stringify(window.l0Source),
      window.createdAt,
    );
  }

  getL1ByIds(ids: string[]): L1WindowRecord[] {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(", ");
    const stmt = this.db.prepare(`SELECT * FROM l1_windows WHERE l1_index_id IN (${placeholders}) ORDER BY created_at DESC`);
    const rows = stmt.all(...ids) as DbRow[];
    return rows.map(parseL1Row);
  }

  searchL1(query: string, limit = 10): L1WindowRecord[] {
    const rows = this.listRecentL1(Math.max(60, limit * 10));
    const scored = rows.map((item) => ({
      item,
      score: computeTokenScore(query, [
        item.summary,
        item.situationTimeInfo,
        item.projectTags.join(" "),
        JSON.stringify(item.facts),
      ]),
    }));
    return scored
      .filter((hit) => hit.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((hit) => hit.item);
  }

  listRecentL1(limit = 20): L1WindowRecord[] {
    const stmt = this.db.prepare("SELECT * FROM l1_windows ORDER BY created_at DESC LIMIT ?");
    const rows = stmt.all(limit) as DbRow[];
    return rows.map(parseL1Row);
  }

  getL2TimeByDate(dateKey: string): L2TimeIndexRecord | undefined {
    const stmt = this.db.prepare("SELECT * FROM l2_time_indexes WHERE date_key = ?");
    const row = stmt.get(dateKey) as DbRow | undefined;
    return row ? parseL2TimeRow(row) : undefined;
  }

  upsertL2TimeIndex(index: L2TimeIndexRecord): void {
    const previous = this.getL2TimeByDate(index.dateKey);
    const now = nowIso();
    const mergedSources = mergeSourceIds(previous?.l1Source ?? [], index.l1Source);
    const mergedSummary = mergeSummary(previous?.summary ?? "", index.summary);
    const stmt = this.db.prepare(`
      INSERT INTO l2_time_indexes (
        l2_index_id, date_key, summary, l1_source_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(date_key) DO UPDATE SET
        summary = excluded.summary,
        l1_source_json = excluded.l1_source_json,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      previous?.l2IndexId ?? index.l2IndexId,
      index.dateKey,
      mergedSummary,
      JSON.stringify(mergedSources),
      previous?.createdAt ?? index.createdAt,
      now,
    );
  }

  searchL2TimeIndexes(query: string, limit = 10): L2SearchResult[] {
    const rows = this.listRecentL2Time(Math.max(50, limit * 10));
    return rows
      .map((item) => ({
        level: "l2_time" as const,
        score: computeTokenScore(query, [item.dateKey, item.summary]),
        item,
      }))
      .filter((hit) => hit.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  listRecentL2Time(limit = 20): L2TimeIndexRecord[] {
    const stmt = this.db.prepare("SELECT * FROM l2_time_indexes ORDER BY updated_at DESC LIMIT ?");
    const rows = stmt.all(limit) as DbRow[];
    return rows.map(parseL2TimeRow);
  }

  getL2ProjectByName(projectName: string): L2ProjectIndexRecord | undefined {
    const stmt = this.db.prepare("SELECT * FROM l2_project_indexes WHERE project_name = ?");
    const row = stmt.get(projectName) as DbRow | undefined;
    return row ? parseL2ProjectRow(row) : undefined;
  }

  upsertL2ProjectIndex(index: L2ProjectIndexRecord): void {
    const previous = this.getL2ProjectByName(index.projectName);
    const now = nowIso();
    const mergedSources = mergeSourceIds(previous?.l1Source ?? [], index.l1Source);
    const mergedSummary = mergeSummary(previous?.summary ?? "", index.summary);
    const stmt = this.db.prepare(`
      INSERT INTO l2_project_indexes (
        l2_index_id, project_name, summary, current_status, latest_progress, l1_source_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_name) DO UPDATE SET
        summary = excluded.summary,
        current_status = excluded.current_status,
        latest_progress = excluded.latest_progress,
        l1_source_json = excluded.l1_source_json,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      previous?.l2IndexId ?? index.l2IndexId,
      index.projectName,
      mergedSummary,
      index.currentStatus,
      index.latestProgress,
      JSON.stringify(mergedSources),
      previous?.createdAt ?? index.createdAt,
      now,
    );
  }

  searchL2ProjectIndexes(query: string, limit = 10): L2SearchResult[] {
    const rows = this.listRecentL2Projects(Math.max(50, limit * 10));
    return rows
      .map((item) => ({
        level: "l2_project" as const,
        score: computeTokenScore(query, [item.projectName, item.summary, item.latestProgress]),
        item,
      }))
      .filter((hit) => hit.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  listRecentL2Projects(limit = 20): L2ProjectIndexRecord[] {
    const stmt = this.db.prepare("SELECT * FROM l2_project_indexes ORDER BY updated_at DESC LIMIT ?");
    const rows = stmt.all(limit) as DbRow[];
    return rows.map(parseL2ProjectRow);
  }

  getGlobalFactRecord(): GlobalFactRecord {
    this.ensureGlobalFactRecord();
    const stmt = this.db.prepare("SELECT * FROM global_fact_record WHERE record_id = ?");
    const row = stmt.get(GLOBAL_FACT_RECORD_ID) as DbRow | undefined;
    if (row) {
      return parseGlobalFactRecordRow(row);
    }
    const now = nowIso();
    return {
      recordId: GLOBAL_FACT_RECORD_ID,
      facts: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  upsertGlobalFacts(facts: FactCandidate[], sourceL1Id?: string): void {
    if (facts.length === 0) return;
    const current = this.getGlobalFactRecord();
    const byKey = new Map<string, GlobalFactItem>();
    for (const item of current.facts) {
      byKey.set(item.factKey, item);
    }

    const now = nowIso();
    for (const fact of facts) {
      const existing = byKey.get(fact.factKey);
      byKey.set(fact.factKey, {
        factKey: fact.factKey,
        factValue: fact.factValue,
        confidence: existing ? Math.max(existing.confidence, fact.confidence) : fact.confidence,
        sourceL1Ids: mergeSourceIds(existing?.sourceL1Ids ?? [], sourceL1Id ? [sourceL1Id] : []),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    }

    this.saveGlobalFactRecord({
      recordId: GLOBAL_FACT_RECORD_ID,
      facts: sortFactsByUpdatedAt(Array.from(byKey.values())),
      createdAt: current.createdAt,
      updatedAt: now,
    });
  }

  listGlobalFacts(limit = 50): GlobalFactItem[] {
    return sortFactsByUpdatedAt(this.getGlobalFactRecord().facts).slice(0, limit);
  }

  searchFacts(query: string, limit = 20): GlobalFactItem[] {
    const rows = this.listGlobalFacts(Math.max(60, limit * 8));
    const scored = rows.map((item) => ({
      item,
      score: computeTokenScore(query, [item.factKey, item.factValue, item.sourceL1Ids.join(" ")]),
    }));
    return scored
      .filter((hit) => hit.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((hit) => hit.item);
  }

  insertLink(fromLevel: "l2" | "l1" | "l0", fromId: string, toLevel: "l2" | "l1" | "l0", toId: string): void {
    const linkId = buildLinkId(fromLevel, fromId, toLevel, toId);
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO index_links (link_id, from_level, from_id, to_level, to_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(linkId, fromLevel, fromId, toLevel, toId, nowIso());
  }

  getOverview(): DashboardOverview {
    const count = (tableName: string): number => {
      const stmt = this.db.prepare(`SELECT COUNT(1) AS total FROM ${tableName}`);
      const row = stmt.get() as { total?: number } | undefined;
      return Number(row?.total ?? 0);
    };
    const stateStmt = this.db.prepare("SELECT state_value FROM pipeline_state WHERE state_key = ?");
    const state = stateStmt.get("lastIndexedAt") as { state_value?: string } | undefined;
    const overview: DashboardOverview = {
      totalL0: count("l0_sessions"),
      totalL1: count("l1_windows"),
      totalL2Time: count("l2_time_indexes"),
      totalL2Project: count("l2_project_indexes"),
      totalFacts: this.getGlobalFactRecord().facts.length,
    };
    if (state?.state_value) {
      overview.lastIndexedAt = state.state_value;
    }
    return overview;
  }

  setPipelineState(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO pipeline_state (state_key, state_value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(state_key) DO UPDATE SET
        state_value = excluded.state_value,
        updated_at = excluded.updated_at
    `);
    const now = nowIso();
    stmt.run(key, value, now);
  }

  getPipelineState(key: string): string | undefined {
    const stmt = this.db.prepare("SELECT state_value FROM pipeline_state WHERE state_key = ?");
    const row = stmt.get(key) as { state_value?: string } | undefined;
    return row?.state_value;
  }

  clearAllMemoryData(): ClearMemoryResult {
    const runDelete = (table: string): number => {
      const stmt = this.db.prepare(`DELETE FROM ${table}`);
      const result = stmt.run() as { changes?: number };
      return Number(result.changes ?? 0);
    };

    const currentFacts = this.getGlobalFactRecord().facts.length;
    this.db.exec("BEGIN");
    try {
      const cleared = {
        links: runDelete("index_links"),
        l2Project: runDelete("l2_project_indexes"),
        l2Time: runDelete("l2_time_indexes"),
        l1: runDelete("l1_windows"),
        l0: runDelete("l0_sessions"),
        facts: currentFacts,
        pipelineState: runDelete("pipeline_state"),
      };
      runDelete("global_facts");
      const resetAt = nowIso();
      this.saveGlobalFactRecord({
        recordId: GLOBAL_FACT_RECORD_ID,
        facts: [],
        createdAt: resetAt,
        updatedAt: resetAt,
      });
      this.db.exec("COMMIT");
      return {
        cleared,
        clearedAt: resetAt,
      };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  getUiSnapshot(limit = 20): MemoryUiSnapshot {
    return {
      overview: this.getOverview(),
      recentTimeIndexes: this.listRecentL2Time(limit),
      recentProjectIndexes: this.listRecentL2Projects(limit),
      recentL1Windows: this.listRecentL1(limit),
      recentSessions: this.listRecentL0(limit),
      globalFact: this.getGlobalFactRecord(),
    };
  }
}
