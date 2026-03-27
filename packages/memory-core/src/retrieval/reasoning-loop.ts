import type {
  GlobalFactItem,
  IntentType,
  L0SearchResult,
  L1SearchResult,
  L2SearchResult,
  RetrievalResult,
} from "../types.js";
import { classifyIntent } from "../skills/intent-skill.js";
import { MemoryRepository } from "../storage/sqlite.js";
import { scoreMatch, truncate } from "../utils/text.js";

export interface RetrievalOptions {
  l2Limit?: number;
  l1Limit?: number;
  l0Limit?: number;
  includeFacts?: boolean;
}

function normalizeScoredL1(query: string, items: ReturnType<MemoryRepository["searchL1"]>): L1SearchResult[] {
  return items.map((item) => ({
    score: Math.max(scoreMatch(query, item.summary), scoreMatch(query, item.situationTimeInfo)),
    item,
  }));
}

function normalizeScoredL0(query: string, items: ReturnType<MemoryRepository["searchL0"]>): L0SearchResult[] {
  return items.map((item) => ({
    score: scoreMatch(query, JSON.stringify(item.messages)),
    item,
  }));
}

function sortByScoreDesc<T extends { score: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.score - a.score);
}

function isEnoughAtL2(results: L2SearchResult[]): boolean {
  const top = results[0];
  if (!top) return false;
  const summary =
    top.level === "l2_time"
      ? top.item.summary
      : top.item.summary;
  return top.score >= 0.78 && summary.length >= 24;
}

function isEnoughAtL1(results: L1SearchResult[]): boolean {
  const top = results[0];
  if (!top) return false;
  return top.score >= 0.68 && top.item.summary.length >= 20;
}

function collectL1IdsFromL2(results: L2SearchResult[]): string[] {
  const ids = new Set<string>();
  for (const hit of results) {
    for (const l1Id of hit.item.l1Source) {
      ids.add(l1Id);
    }
  }
  return Array.from(ids);
}

function collectL0IdsFromL1(results: L1SearchResult[]): string[] {
  const ids = new Set<string>();
  for (const hit of results) {
    for (const l0Id of hit.item.l0Source) {
      ids.add(l0Id);
    }
  }
  return Array.from(ids);
}

function renderFacts(facts: GlobalFactItem[]): string[] {
  if (facts.length === 0) return [];
  return [
    "## Dynamic Facts",
    ...facts.map(
      (fact) =>
        `- ${fact.factKey}: ${truncate(fact.factValue, 120)} (confidence=${fact.confidence.toFixed(2)}, sources=${fact.sourceL1Ids.length})`,
    ),
    "",
  ];
}

function renderL2(results: L2SearchResult[]): string[] {
  if (results.length === 0) return [];
  const lines: string[] = ["## L2 Indexes"];
  for (const hit of results) {
    if (hit.level === "l2_time") {
      lines.push(`- [time:${hit.item.dateKey}] ${truncate(hit.item.summary, 180)}`);
    } else {
      lines.push(
        `- [project:${hit.item.projectName}] status=${hit.item.currentStatus} | ${truncate(hit.item.latestProgress, 120)}`,
      );
    }
  }
  lines.push("");
  return lines;
}

function renderL1(results: L1SearchResult[]): string[] {
  if (results.length === 0) return [];
  const lines: string[] = ["## L1 Windows"];
  for (const hit of results) {
    lines.push(`- [${hit.item.timePeriod}] ${truncate(hit.item.summary, 180)}`);
  }
  lines.push("");
  return lines;
}

function renderL0(results: L0SearchResult[]): string[] {
  if (results.length === 0) return [];
  const lines: string[] = ["## L0 Raw Sessions"];
  for (const hit of results) {
    const userMessages = hit.item.messages.filter((m) => m.role === "user").map((m) => m.content);
    lines.push(`- [${hit.item.timestamp}] ${truncate(userMessages[userMessages.length - 1] ?? "", 180)}`);
  }
  lines.push("");
  return lines;
}

export class ReasoningRetriever {
  constructor(private readonly repository: MemoryRepository) {}

  searchL2(query: string, intent: IntentType, limit: number): L2SearchResult[] {
    if (intent === "time") {
      return sortByScoreDesc(this.repository.searchL2TimeIndexes(query, limit)).slice(0, limit);
    }
    if (intent === "project") {
      return sortByScoreDesc(this.repository.searchL2ProjectIndexes(query, limit)).slice(0, limit);
    }
    const merged = sortByScoreDesc([
      ...this.repository.searchL2ProjectIndexes(query, limit),
      ...this.repository.searchL2TimeIndexes(query, limit),
    ]);
    return merged.slice(0, limit);
  }

  searchL1(query: string, relatedL1Ids: string[], limit: number): L1SearchResult[] {
    const idHits = this.repository.getL1ByIds(relatedL1Ids);
    const queryHits = this.repository.searchL1(query, limit);
    const merged = new Map<string, L1SearchResult>();
    for (const hit of normalizeScoredL1(query, [...idHits, ...queryHits])) {
      const existing = merged.get(hit.item.l1IndexId);
      if (!existing || existing.score < hit.score) {
        merged.set(hit.item.l1IndexId, hit);
      }
    }
    return sortByScoreDesc(Array.from(merged.values())).slice(0, limit);
  }

  searchL0(query: string, relatedL0Ids: string[], limit: number): L0SearchResult[] {
    const idHits = this.repository.getL0ByIds(relatedL0Ids);
    const queryHits = this.repository.searchL0(query, limit);
    const merged = new Map<string, L0SearchResult>();
    for (const hit of normalizeScoredL0(query, [...idHits, ...queryHits])) {
      const existing = merged.get(hit.item.l0IndexId);
      if (!existing || existing.score < hit.score) {
        merged.set(hit.item.l0IndexId, hit);
      }
    }
    return sortByScoreDesc(Array.from(merged.values())).slice(0, limit);
  }

  retrieve(query: string, options: RetrievalOptions = {}): RetrievalResult {
    const intent = classifyIntent(query);
    const l2Limit = options.l2Limit ?? 6;
    const l1Limit = options.l1Limit ?? 6;
    const l0Limit = options.l0Limit ?? 4;

    const l2Results = this.searchL2(query, intent, l2Limit);
    const relatedL1Ids = collectL1IdsFromL2(l2Results);
    const enoughL2 = isEnoughAtL2(l2Results);

    let l1Results: L1SearchResult[] = [];
    let l0Results: L0SearchResult[] = [];
    let enoughAt: RetrievalResult["enoughAt"] = "none";

    if (enoughL2) {
      enoughAt = "l2";
    } else {
      l1Results = this.searchL1(query, relatedL1Ids, l1Limit);
      const enoughL1 = isEnoughAtL1(l1Results);
      if (enoughL1) {
        enoughAt = "l1";
      } else {
        const relatedL0Ids = collectL0IdsFromL1(l1Results);
        l0Results = this.searchL0(query, relatedL0Ids, l0Limit);
        enoughAt = l0Results.length > 0 ? "l0" : "none";
      }
    }

    const facts = options.includeFacts === false
      ? []
      : intent === "fact"
        ? this.repository.listGlobalFacts(5)
        : this.repository.searchFacts(query, 5);
    const contextLines = [
      "You are using multi-level memory indexes for this turn.",
      `intent=${intent}, enoughAt=${enoughAt}`,
      "",
      ...renderFacts(facts),
      ...renderL2(l2Results),
      ...renderL1(l1Results),
      ...renderL0(l0Results),
      "Only use the above as supporting context; prioritize the user's latest request.",
    ];

    return {
      query,
      intent,
      enoughAt,
      l2Results,
      l1Results,
      l0Results,
      context: contextLines.join("\n").trim(),
    };
  }
}
