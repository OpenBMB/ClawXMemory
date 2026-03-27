import type { L1WindowRecord, L2ProjectIndexRecord, L2TimeIndexRecord } from "../types.js";
import { buildL2ProjectIndexId, buildL2TimeIndexId, nowIso } from "../utils/id.js";

function parseDateKey(timePeriod: string): string {
  const idx = timePeriod.indexOf(":");
  return idx >= 0 ? timePeriod.slice(0, idx) : timePeriod;
}

function deriveProjectStatus(summary: string): string {
  const lower = summary.toLowerCase();
  if (lower.includes("完成") || lower.includes("done") || lower.includes("已上线")) return "completed";
  if (lower.includes("阻塞") || lower.includes("失败") || lower.includes("报错")) return "blocked";
  if (lower.includes("计划") || lower.includes("准备")) return "planning";
  return "in_progress";
}

export function buildL2TimeFromL1(l1: L1WindowRecord): L2TimeIndexRecord {
  const dateKey = parseDateKey(l1.timePeriod);
  const now = nowIso();
  return {
    l2IndexId: buildL2TimeIndexId(dateKey),
    dateKey,
    summary: l1.summary,
    l1Source: [l1.l1IndexId],
    createdAt: now,
    updatedAt: now,
  };
}

export function buildL2ProjectsFromL1(l1: L1WindowRecord): L2ProjectIndexRecord[] {
  const now = nowIso();
  return l1.projectTags.map((projectName) => ({
    l2IndexId: buildL2ProjectIndexId(projectName),
    projectName,
    summary: `${projectName}：${l1.summary}`,
    currentStatus: deriveProjectStatus(l1.summary),
    latestProgress: l1.situationTimeInfo,
    l1Source: [l1.l1IndexId],
    createdAt: now,
    updatedAt: now,
  }));
}
