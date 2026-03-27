import type { IntentType } from "../types.js";

const TIME_KEYWORDS = ["今天", "昨天", "最近", "本周", "时间", "日期", "timeline", "when", "day"];
const PROJECT_KEYWORDS = ["项目", "进展", "里程碑", "roadmap", "project", "status", "ultrarag"];
const FACT_KEYWORDS = ["偏好", "事实", "画像", "profile", "fact", "习惯", "喜欢", "不喜欢"];

export function classifyIntent(query: string): IntentType {
  const normalized = query.toLowerCase();
  const score = {
    time: TIME_KEYWORDS.filter((word) => normalized.includes(word.toLowerCase())).length,
    project: PROJECT_KEYWORDS.filter((word) => normalized.includes(word.toLowerCase())).length,
    fact: FACT_KEYWORDS.filter((word) => normalized.includes(word.toLowerCase())).length,
  };

  if (score.project > 0 && score.project >= score.time && score.project >= score.fact) return "project";
  if (score.time > 0 && score.time >= score.fact) return "time";
  if (score.fact > 0) return "fact";
  return "general";
}
