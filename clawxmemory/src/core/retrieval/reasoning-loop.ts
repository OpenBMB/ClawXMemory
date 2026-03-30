import type {
  GlobalProfileRecord,
  IndexingSettings,
  L0SearchResult,
  L0SessionRecord,
  L1SearchResult,
  L1WindowRecord,
  L2ProjectIndexRecord,
  L2SearchResult,
  L2TimeIndexRecord,
  RecallMode,
  ReasoningMode,
  RetrievalResult,
} from "../types.js";
import {
  LlmMemoryExtractor,
  type L2CatalogEntry,
  type LookupQuerySpec,
} from "../skills/llm-extraction.js";
import { MemoryRepository } from "../storage/sqlite.js";
import { truncate } from "../utils/text.js";
import type { SkillsRuntime } from "../skills/types.js";

const RECALL_CACHE_TTL_MS = 30_000;
const SHADOW_CACHE_TTL_MS = 120_000;
const L2_TIME_SCAN_MAX = 180;
const L2_PROJECT_SCAN_MAX = 180;
const L2_CATALOG_ENTRY_MAX = 180;
const L2_CATALOG_CHAR_BUDGET = 18_000;
const L1_CANDIDATE_MAX = 12;
const L0_CANDIDATE_MAX = 8;
const DEFAULT_MAX_AUTO_REPLY_LATENCY_MS = 1800;
const FULL_RETRIEVAL_HARD_BUDGET_MS = 12_000;
const AUTO_MIN_HOP1_MS = 700;
const AUTO_MIN_HOP2_MS = 900;
const AUTO_MIN_HOP3_MS = 420;
const AUTO_MIN_HOP4_MS = 420;
const HARD_HOP1_MS = 1600;
const HARD_HOP2_MS = 3500;
const HARD_HOP3_MS = 1200;
const HARD_HOP4_MS = 1400;
const MIN_AUTO_HOP_TIMEOUT_MS = 180;

export interface RetrievalOptions {
  l2Limit?: number;
  l1Limit?: number;
  l0Limit?: number;
  includeFacts?: boolean;
  retrievalMode?: "auto" | "explicit";
}

export interface RetrievalRuntimeOptions {
  getSettings?: () => IndexingSettings;
  isBackgroundBusy?: () => boolean;
}

export interface RetrievalRuntimeStats {
  lastRecallMs: number;
  recallTimeouts: number;
  lastRecallMode: RecallMode;
  lastRecallPath: "auto" | "explicit" | "shadow";
  lastRecallBudgetLimited: boolean;
  lastShadowDeepQueued: boolean;
  lastRecallInjected: boolean;
  lastRecallEnoughAt: RetrievalResult["enoughAt"];
  lastRecallCacheHit: boolean;
}

interface RecallCacheEntry {
  expiresAt: number;
  result: RetrievalResult;
}

interface RetrieveExecutionOptions {
  retrievalMode: "auto" | "explicit";
  updateRuntimeStats: boolean;
  allowShadowDeep: boolean;
  savePrimaryCache: boolean;
}

interface LocalFallbackCandidates {
  profile: GlobalProfileRecord | null;
  l2: L2SearchResult[];
}

interface PackedL2Catalog {
  entries: L2CatalogEntry[];
  byId: Map<string, L2SearchResult>;
  truncated: boolean;
}

function renderProfile(profile: GlobalProfileRecord | null): string {
  if (!profile?.profileText.trim()) return "";
  return ["## Global Profile", profile.profileText].join("\n");
}

function renderL2(results: L2SearchResult[]): string {
  if (results.length === 0) return "";
  const lines: string[] = ["## L2 Indexes"];
  for (const hit of results) {
    if (hit.level === "l2_time") {
      lines.push(`- [time:${hit.item.dateKey}] ${truncate(hit.item.summary, 180)}`);
    } else {
      lines.push(`- [project:${hit.item.projectName}] status=${hit.item.currentStatus} | ${truncate(hit.item.latestProgress, 120)}`);
    }
  }
  return lines.join("\n");
}

function renderL1(results: L1SearchResult[]): string {
  if (results.length === 0) return "";
  const lines: string[] = ["## L1 Windows"];
  for (const hit of results) {
    lines.push(`- [${hit.item.timePeriod}] ${truncate(hit.item.summary, 180)}`);
  }
  return lines.join("\n");
}

function renderL0(results: L0SearchResult[]): string {
  if (results.length === 0) return "";
  const lines: string[] = ["## L0 Raw Sessions"];
  for (const hit of results) {
    lines.push(`- [${hit.item.timestamp}]`);
    for (const message of hit.item.messages.slice(-4)) {
      lines.push(`  ${message.role}: ${truncate(message.content, 260)}`);
    }
  }
  return lines.join("\n");
}

function renderContextTemplate(
  template: string,
  input: {
    intent: RetrievalResult["intent"];
    enoughAt: RetrievalResult["enoughAt"];
    profileBlock: string;
    l2Block: string;
    l1Block: string;
    l0Block: string;
  },
): string {
  let content = template;
  content = content.replaceAll("{{intent}}", input.intent);
  content = content.replaceAll("{{enoughAt}}", input.enoughAt);
  content = content.replaceAll("{{profileBlock}}", input.profileBlock);
  content = content.replaceAll("{{l2Block}}", input.l2Block);
  content = content.replaceAll("{{l1Block}}", input.l1Block);
  content = content.replaceAll("{{l0Block}}", input.l0Block);
  return content.trim();
}

function toRankScore(index: number): number {
  return Math.max(0.1, 1 - index * 0.12);
}

function coerceEnoughAt(
  enoughAt: RetrievalResult["enoughAt"],
  input: { l2: number; l1: number; l0: number },
): RetrievalResult["enoughAt"] {
  if (enoughAt === "profile" && input.l2 === 0 && input.l1 === 0 && input.l0 === 0) return "profile";
  if (enoughAt === "l0" && input.l0 > 0) return "l0";
  if (enoughAt === "l1" && input.l1 > 0) return "l1";
  if (enoughAt === "l2" && input.l2 > 0) return "l2";
  if (input.l0 > 0) return "l0";
  if (input.l1 > 0) return "l1";
  if (input.l2 > 0) return "l2";
  return "none";
}

function normalizeQueryKey(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || /timeout/i.test(error.message);
}

function withDebug(result: RetrievalResult, debug: RetrievalResult["debug"]): RetrievalResult {
  if (!debug) return result;
  return { ...result, debug };
}

function uniqueById<T>(items: T[], getId: (item: T) => string): T[] {
  const seen = new Set<string>();
  const next: T[] = [];
  for (const item of items) {
    const id = getId(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    next.push(item);
  }
  return next;
}

export class ReasoningRetriever {
  private readonly cache = new Map<string, RecallCacheEntry>();
  private readonly shadowDeepCache = new Map<string, RecallCacheEntry>();
  private readonly shadowTasks = new Map<string, Promise<void>>();
  private runtimeStats: RetrievalRuntimeStats = {
    lastRecallMs: 0,
    recallTimeouts: 0,
    lastRecallMode: "none",
    lastRecallPath: "explicit",
    lastRecallBudgetLimited: false,
    lastShadowDeepQueued: false,
    lastRecallInjected: false,
    lastRecallEnoughAt: "none",
    lastRecallCacheHit: false,
  };

  constructor(
    private readonly repository: MemoryRepository,
    private readonly skills: SkillsRuntime,
    private readonly extractor: LlmMemoryExtractor,
    private readonly runtime: RetrievalRuntimeOptions = {},
  ) {}

  getRuntimeStats(): RetrievalRuntimeStats {
    return { ...this.runtimeStats };
  }

  resetTransientState(): void {
    this.cache.clear();
    this.shadowDeepCache.clear();
    this.shadowTasks.clear();
    this.runtimeStats = {
      lastRecallMs: 0,
      recallTimeouts: 0,
      lastRecallMode: "none",
      lastRecallPath: "explicit",
      lastRecallBudgetLimited: false,
      lastShadowDeepQueued: false,
      lastRecallInjected: false,
      lastRecallEnoughAt: "none",
      lastRecallCacheHit: false,
    };
  }

  private currentSettings(): IndexingSettings {
    return this.runtime.getSettings?.() ?? {
      reasoningMode: "answer_first",
      maxAutoReplyLatencyMs: DEFAULT_MAX_AUTO_REPLY_LATENCY_MS,
    };
  }

  private buildCacheKey(query: string, settings: IndexingSettings, retrievalMode: "auto" | "explicit"): string {
    return JSON.stringify({
      query: normalizeQueryKey(query),
      snapshot: this.repository.getSnapshotVersion(),
      retrievalMode,
      settings: {
        reasoningMode: settings.reasoningMode,
        maxAutoReplyLatencyMs: settings.maxAutoReplyLatencyMs,
      },
    });
  }

  private buildShadowCacheKey(query: string): string {
    return JSON.stringify({
      query: normalizeQueryKey(query),
      snapshot: this.repository.getSnapshotVersion(),
      kind: "shadow_deep",
    });
  }

  private getCachedResult(cacheKey: string): RetrievalResult | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }
    return cached.result;
  }

  private saveCachedResult(cacheKey: string, result: RetrievalResult): void {
    this.cache.set(cacheKey, {
      expiresAt: Date.now() + RECALL_CACHE_TTL_MS,
      result,
    });
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
  }

  private getShadowCachedResult(cacheKey: string): RetrievalResult | null {
    const cached = this.shadowDeepCache.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
      this.shadowDeepCache.delete(cacheKey);
      return null;
    }
    return cached.result;
  }

  private saveShadowCachedResult(cacheKey: string, result: RetrievalResult): void {
    this.shadowDeepCache.set(cacheKey, {
      expiresAt: Date.now() + SHADOW_CACHE_TTL_MS,
      result,
    });
    if (this.shadowDeepCache.size > 80) {
      const oldestKey = this.shadowDeepCache.keys().next().value;
      if (oldestKey) this.shadowDeepCache.delete(oldestKey);
    }
  }

  private getBaseProfile(includeFacts: boolean | undefined): GlobalProfileRecord | null {
    if (includeFacts === false) return null;
    const profile = this.repository.getGlobalProfileRecord();
    return profile.profileText.trim() ? profile : null;
  }

  private buildContext(
    intent: RetrievalResult["intent"],
    enoughAt: RetrievalResult["enoughAt"],
    profile: GlobalProfileRecord | null,
    l2Results: L2SearchResult[],
    l1Results: L1SearchResult[],
    l0Results: L0SearchResult[],
  ): string {
    const hasEvidence = Boolean(profile?.profileText.trim())
      || l2Results.length > 0
      || l1Results.length > 0
      || l0Results.length > 0;
    if (!hasEvidence) return "";
    return renderContextTemplate(this.skills.contextTemplate, {
      intent,
      enoughAt,
      profileBlock: renderProfile(profile),
      l2Block: renderL2(l2Results),
      l1Block: renderL1(l1Results),
      l0Block: renderL0(l0Results),
    });
  }

  private getHopBudgets(
    totalBudgetMs: number,
    reasoningMode: ReasoningMode,
    retrievalMode: "auto" | "explicit",
  ): { hop1: number; hop2: number; hop3: number; hop4: number } {
    const safeTotal = Math.max(320, totalBudgetMs);
    if (retrievalMode === "auto" && reasoningMode === "answer_first") {
      const hop1 = Math.max(AUTO_MIN_HOP1_MS, Math.floor(safeTotal * 0.18));
      const hop2 = Math.max(AUTO_MIN_HOP2_MS, Math.floor(safeTotal * 0.32));
      const hop3 = Math.max(AUTO_MIN_HOP3_MS, Math.floor(safeTotal * 0.25));
      const hop4 = Math.max(AUTO_MIN_HOP4_MS, Math.floor(safeTotal * 0.25));
      return { hop1, hop2, hop3, hop4 };
    }
    const hop1 = Math.max(HARD_HOP1_MS, Math.floor(safeTotal * 0.18));
    const hop2 = Math.max(HARD_HOP2_MS, Math.floor(safeTotal * 0.34));
    const hop3 = Math.max(HARD_HOP3_MS, Math.floor(safeTotal * 0.22));
    const hop4 = Math.max(HARD_HOP4_MS, Math.floor(safeTotal * 0.22));
    return { hop1, hop2, hop3, hop4 };
  }

  private getL2HitId(hit: L2SearchResult): string {
    return hit.item.l2IndexId;
  }

  private hitMatchesLookupTypes(hit: L2SearchResult, targetTypes: LookupQuerySpec["targetTypes"]): boolean {
    if (targetTypes.length === 0) return true;
    return hit.level === "l2_time"
      ? targetTypes.includes("time")
      : targetTypes.includes("project");
  }

  private buildLookupSearchSpecs(query: string, lookupQueries: LookupQuerySpec[]): LookupQuerySpec[] {
    const specs: LookupQuerySpec[] = [];
    const seen = new Set<string>();
    const requestedTypes = uniqueById<LookupQuerySpec["targetTypes"][number]>(
      lookupQueries.flatMap((item) => item.targetTypes),
      (item) => item,
    );
    const defaultTypes: LookupQuerySpec["targetTypes"] = requestedTypes.length > 0
      ? requestedTypes
      : ["time", "project"];

    const push = (spec: LookupQuerySpec): void => {
      const lookupQuery = normalizeQueryKey(spec.lookupQuery);
      if (!lookupQuery) return;
      const targetTypes = spec.targetTypes.length > 0 ? spec.targetTypes : defaultTypes;
      const key = `${lookupQuery}::${targetTypes.join("|")}`;
      if (seen.has(key)) return;
      seen.add(key);
      specs.push({
        targetTypes,
        lookupQuery: spec.lookupQuery,
      });
    };

    lookupQueries.forEach((spec) => push(spec));
    push({ targetTypes: defaultTypes, lookupQuery: query });
    return specs;
  }

  private buildRelevantL2Hits(query: string, lookupQueries: LookupQuerySpec[], limit: number): L2SearchResult[] {
    const specs = this.buildLookupSearchSpecs(query, lookupQueries);
    const ranked: L2SearchResult[] = [];
    const seen = new Set<string>();
    const perSpecLimit = Math.max(6, Math.min(L2_CATALOG_ENTRY_MAX, limit * 2));

    for (const spec of specs) {
      const hits = this.repository.searchL2Hits(spec.lookupQuery, perSpecLimit)
        .filter((hit) => this.hitMatchesLookupTypes(hit, spec.targetTypes));
      for (const hit of hits) {
        const hitId = this.getL2HitId(hit);
        if (seen.has(hitId)) continue;
        seen.add(hitId);
        ranked.push(hit);
        if (ranked.length >= limit) {
          return ranked.slice(0, limit);
        }
      }
    }

    return ranked;
  }

  private buildLocalFallbackCandidates(
    query: string,
    options: RetrievalOptions,
    profile: GlobalProfileRecord | null,
    lookupQueries: LookupQuerySpec[] = [],
  ): LocalFallbackCandidates {
    return {
      profile,
      l2: this.buildRelevantL2Hits(
        query,
        lookupQueries,
        Math.max(4, options.l2Limit ?? 4),
      ).slice(0, Math.max(1, options.l2Limit ?? 4)),
    };
  }

  private buildLocalFallback(
    query: string,
    candidates: LocalFallbackCandidates,
    options: RetrievalOptions,
    mode: RecallMode,
    elapsedMs: number,
    cacheHit: boolean,
    corrections: string[] = ["fallback"],
  ): RetrievalResult {
    const profile = candidates.profile;
    const l2Results = candidates.l2.slice(0, Math.max(1, Math.min(2, options.l2Limit ?? 2)));
    const intent = l2Results[0]?.level === "l2_project"
      ? "project"
      : l2Results[0]?.level === "l2_time"
        ? "time"
        : profile
          ? "fact"
          : "general";
    const enoughAt = l2Results.length > 0
      ? coerceEnoughAt("l2", { l2: l2Results.length, l1: 0, l0: 0 })
      : profile
        ? "profile"
        : "none";
    return withDebug({
      query,
      intent,
      enoughAt,
      profile,
      l2Results,
      l1Results: [],
      l0Results: [],
      context: this.buildContext(intent, enoughAt, profile, l2Results, [], []),
    }, {
      mode,
      elapsedMs,
      cacheHit,
      path: options.retrievalMode ?? "explicit",
      corrections,
    });
  }

  private updateRuntimeStats(result: RetrievalResult, timedOut = false): void {
    const mode = result.debug?.mode ?? "none";
    const elapsedMs = result.debug?.elapsedMs ?? 0;
    this.runtimeStats.lastRecallMs = elapsedMs;
    this.runtimeStats.lastRecallMode = mode;
    this.runtimeStats.lastRecallPath = result.debug?.path ?? "explicit";
    this.runtimeStats.lastRecallBudgetLimited = Boolean(result.debug?.budgetLimited);
    this.runtimeStats.lastShadowDeepQueued = Boolean(result.debug?.shadowDeepQueued);
    this.runtimeStats.lastRecallInjected = Boolean(result.context?.trim());
    this.runtimeStats.lastRecallEnoughAt = result.enoughAt;
    this.runtimeStats.lastRecallCacheHit = Boolean(result.debug?.cacheHit);
    if (timedOut) {
      this.runtimeStats.recallTimeouts += 1;
    }
  }

  private buildL2CatalogHit(entry: L2TimeIndexRecord | L2ProjectIndexRecord): L2SearchResult {
    if ("dateKey" in entry) {
      return { level: "l2_time", score: 1, item: entry };
    }
    return { level: "l2_project", score: 1, item: entry };
  }

  private formatL2CompressedContent(hit: L2SearchResult, maxLength: number): string {
    if (hit.level === "l2_time") {
      return truncate(hit.item.summary, maxLength);
    }
    const parts = [
      hit.item.summary,
      `status=${hit.item.currentStatus}`,
      hit.item.latestProgress,
    ].filter(Boolean);
    return truncate(parts.join(" | "), maxLength);
  }

  private buildL2CatalogEntry(hit: L2SearchResult, compressedLength: number): L2CatalogEntry {
    if (hit.level === "l2_time") {
      return {
        id: hit.item.l2IndexId,
        type: "time",
        label: hit.item.dateKey,
        lookupKeys: [hit.item.dateKey],
        compressedContent: this.formatL2CompressedContent(hit, compressedLength),
      };
    }
    return {
      id: hit.item.l2IndexId,
      type: "project",
      label: hit.item.projectName,
      lookupKeys: [hit.item.projectKey, hit.item.projectName],
      compressedContent: this.formatL2CompressedContent(hit, compressedLength),
    };
  }

  private estimateL2EntrySize(entry: L2CatalogEntry): number {
    return entry.label.length
      + entry.lookupKeys.join(" ").length
      + entry.compressedContent.length
      + 32;
  }

  private compareL2UpdatedAtDesc(left: L2SearchResult, right: L2SearchResult): number {
    const leftUpdatedAt = left.level === "l2_time" ? left.item.updatedAt : left.item.updatedAt;
    const rightUpdatedAt = right.level === "l2_time" ? right.item.updatedAt : right.item.updatedAt;
    return rightUpdatedAt.localeCompare(leftUpdatedAt);
  }

  private buildL2Catalog(query: string, lookupQueries: LookupQuerySpec[]): PackedL2Catalog {
    const requestedTypes = new Set(lookupQueries.flatMap((item) => item.targetTypes));
    const includeTime = requestedTypes.size === 0 || requestedTypes.has("time");
    const includeProject = requestedTypes.size === 0 || requestedTypes.has("project");
    const relevantHits = this.buildRelevantL2Hits(query, lookupQueries, L2_CATALOG_ENTRY_MAX);
    const selectedIds = new Set(relevantHits.map((hit) => this.getL2HitId(hit)));
    const timeHits = includeTime
      ? this.repository.listRecentL2Time(L2_TIME_SCAN_MAX).map((item) => this.buildL2CatalogHit(item))
      : [];
    const projectHits = includeProject
      ? this.repository.listRecentL2Projects(L2_PROJECT_SCAN_MAX).map((item) => this.buildL2CatalogHit(item))
      : [];
    const orderedRecentHits = [...timeHits, ...projectHits]
      .filter((hit) => !selectedIds.has(this.getL2HitId(hit)))
      .sort((left, right) => this.compareL2UpdatedAtDesc(left, right));
    const orderedHits = [...relevantHits, ...orderedRecentHits]
      .slice(0, L2_CATALOG_ENTRY_MAX);

    const packedEntries: L2CatalogEntry[] = [];
    const byId = new Map<string, L2SearchResult>();
    let remainingBudget = L2_CATALOG_CHAR_BUDGET;
    let truncated = relevantHits.length + orderedRecentHits.length > orderedHits.length;

    for (const hit of orderedHits) {
      const fullEntry = this.buildL2CatalogEntry(hit, 140);
      const compactEntry = this.buildL2CatalogEntry(hit, 60);
      const labelOnlyEntry = this.buildL2CatalogEntry(hit, 0);
      const candidates = [fullEntry, compactEntry, labelOnlyEntry];
      const chosen = candidates.find((entry) => this.estimateL2EntrySize(entry) <= remainingBudget);
      if (!chosen) {
        truncated = true;
        break;
      }
      packedEntries.push(chosen);
      byId.set(chosen.id, hit);
      remainingBudget -= this.estimateL2EntrySize(chosen);
    }

    if (packedEntries.length < orderedHits.length) truncated = true;

    return {
      entries: packedEntries,
      byId,
      truncated,
    };
  }

  private resolveBaseIntent(profile: GlobalProfileRecord | null): RetrievalResult["intent"] {
    return profile ? "fact" : "general";
  }

  private resolveBaseEnoughAt(profile: GlobalProfileRecord | null): RetrievalResult["enoughAt"] {
    return profile ? "profile" : "none";
  }

  private resolveSelectedIds(candidateIds: string[], selectedIds: string[]): string[] {
    const allowed = new Set(candidateIds);
    return uniqueById(
      selectedIds
        .filter((id) => allowed.has(id))
        .map((id) => ({ id })),
      (item) => item.id,
    ).map((item) => item.id);
  }

  private buildSelectedL2Results(orderedIds: string[], catalog: PackedL2Catalog, limit: number): L2SearchResult[] {
    return orderedIds
      .map((id, index) => {
        const hit = catalog.byId.get(id);
        return hit ? { ...hit, score: toRankScore(index) } : undefined;
      })
      .filter((hit): hit is L2SearchResult => Boolean(hit))
      .slice(0, limit);
  }

  private buildSelectedL2Entries(orderedIds: string[], entries: L2CatalogEntry[]): L2CatalogEntry[] {
    const byId = new Map(entries.map((item) => [item.id, item]));
    return orderedIds
      .map((id) => byId.get(id))
      .filter((item): item is L2CatalogEntry => Boolean(item));
  }

  private buildL1CandidatesFromL2(l2Results: L2SearchResult[], limit = L1_CANDIDATE_MAX): L1WindowRecord[] {
    const l1Ids = uniqueById(
      l2Results.flatMap((result) => {
        if (result.level === "l2_time") return result.item.l1Source.map((id) => ({ id }));
        return result.item.l1Source.map((id) => ({ id }));
      }),
      (item) => item.id,
    ).map((item) => item.id);
    if (l1Ids.length === 0) return [];
    const byId = new Map(this.repository.getL1ByIds(l1Ids).map((item) => [item.l1IndexId, item]));
    return l1Ids
      .map((id) => byId.get(id))
      .filter((item): item is L1WindowRecord => Boolean(item))
      .slice(0, limit);
  }

  private buildL0CandidatesFromL1(l1Windows: L1WindowRecord[], limit = L0_CANDIDATE_MAX): L0SessionRecord[] {
    return this.repository.getL0ByL1Ids(l1Windows.map((item) => item.l1IndexId), limit);
  }

  async searchL2(query: string, _intent: RetrievalResult["intent"], limit: number): Promise<L2SearchResult[]> {
    const candidateHits = this.repository.searchL2Hits(query, Math.max(4, limit));
    if (this.runtime.isBackgroundBusy?.()) {
      return candidateHits.slice(0, limit);
    }
    try {
      const selection = await this.extractor.reasonOverMemory({
        query,
        profile: null,
        l2Time: candidateHits.filter((hit) => hit.level === "l2_time").map((hit) => hit.item),
        l2Projects: candidateHits.filter((hit) => hit.level === "l2_project").map((hit) => hit.item),
        l1Windows: [],
        l0Sessions: [],
        limits: { l2: limit, l1: 0, l0: 0 },
        timeoutMs: HARD_HOP2_MS,
      });
      const byId = new Map(candidateHits.map((hit) => [hit.item.l2IndexId, hit]));
      return selection.l2Ids
        .map((id, index) => {
          const hit = byId.get(id);
          return hit ? { ...hit, score: toRankScore(index) } : undefined;
        })
        .filter((hit): hit is L2SearchResult => Boolean(hit))
        .slice(0, limit);
    } catch {
      return candidateHits.slice(0, limit);
    }
  }

  async searchL1(query: string, relatedL1Ids: string[], limit: number): Promise<L1SearchResult[]> {
    const related = this.repository.getL1ByIds(relatedL1Ids).map((item, index) => ({ item, score: toRankScore(index) }));
    const local = this.repository.searchL1Hits(query, Math.max(limit, 4));
    const merged = new Map<string, L1SearchResult>();
    [...related, ...local].forEach((hit) => merged.set(hit.item.l1IndexId, hit));
    return Array.from(merged.values()).slice(0, limit);
  }

  async searchL0(_query: string, relatedL0Ids: string[], limit: number): Promise<L0SearchResult[]> {
    return this.repository.getL0ByIds(relatedL0Ids).slice(0, limit).map((item, index) => ({
      score: toRankScore(index),
      item,
    }));
  }

  private isAnswerFirst(settings: IndexingSettings, retrievalMode: "auto" | "explicit"): boolean {
    return retrievalMode === "auto" && settings.reasoningMode === "answer_first";
  }

  private getTotalBudgetMs(settings: IndexingSettings, retrievalMode: "auto" | "explicit"): number {
    return this.isAnswerFirst(settings, retrievalMode)
      ? settings.maxAutoReplyLatencyMs
      : FULL_RETRIEVAL_HARD_BUDGET_MS;
  }

  private canEnterNextHop(startedAt: number, totalBudgetMs: number, nextHopBudgetMs: number): boolean {
    const remaining = totalBudgetMs - (Date.now() - startedAt);
    return remaining >= nextHopBudgetMs + 40;
  }

  private getAutoHopTimeout(
    startedAt: number,
    totalBudgetMs: number,
    preferredHopMs: number,
    reserveMs: number,
  ): number {
    const remaining = totalBudgetMs - (Date.now() - startedAt) - reserveMs;
    if (remaining < MIN_AUTO_HOP_TIMEOUT_MS) return 0;
    return Math.max(MIN_AUTO_HOP_TIMEOUT_MS, Math.min(preferredHopMs, remaining));
  }

  private finalizeResult(
    result: RetrievalResult,
    execution: RetrieveExecutionOptions,
    cacheKey: string,
    timedOut = false,
  ): RetrievalResult {
    if (execution.savePrimaryCache) {
      this.saveCachedResult(cacheKey, result);
    }
    if (execution.updateRuntimeStats) {
      this.updateRuntimeStats(result, timedOut);
    }
    return result;
  }

  private queueShadowDeep(query: string, options: RetrievalOptions): boolean {
    if (this.runtime.isBackgroundBusy?.()) return false;
    const shadowKey = this.buildShadowCacheKey(query);
    if (this.getShadowCachedResult(shadowKey)) return false;
    if (this.shadowTasks.has(shadowKey)) return true;
    const task = this.runRetrieve(
      query,
      { ...options, retrievalMode: "explicit" },
      {
        retrievalMode: "explicit",
        updateRuntimeStats: false,
        allowShadowDeep: false,
        savePrimaryCache: false,
      },
    ).then((result) => {
      this.saveShadowCachedResult(shadowKey, withDebug(result, {
        mode: result.debug?.mode ?? "llm",
        elapsedMs: result.debug?.elapsedMs ?? 0,
        cacheHit: result.debug?.cacheHit ?? false,
        ...(result.debug ?? {}),
        path: "shadow",
      }));
    }).catch(() => {
      return;
    }).finally(() => {
      this.shadowTasks.delete(shadowKey);
    });
    this.shadowTasks.set(shadowKey, task);
    return true;
  }

  private async runRetrieve(
    query: string,
    options: RetrievalOptions,
    execution: RetrieveExecutionOptions,
  ): Promise<RetrievalResult> {
    const startedAt = Date.now();
    const settings = this.currentSettings();
    const cacheKey = this.buildCacheKey(query, settings, execution.retrievalMode);
    if (execution.retrievalMode === "auto") {
      const shadowCached = this.getShadowCachedResult(this.buildShadowCacheKey(query));
      if (shadowCached) {
        const result = withDebug(shadowCached, {
          mode: shadowCached.debug?.mode ?? "llm",
          ...(shadowCached.debug ?? {}),
          elapsedMs: Date.now() - startedAt,
          cacheHit: true,
          path: "shadow",
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }
    }

    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      const result = withDebug(cached, {
        mode: cached.debug?.mode ?? "llm",
        ...(cached.debug ?? {}),
        elapsedMs: Date.now() - startedAt,
        cacheHit: true,
        path: execution.retrievalMode,
      });
      return this.finalizeResult(result, execution, cacheKey, false);
    }

    const baseProfile = this.getBaseProfile(options.includeFacts);
    const fallbackCandidates = this.buildLocalFallbackCandidates(query, options, baseProfile);
    let routedFallbackCandidates = fallbackCandidates;
    if (!baseProfile && fallbackCandidates.l2.length === 0) {
      const result = withDebug({
        query,
        intent: "general",
        enoughAt: "none",
        profile: null,
        l2Results: [],
        l1Results: [],
        l0Results: [],
        context: "",
      }, {
        mode: "none",
        elapsedMs: Date.now() - startedAt,
        cacheHit: false,
        path: execution.retrievalMode,
      });
      return this.finalizeResult(result, execution, cacheKey, false);
    }

    if (execution.retrievalMode === "auto" && this.runtime.isBackgroundBusy?.()) {
      const fallback = this.buildLocalFallback(query, fallbackCandidates, options, "local_fallback", Date.now() - startedAt, false);
      return this.finalizeResult(fallback, execution, cacheKey, false);
    }

    const totalBudgetMs = this.getTotalBudgetMs(settings, execution.retrievalMode);
    const budgets = this.getHopBudgets(totalBudgetMs, settings.reasoningMode, execution.retrievalMode);
    const autoBounded = this.isAnswerFirst(settings, execution.retrievalMode);
    const unboundedAccuracy = settings.reasoningMode === "accuracy_first";

    try {
      const hop1Timeout = unboundedAccuracy
        ? 0
        : autoBounded
        ? this.getAutoHopTimeout(startedAt, totalBudgetMs, budgets.hop1, 40)
        : budgets.hop1;
      if (autoBounded && hop1Timeout <= 0) {
        const fallback = this.buildLocalFallback(
          query,
          fallbackCandidates,
          options,
          "local_fallback",
          Date.now() - startedAt,
          false,
          ["hop1_budget", "fallback"],
        );
        return this.finalizeResult(fallback, execution, cacheKey, false);
      }
      const hop1 = await this.extractor.decideMemoryLookup({
        query,
        profile: baseProfile,
        timeoutMs: hop1Timeout,
      });
      routedFallbackCandidates = this.buildLocalFallbackCandidates(query, options, baseProfile, hop1.lookupQueries);

      if (!hop1.memoryRelevant || hop1.baseOnly) {
        const intent = this.resolveBaseIntent(baseProfile);
        const enoughAt = this.resolveBaseEnoughAt(baseProfile);
        const result = withDebug({
          query,
          intent,
          enoughAt,
          profile: baseProfile,
          l2Results: [],
          l1Results: [],
          l0Results: [],
          context: this.buildContext(intent, enoughAt, baseProfile, [], [], []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      if (autoBounded && !this.canEnterNextHop(startedAt, totalBudgetMs, budgets.hop2)) {
        const queued = execution.allowShadowDeep ? this.queueShadowDeep(query, options) : false;
        const fallback = this.buildLocalFallback(
          query,
          routedFallbackCandidates,
          options,
          "local_fallback",
          Date.now() - startedAt,
          false,
          ["hop1_budget", "fallback"],
        );
        const fallbackDebug = fallback.debug ?? {
          mode: "local_fallback" as const,
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
        };
        const result = withDebug(fallback, {
          ...fallbackDebug,
          path: execution.retrievalMode,
          budgetLimited: autoBounded,
          shadowDeepQueued: queued,
          hop1LookupQueries: hop1.lookupQueries,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      const catalog = this.buildL2Catalog(query, hop1.lookupQueries);
      if (catalog.entries.length === 0) {
        const fallback = this.buildLocalFallback(
          query,
          routedFallbackCandidates,
          options,
          "local_fallback",
          Date.now() - startedAt,
          false,
          ["catalog_empty", "fallback"],
        );
        const fallbackDebug = fallback.debug ?? {
          mode: "local_fallback" as const,
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
        };
        const result = withDebug(fallback, {
          ...fallbackDebug,
          path: execution.retrievalMode,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      const hop2Timeout = unboundedAccuracy
        ? 0
        : autoBounded
        ? this.getAutoHopTimeout(startedAt, totalBudgetMs, budgets.hop2, Math.max(60, budgets.hop3 + budgets.hop4))
        : Math.max(budgets.hop2, totalBudgetMs - (Date.now() - startedAt) - Math.max(220, budgets.hop3 + budgets.hop4));
      if (autoBounded && hop2Timeout <= 0) {
        const queued = execution.allowShadowDeep ? this.queueShadowDeep(query, options) : false;
        const fallback = this.buildLocalFallback(
          query,
          routedFallbackCandidates,
          options,
          "local_fallback",
          Date.now() - startedAt,
          false,
          ["hop2_budget", "fallback"],
        );
        const fallbackDebug = fallback.debug ?? {
          mode: "local_fallback" as const,
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
        };
        const result = withDebug(fallback, {
          ...fallbackDebug,
          path: execution.retrievalMode,
          budgetLimited: true,
          shadowDeepQueued: queued,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }
      const hop2 = await this.extractor.selectL2FromCatalog({
        query,
        profile: baseProfile,
        lookupQueries: hop1.lookupQueries,
        l2Entries: catalog.entries,
        catalogTruncated: catalog.truncated,
        timeoutMs: hop2Timeout,
      });
      const selectedL2Ids = this.resolveSelectedIds(catalog.entries.map((item) => item.id), hop2.selectedL2Ids);
      const l2SelectionLimit = options.l2Limit ?? Math.max(4, selectedL2Ids.length || 0);
      const l2Results = this.buildSelectedL2Results(selectedL2Ids, catalog, Math.max(1, l2SelectionLimit));
      const selectedL2Entries = this.buildSelectedL2Entries(selectedL2Ids, catalog.entries);

      if (hop2.enoughAt === "none" || l2Results.length === 0) {
        const fallback = this.buildLocalFallback(
          query,
          routedFallbackCandidates,
          options,
          "local_fallback",
          Date.now() - startedAt,
          false,
          ["hop2_empty", "fallback"],
        );
        const fallbackDebug = fallback.debug ?? {
          mode: "local_fallback" as const,
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
        };
        const result = withDebug(fallback, {
          ...fallbackDebug,
          path: execution.retrievalMode,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      if (hop2.enoughAt === "l2") {
        const enoughAt = coerceEnoughAt("l2", { l2: l2Results.length, l1: 0, l0: 0 });
        const result = withDebug({
          query,
          intent: hop2.intent,
          enoughAt,
          profile: null,
          l2Results,
          l1Results: [],
          l0Results: [],
          context: this.buildContext(hop2.intent, enoughAt, null, l2Results, [], []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      const l1Candidates = this.buildL1CandidatesFromL2(l2Results);
      if (l1Candidates.length === 0 || (autoBounded && !this.canEnterNextHop(startedAt, totalBudgetMs, budgets.hop3))) {
        const enoughAt = coerceEnoughAt("l2", { l2: l2Results.length, l1: 0, l0: 0 });
        const queued = l1Candidates.length > 0 && execution.allowShadowDeep ? this.queueShadowDeep(query, options) : false;
        const result = withDebug({
          query,
          intent: hop2.intent,
          enoughAt,
          profile: null,
          l2Results,
          l1Results: [],
          l0Results: [],
          context: this.buildContext(hop2.intent, enoughAt, null, l2Results, [], []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          budgetLimited: autoBounded && l1Candidates.length > 0,
          shadowDeepQueued: queued,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      const hop3Timeout = unboundedAccuracy
        ? 0
        : autoBounded
        ? this.getAutoHopTimeout(startedAt, totalBudgetMs, budgets.hop3, Math.max(40, budgets.hop4))
        : Math.max(budgets.hop3, totalBudgetMs - (Date.now() - startedAt) - Math.max(40, budgets.hop4));
      if (autoBounded && hop3Timeout <= 0) {
        const enoughAt = coerceEnoughAt("l2", { l2: l2Results.length, l1: 0, l0: 0 });
        const finalProfile = null;
        const queued = execution.allowShadowDeep ? this.queueShadowDeep(query, options) : false;
        const result = withDebug({
          query,
          intent: hop2.intent,
          enoughAt,
          profile: finalProfile,
          l2Results,
          l1Results: [],
          l0Results: [],
          context: this.buildContext(hop2.intent, enoughAt, finalProfile, l2Results, [], []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          budgetLimited: true,
          shadowDeepQueued: queued,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }
      const hop3 = await this.extractor.selectL1FromEvidence({
        query,
        profile: baseProfile,
        selectedL2Entries,
        l1Windows: l1Candidates,
        timeoutMs: hop3Timeout,
      });

      const selectedL1Ids = this.resolveSelectedIds(l1Candidates.map((item) => item.l1IndexId), hop3.selectedL1Ids);
      const l1ById = new Map(l1Candidates.map((item) => [item.l1IndexId, item]));
      const l1Results = selectedL1Ids
        .map((id, index) => {
          const item = l1ById.get(id);
          return item ? { score: toRankScore(index), item } : undefined;
        })
        .filter((hit): hit is L1SearchResult => Boolean(hit))
        .slice(0, options.l1Limit ?? L1_CANDIDATE_MAX);
      const selectedL1Windows = l1Results.map((hit) => hit.item);

      if (hop3.enoughAt === "none" || selectedL1Windows.length === 0) {
        const enoughAt = coerceEnoughAt("l2", { l2: l2Results.length, l1: 0, l0: 0 });
        const finalProfile = hop3.useProfile ? baseProfile : null;
        const result = withDebug({
          query,
          intent: hop2.intent,
          enoughAt,
          profile: finalProfile,
          l2Results,
          l1Results: [],
          l0Results: [],
          context: this.buildContext(hop2.intent, enoughAt, finalProfile, l2Results, [], []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          hop3EnoughAt: hop3.enoughAt,
          hop3SelectedL1Ids: selectedL1Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      if (hop3.enoughAt === "l1") {
        const enoughAt = coerceEnoughAt("l1", { l2: l2Results.length, l1: l1Results.length, l0: 0 });
        const finalProfile = hop3.useProfile ? baseProfile : null;
        const result = withDebug({
          query,
          intent: hop2.intent,
          enoughAt,
          profile: finalProfile,
          l2Results,
          l1Results,
          l0Results: [],
          context: this.buildContext(hop2.intent, enoughAt, finalProfile, l2Results, l1Results, []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          hop3EnoughAt: hop3.enoughAt,
          hop3SelectedL1Ids: selectedL1Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      const l0Candidates = this.buildL0CandidatesFromL1(selectedL1Windows, Math.max(L0_CANDIDATE_MAX, options.l0Limit ?? 1));
      if (l0Candidates.length === 0 || (autoBounded && !this.canEnterNextHop(startedAt, totalBudgetMs, budgets.hop4))) {
        const enoughAt = coerceEnoughAt("l1", { l2: l2Results.length, l1: l1Results.length, l0: 0 });
        const finalProfile = hop3.useProfile ? baseProfile : null;
        const queued = l0Candidates.length > 0 && execution.allowShadowDeep ? this.queueShadowDeep(query, options) : false;
        const result = withDebug({
          query,
          intent: hop2.intent,
          enoughAt,
          profile: finalProfile,
          l2Results,
          l1Results,
          l0Results: [],
          context: this.buildContext(hop2.intent, enoughAt, finalProfile, l2Results, l1Results, []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          budgetLimited: autoBounded && l0Candidates.length > 0,
          shadowDeepQueued: queued,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          hop3EnoughAt: hop3.enoughAt,
          hop3SelectedL1Ids: selectedL1Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }

      const hop4Timeout = unboundedAccuracy
        ? 0
        : autoBounded
        ? this.getAutoHopTimeout(startedAt, totalBudgetMs, budgets.hop4, 40)
        : Math.max(budgets.hop4, totalBudgetMs - (Date.now() - startedAt) - 40);
      if (autoBounded && hop4Timeout <= 0) {
        const enoughAt = coerceEnoughAt("l1", { l2: l2Results.length, l1: l1Results.length, l0: 0 });
        const finalProfile = hop3.useProfile ? baseProfile : null;
        const queued = execution.allowShadowDeep ? this.queueShadowDeep(query, options) : false;
        const result = withDebug({
          query,
          intent: hop2.intent,
          enoughAt,
          profile: finalProfile,
          l2Results,
          l1Results,
          l0Results: [],
          context: this.buildContext(hop2.intent, enoughAt, finalProfile, l2Results, l1Results, []),
        }, {
          mode: "llm",
          elapsedMs: Date.now() - startedAt,
          cacheHit: false,
          path: execution.retrievalMode,
          budgetLimited: true,
          shadowDeepQueued: queued,
          hop1BaseOnly: hop1.baseOnly,
          hop1LookupQueries: hop1.lookupQueries,
          hop2EnoughAt: hop2.enoughAt,
          hop2SelectedL2Ids: selectedL2Ids,
          hop3EnoughAt: hop3.enoughAt,
          hop3SelectedL1Ids: selectedL1Ids,
          catalogTruncated: catalog.truncated,
        });
        return this.finalizeResult(result, execution, cacheKey, false);
      }
      const hop4 = await this.extractor.selectL0FromEvidence({
        query,
        selectedL2Entries,
        selectedL1Windows,
        l0Sessions: l0Candidates,
        timeoutMs: hop4Timeout,
      });
      const selectedL0Ids = this.resolveSelectedIds(l0Candidates.map((item) => item.l0IndexId), hop4.selectedL0Ids);
      const l0ById = new Map(l0Candidates.map((item) => [item.l0IndexId, item]));
      const l0Results = selectedL0Ids
        .map((id, index) => {
          const item = l0ById.get(id);
          return item ? { score: toRankScore(index), item } : undefined;
        })
        .filter((hit): hit is L0SearchResult => Boolean(hit))
        .slice(0, options.l0Limit ?? 1);

      const finalEnoughAt = hop4.enoughAt === "l0"
        ? coerceEnoughAt("l0", { l2: l2Results.length, l1: l1Results.length, l0: l0Results.length })
        : coerceEnoughAt("l1", { l2: l2Results.length, l1: l1Results.length, l0: l0Results.length });
      const finalProfile = hop3.useProfile ? baseProfile : null;
      const result = withDebug({
        query,
        intent: hop2.intent,
        enoughAt: finalEnoughAt,
        profile: finalProfile,
        l2Results,
        l1Results,
        l0Results,
        context: this.buildContext(hop2.intent, finalEnoughAt, finalProfile, l2Results, l1Results, l0Results),
      }, {
        mode: "llm",
        elapsedMs: Date.now() - startedAt,
        cacheHit: false,
        path: execution.retrievalMode,
        hop1BaseOnly: hop1.baseOnly,
        hop1LookupQueries: hop1.lookupQueries,
        hop2EnoughAt: hop2.enoughAt,
        hop2SelectedL2Ids: selectedL2Ids,
        hop3EnoughAt: hop3.enoughAt,
        hop3SelectedL1Ids: selectedL1Ids,
        hop4SelectedL0Ids: selectedL0Ids,
        catalogTruncated: catalog.truncated,
      });
      return this.finalizeResult(result, execution, cacheKey, false);
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      const timedOut = isTimeoutError(error) || (autoBounded && elapsedMs >= totalBudgetMs - 25);
      const result = this.buildLocalFallback(query, routedFallbackCandidates, options, "local_fallback", elapsedMs, false);
      return this.finalizeResult(result, execution, cacheKey, timedOut);
    }
  }

  async retrieve(query: string, options: RetrievalOptions = {}): Promise<RetrievalResult> {
    const settings = this.currentSettings();
    const retrievalMode = options.retrievalMode ?? "explicit";
    const execution: RetrieveExecutionOptions = {
      retrievalMode,
      updateRuntimeStats: true,
      allowShadowDeep: retrievalMode === "auto" && settings.reasoningMode === "answer_first",
      savePrimaryCache: true,
    };
    return this.runRetrieve(query, { ...options, retrievalMode }, execution);
  }
}
