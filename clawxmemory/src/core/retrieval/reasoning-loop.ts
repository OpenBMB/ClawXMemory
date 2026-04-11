import type {
  IndexingSettings,
  MemoryManifestEntry,
  MemoryMessage,
  MemoryRoute,
  MemoryUserSummary,
  ProjectMetaRecord,
  RetrievalPromptDebug,
  RetrievalTrace,
  RetrievalTraceDetail,
  RetrievalResult,
  RecallMode,
} from "../types.js";
import { LlmMemoryExtractor } from "../skills/llm-extraction.js";
import { MemoryRepository } from "../storage/sqlite.js";
import { hashText, nowIso } from "../utils/id.js";
import { decodeEscapedUnicodeText, decodeEscapedUnicodeValue, truncate } from "../utils/text.js";
import type { SkillsRuntime } from "../skills/types.js";

const RECALL_CACHE_TTL_MS = 30_000;
const DEFAULT_RECALL_TOP_K = 5;
const MANIFEST_LIMIT = 200;
const FILE_LINE_LIMIT = 80;

export interface RetrievalOptions {
  l2Limit?: number;
  l1Limit?: number;
  l0Limit?: number;
  includeFacts?: boolean;
  retrievalMode?: "auto" | "explicit";
  recentMessages?: MemoryMessage[];
  workspaceHint?: string;
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

interface ProjectResolutionCandidateScore {
  projectId: string;
  projectName: string;
  score: number;
  exact: number;
  updatedAt: string;
}

interface ProjectResolutionAttempt {
  source: "query" | "recent";
  text: string;
  projectId?: string;
  score: number;
  exact: number;
  candidates: ProjectResolutionCandidateScore[];
}

interface ProjectResolutionResult {
  projectId?: string;
  score: number;
  exact: number;
  source: "query" | "recent" | "none";
  matchedText?: string;
  workspaceToken: string;
  recentUserTexts: string[];
  attempts: ProjectResolutionAttempt[];
}

interface ProjectManifestSelection {
  allCount: number;
  entries: MemoryManifestEntry[];
  kinds: Array<"feedback" | "project">;
  limit: number;
}

function projectManifestPriority(entry: MemoryManifestEntry): number {
  return entry.type === "project" ? 0 : 1;
}

function normalizeQueryKey(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildTraceId(prefix: string, seed: string): string {
  return `${prefix}_${hashText(`${seed}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`)}`;
}

function previewText(value: string, max = 220): string {
  return truncate(decodeEscapedUnicodeText(value).trim(), max);
}

function listDetail(key: string, label: string, items: string[]): RetrievalTraceDetail {
  return { key, label, kind: "list", items: items.map((item) => decodeEscapedUnicodeText(item, true)) };
}

function kvDetail(
  key: string,
  label: string,
  entries: Array<{ label: string; value: unknown }>,
): RetrievalTraceDetail {
  return {
    key,
    label,
    kind: "kv",
    entries: entries.map((entry) => ({
      label: entry.label,
      value: decodeEscapedUnicodeText(String(entry.value ?? ""), true),
    })),
  };
}

function jsonDetail(key: string, label: string, json: unknown): RetrievalTraceDetail {
  return { key, label, kind: "json", json: decodeEscapedUnicodeValue(json, true) };
}

function hasUserSummary(userSummary: MemoryUserSummary): boolean {
  return Boolean(
    userSummary.profile
      || userSummary.preferences.length
      || userSummary.constraints.length
      || userSummary.relationships.length,
  );
}

function renderUserSummaryBlock(userSummary: MemoryUserSummary): string[] {
  if (!hasUserSummary(userSummary)) return [];
  const updatedAt = userSummary.files[0]?.updatedAt ?? "";
  const lines = [
    `### [user] global/User/user-profile.md${updatedAt ? ` (${updatedAt})` : ""}`,
    "## Profile",
    userSummary.profile || "No stable user profile yet.",
    "",
  ];
  if (userSummary.preferences.length > 0) {
    lines.push("## Preferences", ...userSummary.preferences.map((item) => `- ${item}`), "");
  }
  if (userSummary.constraints.length > 0) {
    lines.push("## Constraints", ...userSummary.constraints.map((item) => `- ${item}`), "");
  }
  if (userSummary.relationships.length > 0) {
    lines.push("## Relationships", ...userSummary.relationships.map((item) => `- ${item}`), "");
  }
  return lines;
}

function renderProjectMetaBlock(projectMeta: ProjectMetaRecord | undefined): string[] {
  if (!projectMeta) return [];
  const lines = [
    `### [project_meta] ${projectMeta.relativePath} (${projectMeta.updatedAt})`,
    `- project_id: ${projectMeta.projectId}`,
    `- project_name: ${projectMeta.projectName}`,
    `- description: ${projectMeta.description}`,
    `- status: ${projectMeta.status}`,
    `- aliases: ${projectMeta.aliases.join(", ") || "none"}`,
  ];
  if (projectMeta.dreamUpdatedAt) {
    lines.push(`- dream_updated_at: ${projectMeta.dreamUpdatedAt}`);
  }
  lines.push("");
  return lines;
}

function renderContext(
  route: MemoryRoute,
  userSummary: MemoryUserSummary,
  projectMeta: ProjectMetaRecord | undefined,
  records: Array<{ relativePath: string; type: string; updatedAt: string; content: string }>,
): string {
  if (!hasUserSummary(userSummary) && !projectMeta && records.length === 0) return "";
  const lines = [
    "## ClawXMemory Recall",
    `route=${route}`,
    "",
    ...renderUserSummaryBlock(userSummary),
    ...renderProjectMetaBlock(projectMeta),
  ];
  for (const record of records) {
    lines.push(`### [${record.type}] ${record.relativePath} (${record.updatedAt})`);
    lines.push(record.content.trim());
    lines.push("");
  }
  lines.push("Treat these file memories as the authoritative long-term memory for this turn when relevant.");
  return lines.join("\n").trim();
}

function buildEmptyResult(query: string, trace: RetrievalTrace, elapsedMs: number, cacheHit = false): RetrievalResult {
  return {
    query,
    intent: "none",
    enoughAt: "none",
    profile: null,
    evidenceNote: "",
    l2Results: [],
    l1Results: [],
    l0Results: [],
    context: "",
    trace,
    debug: {
      mode: "none",
      elapsedMs,
      cacheHit,
      path: "explicit",
      route: "none",
      manifestCount: 0,
      selectedFileIds: [],
    },
  };
}

function routeNeedsProjectMemory(route: MemoryRoute): boolean {
  return route === "feedback" || route === "project" || route === "mixed";
}

function kindsForRoute(route: MemoryRoute): Array<"feedback" | "project"> {
  if (route === "feedback") return ["feedback"];
  if (route === "project") return ["project"];
  if (route === "mixed") return ["feedback", "project"];
  return [];
}

function resolveWorkspaceToken(workspaceHint: string | undefined): string {
  const normalized = workspaceHint?.replace(/\\/g, "/").trim() ?? "";
  if (!normalized) return "";
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1]?.toLowerCase() ?? "";
}

function isProjectAliasCandidate(value: string): boolean {
  const normalized = value.toLowerCase().trim();
  if (!normalized) return false;
  if (normalized.length > 80) return false;
  if (/[。！？!?]/.test(normalized)) return false;
  return true;
}

function projectIdentityTerms(project: ProjectMetaRecord): string[] {
  return Array.from(new Set(
    [project.projectName, ...project.aliases]
      .map((item) => item.toLowerCase().trim())
      .filter(isProjectAliasCandidate),
  ));
}

function rankProjects(
  projects: ProjectMetaRecord[],
  text: string,
  workspaceToken: string,
): ProjectResolutionCandidateScore[] {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return [];
  return projects
    .map((project) => ({
      projectId: project.projectId,
      projectName: project.projectName,
      score: scoreProjectMeta(project, normalized, workspaceToken),
      exact: hasExactProjectMention(project, normalized) ? 1 : 0,
      updatedAt: project.updatedAt,
    }))
    .sort((left, right) =>
      right.exact - left.exact
      || right.score - left.score
      || right.updatedAt.localeCompare(left.updatedAt)
    );
}

function scoreProjectMeta(project: ProjectMetaRecord, text: string, workspaceToken: string): number {
  const identities = projectIdentityTerms(project);
  const description = project.description.toLowerCase().trim();
  let score = 0;
  for (const candidate of identities) {
    if (text.includes(candidate)) score += 10;
    if (candidate.includes(text) && text.length >= 4) score += 3;
    const candidateTokens = candidate.split(/[\s/_-]+/).filter((token) => token.length >= 3);
    for (const token of candidateTokens) {
      if (text.includes(token)) score += 2;
    }
  }
  if (description) {
    const descriptionTokens = description.split(/[\s/_-]+/).filter((token) => token.length >= 4);
    for (const token of descriptionTokens) {
      if (text.includes(token)) score += 1;
    }
  }
  if (workspaceToken) {
    const workspaceHit = identities.some((candidate) => candidate.includes(workspaceToken) || workspaceToken.includes(candidate));
    if (workspaceHit) score += 2;
  }
  return score;
}

function hasExactProjectMention(project: ProjectMetaRecord, text: string): boolean {
  const candidates = projectIdentityTerms(project);
  return candidates.some((candidate) => text.includes(candidate));
}

function resolveProjectFromText(
  projects: ProjectMetaRecord[],
  text: string,
  workspaceToken: string,
): { projectId?: string; score: number; exact: number; candidates: ProjectResolutionCandidateScore[] } {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return { score: 0, exact: 0, candidates: [] };
  const candidates = rankProjects(projects, normalized, workspaceToken);
  const best = candidates[0];
  if (!best || best.score <= 0) return { score: 0, exact: 0, candidates };
  const competing = candidates.filter((item) => item.score === best.score && item.exact === best.exact);
  if (competing.length > 1) {
    const canonicalNames = new Set(
      competing.map((item) => item.projectName.toLowerCase().trim()).filter(Boolean),
    );
    if (canonicalNames.size > 1) return { score: 0, exact: 0, candidates };
  }
  return { projectId: best.projectId, score: best.score, exact: best.exact, candidates };
}

function resolveCurrentProject(
  projects: ProjectMetaRecord[],
  query: string,
  recentMessages: MemoryMessage[] | undefined,
  workspaceHint: string | undefined,
): ProjectResolutionResult {
  if (projects.length === 0) {
    return {
      score: 0,
      exact: 0,
      source: "none",
      workspaceToken: resolveWorkspaceToken(workspaceHint),
      recentUserTexts: [],
      attempts: [],
    };
  }
  const queryText = query.toLowerCase().trim();
  const workspaceToken = resolveWorkspaceToken(workspaceHint);
  const recentUserTexts = [...(recentMessages ?? [])]
    .filter((message) => message.role === "user")
    .map((message) => message.content.toLowerCase().trim())
    .filter(Boolean)
    .reverse();
  if (!queryText) {
    return {
      score: 0,
      exact: 0,
      source: "none",
      workspaceToken,
      recentUserTexts,
      attempts: [],
    };
  }
  const fromQuery = resolveProjectFromText(projects, queryText, workspaceToken);
  const attempts: ProjectResolutionAttempt[] = [{
    source: "query",
    text: queryText,
    ...(fromQuery.projectId ? { projectId: fromQuery.projectId } : {}),
    score: fromQuery.score,
    exact: fromQuery.exact,
    candidates: fromQuery.candidates.slice(0, 8),
  }];
  if (fromQuery.projectId) {
    return {
      projectId: fromQuery.projectId,
      score: fromQuery.score,
      exact: fromQuery.exact,
      source: "query",
      matchedText: queryText,
      workspaceToken,
      recentUserTexts,
      attempts,
    };
  }

  for (const text of recentUserTexts) {
    const resolved = resolveProjectFromText(projects, text, workspaceToken);
    attempts.push({
      source: "recent",
      text,
      ...(resolved.projectId ? { projectId: resolved.projectId } : {}),
      score: resolved.score,
      exact: resolved.exact,
      candidates: resolved.candidates.slice(0, 8),
    });
    if (resolved.projectId) {
      return {
        projectId: resolved.projectId,
        score: resolved.score,
        exact: resolved.exact,
        source: "recent",
        matchedText: text,
        workspaceToken,
        recentUserTexts,
        attempts,
      };
    }
  }
  return {
    score: 0,
    exact: 0,
    source: "none",
    workspaceToken,
    recentUserTexts,
    attempts,
  };
}

function buildProjectManifestSelection(
  repository: MemoryRepository,
  route: MemoryRoute,
  projectId: string,
  limit = MANIFEST_LIMIT,
): ProjectManifestSelection {
  const kinds = kindsForRoute(route);
  const boundedLimit = Math.max(1, Math.min(MANIFEST_LIMIT, limit));
  if (!routeNeedsProjectMemory(route)) {
    return { allCount: 0, entries: [], kinds, limit: boundedLimit };
  }
  const query = {
    kinds,
    projectId,
    scope: "project",
  } as const;
  const allCount = repository.countMemoryEntries(query);
  const allEntries = repository.listMemoryEntries({
    ...query,
    limit: Math.max(boundedLimit, Math.min(1000, Math.max(allCount, 500))),
  });
  const sorted = [...allEntries].sort((left, right) =>
    projectManifestPriority(left) - projectManifestPriority(right)
    || right.updatedAt.localeCompare(left.updatedAt)
    || left.relativePath.localeCompare(right.relativePath)
  );
  return {
    allCount,
    entries: sorted.slice(0, boundedLimit),
    kinds,
    limit: boundedLimit,
  };
}

export class ReasoningRetriever {
  private readonly cache = new Map<string, RecallCacheEntry>();
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
      recallTopK: DEFAULT_RECALL_TOP_K,
      autoIndexIntervalMinutes: 60,
      autoDreamIntervalMinutes: 360,
      autoDreamMinNewL1: 10,
      dreamProjectRebuildTimeoutMs: 180_000,
    };
  }

  private buildCacheKey(
    query: string,
    settings: IndexingSettings,
    retrievalMode: "auto" | "explicit",
    workspaceHint: string,
  ): string {
    return JSON.stringify({
      query: normalizeQueryKey(query),
      snapshot: this.repository.getSnapshotVersion(),
      retrievalMode,
      recallTopK: settings.recallTopK,
      workspaceHint: normalizeQueryKey(workspaceHint),
    });
  }

  private getCachedResult(cacheKey: string): RetrievalResult | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt <= Date.now()) {
      this.cache.delete(cacheKey);
      return null;
    }
    return cached.result;
  }

  private saveCache(cacheKey: string, result: RetrievalResult): void {
    this.cache.set(cacheKey, {
      expiresAt: Date.now() + RECALL_CACHE_TTL_MS,
      result,
    });
  }

  private updateRuntimeStats(
    result: RetrievalResult,
    startedAt: number,
    cacheHit: boolean,
    mode: RecallMode,
    retrievalMode: "auto" | "explicit",
  ): void {
    const elapsedMs = Date.now() - startedAt;
    this.runtimeStats = {
      lastRecallMs: elapsedMs,
      recallTimeouts: this.runtimeStats.recallTimeouts,
      lastRecallMode: mode,
      lastRecallPath: retrievalMode,
      lastRecallBudgetLimited: Boolean(result.debug?.manifestCount && result.debug.manifestCount >= MANIFEST_LIMIT),
      lastShadowDeepQueued: false,
      lastRecallInjected: Boolean(result.context.trim()),
      lastRecallEnoughAt: result.enoughAt,
      lastRecallCacheHit: cacheHit,
    };
  }

  async retrieve(query: string, options: RetrievalOptions = {}): Promise<RetrievalResult> {
    const startedAt = Date.now();
    const normalizedQuery = decodeEscapedUnicodeText(query.trim(), true);
    const settings = this.currentSettings();
    const retrievalMode = options.retrievalMode ?? "explicit";
    const traceId = buildTraceId("trace", normalizedQuery);
    const trace: RetrievalTrace = {
      traceId,
      query: normalizedQuery,
      mode: retrievalMode,
      startedAt: nowIso(),
      finishedAt: nowIso(),
      steps: [{
        stepId: `${traceId}:step:1`,
        kind: "recall_start",
        title: "Recall Started",
        status: "info",
        inputSummary: normalizedQuery,
        outputSummary: `mode=${retrievalMode}`,
        details: [
          kvDetail("recall-start-inputs", "Recall Inputs", [
            { label: "query", value: normalizedQuery },
            { label: "mode", value: retrievalMode },
            { label: "recentMessages", value: options.recentMessages?.length ?? 0 },
            { label: "workspaceHint", value: options.workspaceHint ?? "none" },
          ]),
          ...(options.recentMessages?.length
            ? [listDetail(
                "recent-user-messages",
                "Recent User Messages",
                options.recentMessages
                  .filter((message) => message.role === "user")
                  .map((message) => previewText(message.content, 180)),
              )]
            : []),
        ],
      }],
    };

    if (!normalizedQuery) {
      const empty = buildEmptyResult(normalizedQuery, trace, 0);
      this.updateRuntimeStats(empty, startedAt, false, "none", retrievalMode);
      return empty;
    }

    const cacheKey = this.buildCacheKey(normalizedQuery, settings, retrievalMode, options.workspaceHint ?? "");
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      const result: RetrievalResult = {
        ...cached,
        debug: {
          mode: cached.debug?.mode ?? (cached.context.trim() ? "llm" : "none"),
          cacheHit: true,
          elapsedMs: Date.now() - startedAt,
          ...(cached.debug?.path ? { path: cached.debug.path } : {}),
          ...(cached.debug?.route ? { route: cached.debug.route } : {}),
          ...(typeof cached.debug?.manifestCount === "number" ? { manifestCount: cached.debug.manifestCount } : {}),
          ...(cached.debug?.selectedFileIds ? { selectedFileIds: cached.debug.selectedFileIds } : {}),
          ...(cached.debug?.resolvedProjectId ? { resolvedProjectId: cached.debug.resolvedProjectId } : {}),
        },
      };
      this.updateRuntimeStats(result, startedAt, true, cached.context.trim() ? "llm" : "none", retrievalMode);
      return result;
    }

    let routePromptDebug: RetrievalPromptDebug | undefined;
    const route = await this.extractor.decideFileMemoryRoute({
      query: normalizedQuery,
      ...(options.recentMessages ? { recentMessages: options.recentMessages } : {}),
      debugTrace: (debug) => {
        routePromptDebug = debug;
      },
    });
    trace.steps.push({
      stepId: `${traceId}:step:${trace.steps.length + 1}`,
      kind: "memory_gate",
      title: "Memory Gate",
      status: route === "none" ? "skipped" : "success",
      inputSummary: normalizedQuery,
      outputSummary: `route=${route}`,
      details: [
        kvDetail("gate-route", "Route", [
          { label: "route", value: route },
          { label: "recentMessages", value: options.recentMessages?.length ?? 0 },
          { label: "workspaceHint", value: options.workspaceHint ?? "none" },
        ]),
      ],
      ...(routePromptDebug ? { promptDebug: routePromptDebug } : {}),
    });

    if (route === "none") {
      trace.steps.push({
        stepId: `${traceId}:step:${trace.steps.length + 1}`,
        kind: "recall_skipped",
        title: "Recall Skipped",
        status: "skipped",
        inputSummary: "route=none",
        outputSummary: "This query does not need long-term memory.",
      });
      trace.steps.push({
        stepId: `${traceId}:step:${trace.steps.length + 1}`,
        kind: "context_rendered",
        title: "Context Rendered",
        status: "skipped",
        inputSummary: "0 records",
        outputSummary: "No memory context injected.",
      });
      trace.finishedAt = nowIso();
      const result = buildEmptyResult(normalizedQuery, trace, Date.now() - startedAt);
      this.updateRuntimeStats(result, startedAt, false, "none", retrievalMode);
      this.saveCache(cacheKey, result);
      return result;
    }

    const store = this.repository.getFileMemoryStore();
    const userSummary = store.getUserSummary();
    trace.steps.push({
      stepId: `${traceId}:step:${trace.steps.length + 1}`,
      kind: "user_base_loaded",
      title: "User Base Loaded",
      status: hasUserSummary(userSummary) ? "success" : "warning",
      inputSummary: "global user profile",
      outputSummary: hasUserSummary(userSummary) ? "Attached compact global user profile." : "No compact global user profile is available yet.",
      details: [
        kvDetail("user-summary", "User Profile", [
          { label: "profile", value: userSummary.profile ? "present" : "missing" },
          { label: "preferences", value: userSummary.preferences.length },
          { label: "constraints", value: userSummary.constraints.length },
          { label: "relationships", value: userSummary.relationships.length },
        ]),
        ...(userSummary.files.length > 0
          ? [listDetail(
              "user-summary-files",
              "Source Files",
              userSummary.files.map((file) => `${file.relativePath} | ${file.updatedAt}`),
            )]
          : []),
      ],
    });

    let resolvedProjectId = "";
    let resolvedProjectMeta: ProjectMetaRecord | undefined;
    if (routeNeedsProjectMemory(route)) {
      const projectMetas = store.listProjectMetas();
      const resolution = resolveCurrentProject(projectMetas, normalizedQuery, options.recentMessages, options.workspaceHint);
      resolvedProjectId = resolution.projectId ?? "";
      resolvedProjectMeta = resolvedProjectId
        ? projectMetas.find((project) => project.projectId === resolvedProjectId)
        : undefined;
      trace.steps.push({
        stepId: `${traceId}:step:${trace.steps.length + 1}`,
        kind: "project_resolved",
        title: "Project Resolved",
        status: resolvedProjectId ? "success" : "warning",
        inputSummary: `${projectMetas.length} formal projects`,
        outputSummary: resolvedProjectId ? `project_id=${resolvedProjectId}` : "No formal project matched the current query.",
        details: [
          kvDetail("project-resolution", "Project Resolution", [
            { label: "project_id", value: resolvedProjectId || "none" },
            { label: "score", value: resolution.score },
            { label: "exact", value: resolution.exact },
            { label: "source", value: resolution.source },
            { label: "matchedText", value: resolution.matchedText ?? "none" },
            { label: "workspaceToken", value: resolution.workspaceToken || "none" },
            { label: "recentUserTexts", value: resolution.recentUserTexts.length },
          ]),
          ...(resolution.recentUserTexts.length > 0
            ? [listDetail("project-resolution-recent", "Recent User Texts", resolution.recentUserTexts)]
            : []),
          jsonDetail(
            "project-resolution-attempts",
            "Resolver Candidate Scores",
            resolution.attempts.map((attempt) => ({
              source: attempt.source,
              text: attempt.text,
              projectId: attempt.projectId ?? null,
              score: attempt.score,
              exact: attempt.exact,
              candidates: attempt.candidates,
            })),
          ),
        ],
      });
    }

    const manifestSelection = resolvedProjectId
      ? buildProjectManifestSelection(this.repository, route, resolvedProjectId, MANIFEST_LIMIT)
      : {
          allCount: 0,
          entries: [],
          kinds: kindsForRoute(route),
          limit: MANIFEST_LIMIT,
        };
    const manifest = manifestSelection.entries;
    trace.steps.push({
      stepId: `${traceId}:step:${trace.steps.length + 1}`,
      kind: "manifest_built",
      title: "Manifest Built",
      status: manifest.length > 0 ? "success" : routeNeedsProjectMemory(route) ? "warning" : "skipped",
      inputSummary: resolvedProjectId ? `project_id=${resolvedProjectId}` : `route=${route}`,
      outputSummary: resolvedProjectId
        ? `${manifest.length} locally ranked manifest entries ready${manifestSelection.allCount > manifest.length ? ` (top ${manifest.length} of ${manifestSelection.allCount})` : ""}.`
        : routeNeedsProjectMemory(route)
          ? "Project recall skipped because no formal project was resolved."
          : "User-only recall does not require a project manifest.",
      details: [
        kvDetail("manifest-size", "Manifest", [
          { label: "count", value: manifest.length },
          { label: "availableBeforeLimit", value: manifestSelection.allCount },
          { label: "route", value: route },
          { label: "project_id", value: resolvedProjectId || "none" },
          { label: "kinds", value: manifestSelection.kinds.join(", ") || "none" },
          { label: "limit", value: manifestSelection.limit },
        ]),
        listDetail(
          "manifest-preview",
          "Sorted Candidates",
          manifest.map((entry) => `${entry.updatedAt} | ${entry.type} | ${entry.relativePath} | ${entry.description}`),
        ),
      ],
    });

    let manifestSelectionPromptDebug: RetrievalPromptDebug | undefined;
    const rawSelectedIds = manifest.length > 0
      ? await this.extractor.selectFileManifestEntries({
          query: normalizedQuery,
          route,
          manifest,
          limit: Math.max(1, Math.min(5, settings.recallTopK || DEFAULT_RECALL_TOP_K)),
          debugTrace: (debug) => {
            manifestSelectionPromptDebug = debug;
          },
        })
      : [];
    const selectedIds = Array.from(new Set(rawSelectedIds))
      .slice(0, Math.max(1, Math.min(5, settings.recallTopK || DEFAULT_RECALL_TOP_K)));
    trace.steps.push({
      stepId: `${traceId}:step:${trace.steps.length + 1}`,
      kind: "manifest_selected",
      title: "Manifest Selected",
      status: selectedIds.length > 0 ? "success" : manifest.length > 0 ? "warning" : "skipped",
      inputSummary: `${manifest.length} entries`,
      outputSummary: `${selectedIds.length} file ids selected.`,
      details: [
        listDetail(
          "manifest-selection-input",
          "Manifest Candidate IDs",
          manifest.map((entry) => entry.relativePath),
        ),
        listDetail("selected-files", "Selected File IDs", selectedIds),
        kvDetail("manifest-selection-summary", "Selection Summary", [
          { label: "inputCount", value: manifest.length },
          { label: "selectedCount", value: selectedIds.length },
        ]),
      ],
      ...(manifestSelectionPromptDebug ? { promptDebug: manifestSelectionPromptDebug } : {}),
    });

    const records = this.repository.getMemoryRecordsByIds(selectedIds, FILE_LINE_LIMIT);
    const missingIds = selectedIds.filter((id) => !records.some((record) => record.relativePath === id));
    trace.steps.push({
      stepId: `${traceId}:step:${trace.steps.length + 1}`,
      kind: "files_loaded",
      title: "Files Loaded",
      status: records.length > 0 ? "success" : selectedIds.length > 0 ? "warning" : "skipped",
      inputSummary: `${selectedIds.length} requested`,
      outputSummary: `${records.length} files loaded.`,
      details: [
        listDetail("requested-files", "Requested IDs", selectedIds),
        listDetail(
          "loaded-files",
          "Loaded Files",
          records.map((record) => `${record.relativePath} | ${previewText(record.preview, 180)}`),
        ),
        ...(missingIds.length > 0
          ? [listDetail("missing-files", "Missing IDs", missingIds)]
          : []),
      ],
    });

    const context = renderContext(route, userSummary, resolvedProjectMeta, records);
    trace.steps.push({
      stepId: `${traceId}:step:${trace.steps.length + 1}`,
      kind: "context_rendered",
      title: "Context Rendered",
      status: context.trim() ? "success" : "warning",
      inputSummary: `${records.length} files + ${hasUserSummary(userSummary) ? "user base" : "no user base"}`,
      outputSummary: context.trim() ? "Memory context prepared." : "No memory context injected.",
      details: [
        kvDetail("context-rendered-summary", "Context Summary", [
          { label: "route", value: route },
          { label: "userBaseInjected", value: hasUserSummary(userSummary) ? "yes" : "no" },
          { label: "projectMetaInjected", value: resolvedProjectMeta ? "yes" : "no" },
          { label: "fileCount", value: records.length },
          { label: "characters", value: context.length },
          { label: "lines", value: context ? context.split("\n").length : 0 },
        ]),
        listDetail(
          "context-rendered-blocks",
          "Injected Blocks",
          [
            ...(hasUserSummary(userSummary) ? ["global/User/user-profile.md"] : []),
            ...(resolvedProjectMeta ? [resolvedProjectMeta.relativePath] : []),
            ...records.map((record) => record.relativePath),
          ],
        ),
      ],
    });
    trace.finishedAt = nowIso();

    const result: RetrievalResult = {
      query: normalizedQuery,
      intent: route,
      enoughAt: records.length > 0 ? "file" : manifest.length > 0 ? "manifest" : hasUserSummary(userSummary) ? "profile" : "none",
      profile: null,
      evidenceNote: records.length > 0
        ? `Attached global user profile and selected ${records.length} memory files from ${manifest.length} manifest entries${resolvedProjectId ? ` for project ${resolvedProjectId}` : ""}.`
        : manifest.length > 0
          ? "Attached global user profile. The project manifest contained entries, but none were loaded."
          : hasUserSummary(userSummary)
            ? "Attached global user profile only."
            : "",
      l2Results: [],
      l1Results: [],
      l0Results: [],
      context,
      trace,
      debug: {
        mode: context.trim() ? "llm" : "none",
        elapsedMs: Date.now() - startedAt,
        cacheHit: false,
        path: retrievalMode,
        route,
        manifestCount: manifest.length,
        selectedFileIds: records.map((record) => record.relativePath),
        ...(resolvedProjectId ? { resolvedProjectId } : {}),
      },
    };
    this.updateRuntimeStats(result, startedAt, false, context.trim() ? "llm" : "none", retrievalMode);
    this.saveCache(cacheKey, result);
    return result;
  }
}
