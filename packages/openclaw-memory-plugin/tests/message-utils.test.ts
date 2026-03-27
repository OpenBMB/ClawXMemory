import { describe, expect, it } from "vitest";
import { normalizeTranscriptMessage } from "../src/message-utils.js";

describe("normalizeTranscriptMessage", () => {
  it("removes recall scaffolding and keeps the actual user turn", () => {
    const normalized = normalizeTranscriptMessage(
      {
        role: "user",
        content: [
          "## ClawXMemory Recall",
          "",
          "Use the following retrieved ClawXMemory evidence for this turn.",
          "",
          "## ClawXMemory Retrieved Evidence",
          "intent=general",
          "enoughAt=l0",
          "",
          "Treat the selected evidence above as authoritative historical memory for this turn when it is relevant.",
          "If the needed answer is already shown above, do not claim that memory is missing or that this is a fresh conversation.",
          "",
          "System: [2026-03-24 16:24:10] Gateway restart update ok (npm)",
          "System: Run: openclaw doctor --non-interactive",
          "",
          "[Tue 2026-03-24 16:24 GMT+8] 感觉冒菜可以",
        ].join("\n"),
      },
      {
        includeAssistant: true,
        maxMessageChars: 1000,
      },
    );

    expect(normalized).toMatchObject({
      role: "user",
      content: "感觉冒菜可以",
    });
  });

  it("still removes the legacy memory context scaffold", () => {
    const normalized = normalizeTranscriptMessage(
      {
        role: "user",
        content: [
          "You are using multi-level memory indexes for this turn.",
          "",
          "Earlier memory summary",
          "",
          "Treat the above as authoritative prior memory when it is relevant. Prioritize the user's latest request, and do not claim memory is missing or that this is a fresh conversation if the answer is already shown above.",
          "",
          "[Tue 2026-03-24 16:23 GMT+8] 论文先不写了 我累了 想去吃点啥",
        ].join("\n"),
      },
      {
        includeAssistant: true,
        maxMessageChars: 1000,
      },
    );

    expect(normalized).toMatchObject({
      role: "user",
      content: "论文先不写了 我累了 想去吃点啥",
    });
  });

  it("preserves normal markdown headings in user input", () => {
    const normalized = normalizeTranscriptMessage(
      {
        role: "user",
        content: "## 清新自然风格\n给我一个更具体的拍摄方案",
      },
      {
        includeAssistant: true,
        maxMessageChars: 1000,
      },
    );

    expect(normalized).toMatchObject({
      role: "user",
      content: "## 清新自然风格\n给我一个更具体的拍摄方案",
    });
  });
});
