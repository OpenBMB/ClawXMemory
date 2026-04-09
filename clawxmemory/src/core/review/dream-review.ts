import type {
  MemoryFileRecord,
  MemoryManifestEntry,
  ProjectMetaRecord,
} from "../types.js";
import type { HeartbeatStats } from "../pipeline/heartbeat.js";
import { LlmMemoryExtractor } from "../skills/llm-extraction.js";
import { MemoryRepository } from "../storage/sqlite.js";

type LoggerLike = {
  info?: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
};

interface DreamReviewRunnerOptions {
  logger?: LoggerLike;
  getDreamProjectRebuildTimeoutMs?: () => number;
}

export interface DreamRewriteOutcome {
  reviewedL1: number;
  rewrittenProjects: number;
  deletedProjects: number;
  profileUpdated: boolean;
  duplicateTopicCount: number;
  conflictTopicCount: number;
  prunedProjectL1Refs: number;
  prunedProfileL1Refs: number;
  summary: string;
}

export interface DreamRunResult extends DreamRewriteOutcome {
  prepFlush: HeartbeatStats;
  trigger?: "manual" | "scheduled";
  status?: "success" | "skipped";
  skipReason?: string;
}

interface TmpAnalysis {
  entry: MemoryManifestEntry;
  record: MemoryFileRecord;
  searchText: string;
  projectName: string;
  description: string;
  aliases: string[];
  capturedAt: string;
  sourceSessionKey: string;
}

interface TmpGroup {
  projectId?: string;
  projectName: string;
  description: string;
  aliases: Set<string>;
  entries: TmpAnalysis[];
}

const GENERIC_TMP_NAMES = new Set([
  "memory-item",
  "feedback-item",
  "project-item",
  "overview",
  "project",
  "feedback",
  "rule",
]);

function normalizeText(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return Array.from(new Set(
    normalizeText(value)
      .toLowerCase()
      .split(/[^a-z0-9\u4e00-\u9fff]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2),
  ));
}

function uniqueStrings(values: Array<string | undefined>, max = 20): string[] {
  return Array.from(new Set(
    values
      .map((value) => normalizeText(value))
      .filter(Boolean),
  )).slice(0, max);
}

function deriveProjectName(analysis: TmpAnalysis): string {
  const candidates = [
    analysis.projectName,
    ...analysis.aliases,
    analysis.description.split(/[。！？.!?]/)[0],
    analysis.record.name,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);
  for (const candidate of candidates) {
    if (!GENERIC_TMP_NAMES.has(candidate.toLowerCase())) return candidate;
  }
  return candidates[0] ?? "project";
}

function countByType(entries: MemoryManifestEntry[], type: "user" | "feedback" | "project"): number {
  return entries.filter((entry) => entry.type === type).length;
}

function scoreTokenOverlap(left: string, right: string): number {
  const leftTokens = tokenize(left);
  const rightTokens = new Set(tokenize(right));
  let score = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) score += token.length >= 4 ? 3 : 1;
  }
  const normalizedLeft = normalizeText(left).toLowerCase();
  const normalizedRight = normalizeText(right).toLowerCase();
  if (normalizedLeft && normalizedRight) {
    if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) {
      score += 4;
    }
  }
  return score;
}

function scoreProjectMeta(meta: ProjectMetaRecord, analysis: TmpAnalysis): number {
  const haystack = [
    meta.projectName,
    meta.description,
    ...meta.aliases,
  ].join(" ");
  return scoreTokenOverlap(haystack, analysis.searchText);
}

function scoreTemporalAffinity(left: TmpAnalysis, right: TmpAnalysis): number {
  let score = 0;
  if (left.sourceSessionKey && right.sourceSessionKey && left.sourceSessionKey === right.sourceSessionKey) {
    score += 8;
  }
  const leftMs = Date.parse(left.capturedAt);
  const rightMs = Date.parse(right.capturedAt);
  if (Number.isFinite(leftMs) && Number.isFinite(rightMs)) {
    const diff = Math.abs(leftMs - rightMs);
    if (diff <= 15 * 60 * 1000) score += 5;
    else if (diff <= 2 * 60 * 60 * 1000) score += 2;
  }
  return score;
}

function scoreGroup(group: TmpGroup, analysis: TmpAnalysis): number {
  const haystack = [
    group.projectName,
    group.description,
    ...Array.from(group.aliases),
  ].join(" ");
  const contentScore = scoreTokenOverlap(haystack, analysis.searchText);
  const temporalScore = group.entries.reduce(
    (best, entry) => Math.max(best, scoreTemporalAffinity(entry, analysis)),
    0,
  );
  return contentScore + temporalScore;
}

function chooseBestMatch<T>(items: T[], scoreFn: (item: T) => number): { item?: T; score: number } {
  const scored = items
    .map((item) => ({ item, score: scoreFn(item) }))
    .sort((left, right) => right.score - left.score);
  const best = scored[0];
  if (!best || best.score <= 0) return { score: 0 };
  if (scored[1] && scored[1].score === best.score) return { score: 0 };
  return best;
}

function analyzeTmpRecord(record: MemoryFileRecord, repository: MemoryRepository): TmpAnalysis {
  const candidate = repository.getFileMemoryStore().toCandidate(record);
  if (candidate.type === "project") {
    return {
      entry: record,
      record,
      projectName: normalizeText(candidate.name || record.name || record.description) || "project",
      description: normalizeText(candidate.description || candidate.stage || record.description || record.preview),
      aliases: uniqueStrings([
        candidate.name,
        candidate.description,
        ...(candidate.decisions ?? []).slice(0, 2),
        ...(candidate.notes ?? []).slice(0, 2),
      ]),
      capturedAt: record.capturedAt || record.updatedAt,
      sourceSessionKey: record.sourceSessionKey || "",
      searchText: [
        candidate.name,
        candidate.description,
        candidate.stage,
        ...(candidate.decisions ?? []),
        ...(candidate.constraints ?? []),
        ...(candidate.nextSteps ?? []),
        ...(candidate.blockers ?? []),
        ...(candidate.timeline ?? []),
        ...(candidate.notes ?? []),
      ].map((item) => normalizeText(item)).filter(Boolean).join(" "),
    };
  }

  return {
    entry: record,
    record,
    projectName: normalizeText(candidate.name || record.name),
    description: normalizeText(candidate.description || candidate.rule || record.description || record.preview),
      aliases: uniqueStrings([
        candidate.name,
        candidate.description,
        candidate.rule,
        ...(candidate.notes ?? []).slice(0, 2),
      ]),
      capturedAt: record.capturedAt || record.updatedAt,
      sourceSessionKey: record.sourceSessionKey || "",
      searchText: [
        candidate.name,
        candidate.description,
      candidate.rule,
      candidate.why,
      candidate.howToApply,
      ...(candidate.notes ?? []),
    ].map((item) => normalizeText(item)).filter(Boolean).join(" "),
  };
}

function attachAnalysis(group: TmpGroup, analysis: TmpAnalysis): void {
  const existingHasProject = group.entries.some((entry) => entry.record.type === "project");
  group.entries.push(analysis);
  if (analysis.record.type === "project") {
    group.description = normalizeText(analysis.description || group.description);
  } else if (!existingHasProject && !group.description) {
    group.description = normalizeText(analysis.description);
  }
  for (const alias of analysis.aliases) {
    if (alias) group.aliases.add(alias);
  }
}

export class DreamRewriteRunner {
  constructor(
    private readonly repository: MemoryRepository,
    // Reserved for future semantic merge passes; v1 Dream remains file-only.
    private readonly extractor: LlmMemoryExtractor,
    private readonly options: DreamReviewRunnerOptions = {},
  ) {}

  async run(): Promise<DreamRewriteOutcome> {
    const store = this.repository.getFileMemoryStore();
    const before = store.listMemoryEntries({ limit: 1000, includeTmp: true });
    if (before.length === 0) {
      return {
        reviewedL1: 0,
        rewrittenProjects: 0,
        deletedProjects: 0,
        profileUpdated: false,
        duplicateTopicCount: 0,
        conflictTopicCount: 0,
        prunedProjectL1Refs: 0,
        prunedProfileL1Refs: 0,
        summary: "No file-based memory exists yet, so Dream had nothing to organize.",
      };
    }

    const repaired = store.repairManifests();
    const tmpEntries = store.listTmpEntries(1000);
    const tmpRecords = tmpEntries
      .map((entry) => store.getMemoryRecord(entry.relativePath, 5000))
      .filter((record): record is MemoryFileRecord => Boolean(record));
    const analyses = tmpRecords.map((record) => analyzeTmpRecord(record, this.repository));
    const formalMetas = store.listProjectMetas();
    const groups: TmpGroup[] = [];
    const unresolved: TmpAnalysis[] = [];

    for (const analysis of analyses.filter((item) => item.record.type === "project")) {
      const formal = chooseBestMatch(formalMetas, (meta) => scoreProjectMeta(meta, analysis));
      if (formal.item && formal.score > 0) {
        let group = groups.find((item) => item.projectId === formal.item?.projectId);
        if (!group) {
          group = {
            projectId: formal.item.projectId,
            projectName: formal.item.projectName,
            description: formal.item.description,
            aliases: new Set(formal.item.aliases),
            entries: [],
          };
          groups.push(group);
        }
        attachAnalysis(group, analysis);
        continue;
      }

      const local = chooseBestMatch(groups.filter((item) => !item.projectId), (group) => scoreGroup(group, analysis));
      if (local.item && local.score > 0) {
        attachAnalysis(local.item, analysis);
        continue;
      }

      groups.push({
        projectName: analysis.projectName,
        description: analysis.description,
        aliases: new Set(analysis.aliases.concat(analysis.projectName)),
        entries: [analysis],
      });
    }

    for (const analysis of analyses.filter((item) => item.record.type === "feedback")) {
      const formal = chooseBestMatch(formalMetas, (meta) => scoreProjectMeta(meta, analysis));
      const local = chooseBestMatch(groups, (group) => scoreGroup(group, analysis));
      if (formal.item && formal.score >= Math.max(3, local.score)) {
        let group = groups.find((item) => item.projectId === formal.item?.projectId);
        if (!group) {
          group = {
            projectId: formal.item.projectId,
            projectName: formal.item.projectName,
            description: formal.item.description,
            aliases: new Set(formal.item.aliases),
            entries: [],
          };
          groups.push(group);
        }
        attachAnalysis(group, analysis);
        continue;
      }
      if (local.item && local.score > 0) {
        attachAnalysis(local.item, analysis);
        continue;
      }
      const derivedName = deriveProjectName(analysis);
      if (!derivedName && !analysis.description) {
        unresolved.push(analysis);
        continue;
      }
      groups.push({
        projectName: derivedName || "project",
        description: analysis.description || derivedName || "project",
        aliases: new Set(analysis.aliases.concat(derivedName || "")),
        entries: [analysis],
      });
    }

    const touchedProjectIds = new Set<string>();
    let promotedTmpCount = 0;
    for (const group of groups) {
      if (group.entries.length === 0) continue;
      const seed = [group.projectName, group.description, ...Array.from(group.aliases)].join(" ");
      const projectId = group.projectId || store.createStableProjectId(seed);
      const primary = group.entries.find((item) => item.record.type === "project") ?? group.entries[0]!;
      store.upsertProjectMeta({
        projectId,
        projectName: normalizeText(primary.projectName || group.projectName) || projectId,
        description: normalizeText(group.description || primary.description || primary.record.description) || projectId,
        aliases: uniqueStrings([...Array.from(group.aliases), primary.projectName, primary.description], 50),
      });
      touchedProjectIds.add(projectId);
      for (const analysis of group.entries) {
        if (store.promoteTmpRecord(analysis.entry.relativePath, projectId)) {
          promotedTmpCount += 1;
        }
      }
    }

    let duplicateCount = 0;
    for (const projectId of touchedProjectIds) {
      const merged = store.mergeDuplicateEntries(store.listMemoryEntries({
        scope: "project",
        projectId,
        limit: 500,
      }));
      duplicateCount += merged.merged;
    }

    for (const analysis of unresolved) {
      store.incrementDreamAttempts(analysis.entry.relativePath);
    }
    const cleanup = store.cleanupTmpEntries();

    const after = store.listMemoryEntries({ limit: 1000, includeTmp: true });
    const rewrittenProjects = touchedProjectIds.size;
    const deletedProjects = 0;
    const profileUpdated = repaired.changed > 0 || promotedTmpCount > 0 || duplicateCount > 0 || cleanup.changedFiles.length > 0;
    const summaryParts = [
      `Dream reviewed ${before.length} memory files.`,
      repaired.summary,
      promotedTmpCount > 0
        ? `Promoted ${promotedTmpCount} temporary project memories into ${rewrittenProjects} formal projects.`
        : "No temporary project memories were ready to promote.",
      duplicateCount > 0
        ? `Merged ${duplicateCount} duplicate formal project memory files.`
        : "No duplicate formal project memory files needed merging.",
      unresolved.length > 0
        ? `Left ${unresolved.length} temporary feedback memories unresolved for a later Dream pass.`
        : "No temporary memory was left unresolved.",
      cleanup.archived > 0 || cleanup.deleted > 0
        ? `Archived ${cleanup.archived} and deleted ${cleanup.deleted} stale temporary memories.`
        : "No stale temporary memories needed cleanup.",
    ];
    const summary = summaryParts.join(" ");
    this.options.logger?.info?.(`[clawxmemory] ${summary}`);
    return {
      reviewedL1: before.length,
      rewrittenProjects,
      deletedProjects,
      profileUpdated,
      duplicateTopicCount: duplicateCount,
      conflictTopicCount: unresolved.length,
      prunedProjectL1Refs: 0,
      prunedProfileL1Refs: 0,
      summary,
    };
  }
}
