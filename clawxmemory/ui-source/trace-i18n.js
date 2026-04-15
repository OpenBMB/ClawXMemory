function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isTraceI18nText(value) {
  return isRecord(value)
    && typeof value.key === "string"
    && typeof value.fallback === "string"
    && (value.args === undefined || Array.isArray(value.args));
}

export function renderTraceI18nText(rawValue, descriptor, locale, locales) {
  if (!isTraceI18nText(descriptor)) {
    return rawValue == null ? "" : String(rawValue);
  }
  const localeDict = isRecord(locales?.[locale]) ? locales[locale] : {};
  const enDict = isRecord(locales?.en) ? locales.en : {};
  const zhDict = isRecord(locales?.zh) ? locales.zh : {};
  const template = localeDict[descriptor.key] ?? enDict[descriptor.key] ?? zhDict[descriptor.key] ?? descriptor.fallback;
  const args = Array.isArray(descriptor.args) ? descriptor.args : [];
  return String(template).replace(/\{(\d+)\}/g, (_, index) => {
    const value = args[Number(index)];
    return value == null ? "" : String(value);
  });
}
