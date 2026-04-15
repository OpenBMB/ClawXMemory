import { describe, expect, it } from "vitest";
import { renderTraceI18nText } from "../ui-source/trace-i18n.js";

const LOCALES = {
  zh: {
    "trace.step.focus_turns_selected": "焦点轮次已选定",
    "trace.text.focus_turns_selected.output.classifying": "这些用户轮次会逐条进入分类。",
  },
  en: {
    "trace.step.focus_turns_selected": "Focus Turns Selected",
    "trace.text.focus_turns_selected.output.classifying": "User turns will be classified one by one.",
  },
};

describe("trace ui i18n helper", () => {
  it("renders localized trace prose in zh and en", () => {
    expect(renderTraceI18nText(
      "Focus Turns Selected",
      { key: "trace.step.focus_turns_selected", fallback: "Focus Turns Selected" },
      "zh",
      LOCALES,
    )).toBe("焦点轮次已选定");

    expect(renderTraceI18nText(
      "User turns will be classified one by one.",
      { key: "trace.text.focus_turns_selected.output.classifying", fallback: "User turns will be classified one by one." },
      "en",
      LOCALES,
    )).toBe("User turns will be classified one by one.");
  });

  it("keeps raw values unchanged when no trace i18n payload exists", () => {
    expect(renderTraceI18nText("project_memory", undefined, "zh", LOCALES)).toBe("project_memory");
    expect(renderTraceI18nText("projects/demo/Project/current-stage.md", null, "zh", LOCALES)).toBe("projects/demo/Project/current-stage.md");
  });

  it("falls back to the stored raw string for legacy trace records", () => {
    expect(renderTraceI18nText("Legacy English Summary", { key: "trace.missing", fallback: "Fallback English" }, "zh", LOCALES))
      .toBe("Fallback English");
    expect(renderTraceI18nText("Legacy English Summary", undefined, "zh", LOCALES)).toBe("Legacy English Summary");
  });
});
