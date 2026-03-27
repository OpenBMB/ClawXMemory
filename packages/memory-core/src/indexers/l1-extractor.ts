import type { L0SessionRecord, L1WindowRecord } from "../types.js";
import { buildL1IndexId, nowIso } from "../utils/id.js";
import {
  buildSessionSummary,
  buildSituationTimeInfo,
  extractFactCandidates,
  extractProjectTags,
} from "../skills/extraction-skill.js";

function buildTimePeriod(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "unknown";
  const day = date.toISOString().slice(0, 10);
  const startHour = date.getHours() - (date.getHours() % 2);
  const endHour = startHour + 2;
  const hh = (value: number): string => String(value).padStart(2, "0");
  return `${day}:T${hh(startHour)}:00-${hh(Math.min(endHour, 24))}:00`;
}

export function extractL1FromL0(record: L0SessionRecord): L1WindowRecord {
  const summary = buildSessionSummary(record.messages);
  const facts = extractFactCandidates(record.messages);
  const projectTags = extractProjectTags(record.messages);
  const l1IndexId = buildL1IndexId(record.timestamp, [record.l0IndexId]);
  return {
    l1IndexId,
    timePeriod: buildTimePeriod(record.timestamp),
    summary,
    facts,
    situationTimeInfo: buildSituationTimeInfo(record.timestamp, summary),
    projectTags,
    l0Source: [record.l0IndexId],
    createdAt: nowIso(),
  };
}
