import type { FactCandidate, MemoryMessage } from "../types.js";
import { normalizeText, truncate } from "../utils/text.js";

const PROJECT_PATTERNS = [
  /(?:项目|project)\s*[:：]?\s*([A-Za-z][A-Za-z0-9_-]{1,48})/gi,
  /\b([A-Z][A-Za-z0-9]+(?:[A-Z][A-Za-z0-9]+)+)\b/g,
];

const FACT_PATTERNS: Array<{ regex: RegExp; keyPrefix: string; confidence: number }> = [
  { regex: /(?:我在用|我使用|使用的是|技术栈是)\s*([A-Za-z0-9.+#_-]{2,40})/gi, keyPrefix: "tech", confidence: 0.82 },
  { regex: /(?:我正在|我在)\s*([^，。,.!?]{2,60})/gi, keyPrefix: "activity", confidence: 0.68 },
  { regex: /(?:喜欢|偏好)\s*([^，。,.!?]{2,40})/gi, keyPrefix: "preference", confidence: 0.72 },
  { regex: /(?:计划|准备)\s*([^，。,.!?]{2,40})/gi, keyPrefix: "plan", confidence: 0.65 },
];

function extractFromPattern(text: string, pattern: RegExp): string[] {
  const results: string[] = [];
  for (const match of text.matchAll(pattern)) {
    const value = normalizeText(match[1] ?? "");
    if (value) results.push(value);
  }
  return results;
}

export function extractProjectTags(messages: MemoryMessage[]): string[] {
  const tags = new Set<string>();
  const userText = messages
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content)
    .join("\n");

  for (const pattern of PROJECT_PATTERNS) {
    for (const value of extractFromPattern(userText, pattern)) {
      const cleaned = value.replace(/[^\w.-]/g, "");
      if (cleaned.length >= 2 && cleaned.length <= 50) {
        tags.add(cleaned);
      }
    }
  }
  return Array.from(tags).slice(0, 8);
}

export function extractFactCandidates(messages: MemoryMessage[]): FactCandidate[] {
  const facts = new Map<string, FactCandidate>();
  const userText = messages
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content)
    .join("\n");

  for (const { regex, keyPrefix, confidence } of FACT_PATTERNS) {
    for (const value of extractFromPattern(userText, regex)) {
      const text = truncate(value, 120);
      const key = `${keyPrefix}:${text.toLowerCase()}`;
      facts.set(key, {
        factKey: key,
        factValue: text,
        confidence,
      });
    }
  }

  for (const projectName of extractProjectTags(messages)) {
    facts.set(`project:${projectName.toLowerCase()}`, {
      factKey: `project:${projectName.toLowerCase()}`,
      factValue: projectName,
      confidence: 0.78,
    });
  }

  return Array.from(facts.values()).slice(0, 16);
}

export function buildSessionSummary(messages: MemoryMessage[]): string {
  const userMessages = messages.filter((msg) => msg.role === "user").map((msg) => normalizeText(msg.content));
  const assistantMessages = messages
    .filter((msg) => msg.role === "assistant")
    .map((msg) => normalizeText(msg.content));

  const userHead = userMessages[0] ?? "";
  const userTail = userMessages[userMessages.length - 1] ?? "";
  const assistantTail = assistantMessages[assistantMessages.length - 1] ?? "";

  const parts = [
    userHead ? `用户提到：${truncate(userHead, 80)}` : "",
    userTail && userTail !== userHead ? `后续重点：${truncate(userTail, 80)}` : "",
    assistantTail ? `助手响应：${truncate(assistantTail, 80)}` : "",
  ].filter(Boolean);

  if (parts.length === 0) return "该窗口没有可用文本，跳过结构化摘要。";
  return parts.join("；");
}

export function buildSituationTimeInfo(timestamp: string, summary: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return `未知时间场景：${truncate(summary, 120)}`;
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${date.toISOString().slice(0, 10)} ${hour}:${minute} 用户正在推进：${truncate(summary, 120)}`;
}
