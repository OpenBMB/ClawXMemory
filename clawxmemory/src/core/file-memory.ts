import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import type {
  MemoryCandidate,
  MemoryFileExportRecord,
  MemoryFileFrontmatter,
  MemoryFileRecord,
  MemoryManifestEntry,
  MemoryRecordType,
  MemoryScope,
  MemoryUserSummary,
  ProjectMetaExportRecord,
  ProjectMetaRecord,
} from "./types.js";
import { hashText, nowIso } from "./utils/id.js";
import { truncate } from "./utils/text.js";

const GLOBAL_DIR = "global";
const USER_DIR = "User";
const FEEDBACK_DIR = "Feedback";
const PROJECTS_DIR = "projects";
const PROJECT_DIR = "Project";
const ARCHIVE_DIR = "Archive";
const MANIFEST_FILE = "MEMORY.md";
const PROJECT_META_FILE = "project.meta.md";
export const TMP_PROJECT_ID = "_tmp";

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeProjectId(value: string | undefined): string {
  const trimmed = normalizeWhitespace(value ?? "");
  if (!trimmed) return "";
  if (trimmed === TMP_PROJECT_ID) return TMP_PROJECT_ID;
  return trimmed.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "";
}

function slugify(value: string): string {
  const normalized = normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "memory-item";
}

function uniqueItems(items: readonly string[] | undefined, maxItems = 12): string[] {
  return Array.from(
    new Set(
      (items ?? [])
        .filter((item): item is string => typeof item === "string")
        .map((item) => normalizeWhitespace(item))
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
}

function parseFlatFrontmatter(raw: string): { values: Record<string, string>; body: string } {
  if (!raw.startsWith("---\n")) {
    return { values: {}, body: raw.trim() };
  }
  const end = raw.indexOf("\n---\n", 4);
  if (end < 0) {
    return { values: {}, body: raw.trim() };
  }
  const header = raw.slice(4, end);
  const body = raw.slice(end + 5).trim();
  const values: Record<string, string> = {};
  for (const line of header.split("\n")) {
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    values[key] = value;
  }
  return { values, body };
}

function parseFrontmatter(raw: string): { frontmatter: MemoryFileFrontmatter; body: string } {
  const fallback: MemoryFileFrontmatter = {
    name: "memory-item",
    description: "",
    type: "user",
    scope: "global",
    updatedAt: nowIso(),
  };
  const { values, body } = parseFlatFrontmatter(raw);
  if (Object.keys(values).length === 0) {
    return { frontmatter: fallback, body };
  }
  const type = values.type === "feedback" || values.type === "project" ? values.type : "user";
  const scope = values.scope === "project" ? "project" : "global";
  const dreamAttempts = Number.parseInt(values.dream_attempts ?? "", 10);
  return {
    frontmatter: {
      name: values.name || fallback.name,
      description: values.description || "",
      type,
      scope,
      ...(values.project_id ? { projectId: values.project_id } : {}),
      updatedAt: values.updated_at || fallback.updatedAt,
      ...(values.captured_at ? { capturedAt: values.captured_at } : {}),
      ...(values.source_session_key ? { sourceSessionKey: values.source_session_key } : {}),
      ...(values.deprecated === "true" ? { deprecated: true } : {}),
      ...(Number.isFinite(dreamAttempts) && dreamAttempts > 0 ? { dreamAttempts } : {}),
    },
    body,
  };
}

function renderFrontmatter(frontmatter: MemoryFileFrontmatter): string {
  const lines = [
    "---",
    `name: ${frontmatter.name.replace(/\n/g, " ")}`,
    `description: ${frontmatter.description.replace(/\n/g, " ")}`,
    `type: ${frontmatter.type}`,
    `scope: ${frontmatter.scope}`,
    ...(frontmatter.projectId ? [`project_id: ${frontmatter.projectId}`] : []),
    `updated_at: ${frontmatter.updatedAt}`,
    ...(frontmatter.capturedAt ? [`captured_at: ${frontmatter.capturedAt}`] : []),
    ...(frontmatter.sourceSessionKey ? [`source_session_key: ${frontmatter.sourceSessionKey}`] : []),
    `deprecated: ${frontmatter.deprecated ? "true" : "false"}`,
    ...(typeof frontmatter.dreamAttempts === "number" && frontmatter.dreamAttempts > 0
      ? [`dream_attempts: ${frontmatter.dreamAttempts}`]
      : []),
    "---",
    "",
  ];
  return lines.join("\n");
}

function parseStringArray(value: string | undefined): string[] {
  const raw = normalizeWhitespace(value ?? "");
  if (!raw) return [];
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return uniqueItems(parsed.filter((item): item is string => typeof item === "string"), 50);
      }
    } catch {
      // Fall through to string splitting.
    }
  }
  return uniqueItems(raw.split("|"), 50);
}

function parseSections(body: string): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let current = "";
  for (const line of body.split("\n")) {
    const heading = /^##\s+(.+?)\s*$/.exec(line.trim());
    if (heading) {
      current = heading[1]!.trim();
      sections.set(current, []);
      continue;
    }
    const bucket = sections.get(current) ?? [];
    bucket.push(line);
    sections.set(current, bucket);
  }
  return sections;
}

function normalizeListSection(lines: readonly string[] | undefined): string[] {
  return uniqueItems(
    (lines ?? [])
      .map((line) => line.replace(/^- /, "").trim())
      .filter(Boolean),
    50,
  );
}

function normalizeTextSection(lines: readonly string[] | undefined): string {
  return normalizeWhitespace((lines ?? []).join("\n"));
}

function pickLongest(left: string, right: string): string {
  const a = normalizeWhitespace(left);
  const b = normalizeWhitespace(right);
  if (!a) return b;
  if (!b) return a;
  return b.length >= a.length ? b : a;
}

function mergeSectionText(existing: string, incoming: string): string {
  const left = normalizeWhitespace(existing);
  const right = normalizeWhitespace(incoming);
  if (!left) return right;
  if (!right) return left;
  if (left.includes(right)) return left;
  if (right.includes(left)) return right;
  return `${left}\n${right}`;
}

function renderListSection(title: string, items: readonly string[] | undefined): string {
  const normalized = uniqueItems(items, 50);
  if (normalized.length === 0) return "";
  return [`## ${title}`, ...normalized.map((item) => `- ${item}`), ""].join("\n");
}

function renderTextSection(title: string, value: string | undefined): string {
  const normalized = normalizeWhitespace(value ?? "");
  if (!normalized) return "";
  return [`## ${title}`, normalized, ""].join("\n");
}

function renderFixedTextSection(title: string, value: string | undefined): string {
  const normalized = normalizeWhitespace(value ?? "");
  return [`## ${title}`, normalized, ""].join("\n");
}

function renderFixedListSection(title: string, items: readonly string[] | undefined): string {
  const normalized = uniqueItems(items, 50);
  return [`## ${title}`, ...normalized.map((item) => `- ${item}`), ""].join("\n");
}

function selectTypeDirectory(type: MemoryRecordType): string {
  if (type === "user") return USER_DIR;
  if (type === "feedback") return FEEDBACK_DIR;
  return PROJECT_DIR;
}

function buildTmpCandidateFileName(candidate: MemoryCandidate): string {
  const baseName = candidate.type === "project"
    ? normalizeWhitespace(candidate.name || "project-item")
    : normalizeWhitespace(candidate.name || "feedback-item");
  const fingerprint = hashText(JSON.stringify({
    type: candidate.type,
    name: candidate.name ?? "",
    description: candidate.description,
    summary: candidate.summary,
    preferences: candidate.preferences ?? [],
    constraints: candidate.constraints ?? [],
    relationships: candidate.relationships ?? [],
    rule: candidate.rule,
    why: candidate.why,
    howToApply: candidate.howToApply,
    stage: candidate.stage,
    decisions: candidate.decisions ?? [],
    nextSteps: candidate.nextSteps ?? [],
    blockers: candidate.blockers ?? [],
    timeline: candidate.timeline ?? [],
    notes: candidate.notes ?? [],
  }));
  return `${slugify(baseName)}-${fingerprint}.md`;
}

function sortEntriesByUpdatedAt<T extends { updatedAt: string }>(entries: T[]): T[] {
  return [...entries].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function buildManifestLine(entry: MemoryManifestEntry, rootDir: string): string {
  return `- [${entry.type}] ${relative(rootDir, entry.absolutePath)} (${entry.updatedAt}): ${entry.description}`;
}

function findMarkdownFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    if (!entry.name.endsWith(".md")) continue;
    if (entry.name === MANIFEST_FILE || entry.name === PROJECT_META_FILE) continue;
    files.push(join(dir, entry.name));
  }
  return files.sort();
}

function sanitizeFileName(value: string | undefined, fallback: string): string {
  const trimmed = normalizeWhitespace(value ?? "").split(/[\\/]/).pop() ?? "";
  const safe = trimmed.replace(/[^a-zA-Z0-9._-\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "");
  const candidate = safe || fallback;
  const withExtension = candidate.endsWith(".md") ? candidate : `${candidate}.md`;
  if (withExtension === MANIFEST_FILE || withExtension === PROJECT_META_FILE) {
    return `${slugify(fallback)}.md`;
  }
  return withExtension;
}

function previewText(body: string): string {
  return truncate(
    body
      .split("\n")
      .map((line) => normalizeWhitespace(line))
      .filter(Boolean)
      .join(" "),
    220,
  );
}

function renderProjectMeta(record: ProjectMetaRecord): string {
  const lines = [
    "---",
    `project_id: ${record.projectId}`,
    `project_name: ${record.projectName.replace(/\n/g, " ")}`,
    `description: ${record.description.replace(/\n/g, " ")}`,
    `aliases: ${JSON.stringify(uniqueItems(record.aliases, 50))}`,
    `status: ${record.status.replace(/\n/g, " ")}`,
    `created_at: ${record.createdAt}`,
    `updated_at: ${record.updatedAt}`,
    "---",
    "",
    "## Summary",
    record.description,
    "",
  ];
  return lines.join("\n");
}

function parseProjectMeta(absolutePath: string): ProjectMetaRecord | undefined {
  if (!existsSync(absolutePath)) return undefined;
  const raw = readFileSync(absolutePath, "utf-8");
  const { values } = parseFlatFrontmatter(raw);
  const projectId = normalizeProjectId(values.project_id);
  if (!projectId || projectId === TMP_PROJECT_ID) return undefined;
  const projectName = normalizeWhitespace(values.project_name || "");
  if (!projectName) return undefined;
  const description = normalizeWhitespace(values.description || "");
  return {
    projectId,
    projectName,
    description,
    aliases: uniqueItems([
      ...parseStringArray(values.aliases),
      projectName,
    ], 50),
    status: normalizeWhitespace(values.status || "active") || "active",
    createdAt: values.created_at || nowIso(),
    updatedAt: values.updated_at || nowIso(),
    relativePath: "",
    absolutePath,
  };
}

export interface FileMemoryOverview {
  totalMemoryFiles: number;
  totalUserMemories: number;
  totalFeedbackMemories: number;
  totalProjectMemories: number;
  changedFilesSinceLastDream: number;
}

export interface TmpCleanupResult {
  archived: number;
  deleted: number;
  kept: number;
  changedFiles: string[];
}

export class FileMemoryStore {
  constructor(private readonly rootDir: string) {
    this.ensureLayout();
  }

  getRootDir(): string {
    return this.rootDir;
  }

  ensureLayout(): void {
    ensureDir(this.rootDir);
    ensureDir(join(this.rootDir, GLOBAL_DIR));
    ensureDir(join(this.rootDir, GLOBAL_DIR, USER_DIR));
    ensureDir(join(this.rootDir, PROJECTS_DIR));
    ensureDir(this.projectRoot(TMP_PROJECT_ID));
    ensureDir(join(this.projectRoot(TMP_PROJECT_ID), PROJECT_DIR));
    ensureDir(join(this.projectRoot(TMP_PROJECT_ID), FEEDBACK_DIR));
  }

  private globalManifestPath(): string {
    return join(this.rootDir, GLOBAL_DIR, MANIFEST_FILE);
  }

  private projectRoot(projectId: string): string {
    return join(this.rootDir, PROJECTS_DIR, normalizeProjectId(projectId) || TMP_PROJECT_ID);
  }

  private projectManifestPath(projectId: string): string {
    return join(this.projectRoot(projectId), MANIFEST_FILE);
  }

  private projectMetaPath(projectId: string): string {
    return join(this.projectRoot(projectId), PROJECT_META_FILE);
  }

  private readRecordFromPath(absolutePath: string): MemoryFileRecord {
    const raw = readFileSync(absolutePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    return {
      ...frontmatter,
      file: absolutePath.split("/").pop() ?? "unknown.md",
      relativePath: relative(this.rootDir, absolutePath),
      absolutePath,
      content: body,
      preview: previewText(body),
    };
  }

  private buildManifestEntriesForScope(scope: MemoryScope, projectId?: string): MemoryManifestEntry[] {
    const baseDir = scope === "global"
      ? join(this.rootDir, GLOBAL_DIR)
      : projectId
        ? this.projectRoot(projectId)
        : "";
    if (!baseDir) return [];
    const candidateDirs = scope === "global"
      ? [join(baseDir, USER_DIR)]
      : [join(baseDir, PROJECT_DIR), join(baseDir, FEEDBACK_DIR)];
    const entries: MemoryManifestEntry[] = [];
    for (const dir of candidateDirs) {
      for (const file of findMarkdownFiles(dir)) {
        const record = this.readRecordFromPath(file);
        entries.push({
          name: record.name,
          description: record.description,
          type: record.type,
          scope: record.scope,
          ...(record.projectId ? { projectId: record.projectId } : {}),
          updatedAt: record.updatedAt,
          file: record.file,
          relativePath: record.relativePath,
          absolutePath: record.absolutePath,
          ...(typeof record.dreamAttempts === "number" ? { dreamAttempts: record.dreamAttempts } : {}),
        });
      }
    }
    return sortEntriesByUpdatedAt(entries);
  }

  rebuildManifest(scope: MemoryScope, projectId?: string): MemoryManifestEntry[] {
    this.ensureLayout();
    const normalizedProjectId = scope === "project" ? normalizeProjectId(projectId) || TMP_PROJECT_ID : undefined;
    const entries = this.buildManifestEntriesForScope(scope, normalizedProjectId);
    const manifestPath = scope === "global"
      ? this.globalManifestPath()
      : normalizedProjectId
        ? this.projectManifestPath(normalizedProjectId)
        : "";
    if (!manifestPath) return [];
    ensureDir(dirname(manifestPath));
    const title = scope === "global"
      ? "Global Memory"
      : normalizedProjectId === TMP_PROJECT_ID
        ? "Temporary Project Memory"
        : `Project Memory: ${normalizedProjectId ?? "unknown"}`;
    const lines = [
      `# ${title}`,
      "",
      ...entries.map((entry) => buildManifestLine(entry, this.rootDir)),
      "",
    ];
    writeFileSync(manifestPath, lines.join("\n"), "utf-8");
    return entries;
  }

  rebuildAllManifests(options: { includeTmp?: boolean } = {}): MemoryManifestEntry[] {
    const all = [...this.rebuildManifest("global")];
    for (const projectId of this.listProjectIds(options.includeTmp ? { includeTmp: true } : {})) {
      all.push(...this.rebuildManifest("project", projectId));
    }
    return sortEntriesByUpdatedAt(all);
  }

  listMemoryEntries(options: {
    kinds?: MemoryRecordType[];
    query?: string;
    limit?: number;
    offset?: number;
    scope?: MemoryScope;
    projectId?: string;
    includeTmp?: boolean;
  } = {}): MemoryManifestEntry[] {
    this.ensureLayout();
    const includeTmp = Boolean(options.includeTmp);
    let entries: MemoryManifestEntry[] = [];
    const projectId = normalizeProjectId(options.projectId);
    if (options.scope === "global") {
      entries = this.rebuildManifest("global");
    } else if (projectId) {
      if (projectId === TMP_PROJECT_ID && !includeTmp) return [];
      entries = this.rebuildManifest("project", projectId);
    } else {
      entries = options.scope === "project" ? [] : this.rebuildManifest("global");
      for (const id of this.listProjectIds(includeTmp ? { includeTmp: true } : {})) {
        entries.push(...this.rebuildManifest("project", id));
      }
    }
    if (!includeTmp) {
      entries = entries.filter((entry) => entry.projectId !== TMP_PROJECT_ID);
    }
    if (options.scope === "project") {
      entries = entries.filter((entry) => entry.scope === "project");
    }
    if (projectId) {
      entries = entries.filter((entry) => entry.projectId === projectId);
    }
    if (options.kinds?.length) {
      const allowed = new Set(options.kinds);
      entries = entries.filter((entry) => allowed.has(entry.type));
    }
    if (options.query?.trim()) {
      const tokens = normalizeWhitespace(options.query).toLowerCase().split(" ").filter(Boolean);
      entries = entries
        .map((entry) => {
          const haystack = [entry.name, entry.description, entry.relativePath, entry.projectId ?? ""]
            .join(" ")
            .toLowerCase();
          const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
          return { entry, score };
        })
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score || right.entry.updatedAt.localeCompare(left.entry.updatedAt))
        .map((item) => item.entry);
    } else {
      entries = sortEntriesByUpdatedAt(entries);
    }
    const offset = Math.max(0, options.offset ?? 0);
    const limit = Math.max(1, Math.min(500, options.limit ?? 50));
    return entries.slice(offset, offset + limit);
  }

  getMemoryRecordsByIds(ids: string[], maxLines = 80): MemoryFileRecord[] {
    return ids
      .map((id) => this.getMemoryRecord(id, maxLines))
      .filter((item): item is MemoryFileRecord => Boolean(item));
  }

  getMemoryRecord(id: string, maxLines = 80): MemoryFileRecord | undefined {
    const absolutePath = join(this.rootDir, id);
    if (!existsSync(absolutePath)) return undefined;
    const record = this.readRecordFromPath(absolutePath);
    const lines = record.content.split("\n").slice(0, Math.max(1, maxLines));
    return {
      ...record,
      content: lines.join("\n").trim(),
      preview: previewText(lines.join("\n")),
    };
  }

  getUserSummary(): MemoryUserSummary {
    const relativePath = join(GLOBAL_DIR, USER_DIR, "user-profile.md");
    const record = this.getMemoryRecord(relativePath, 5000);
    if (!record) {
      return {
        profile: "",
        preferences: [],
        constraints: [],
        relationships: [],
        files: [],
      };
    }
    const sections = parseSections(record.content);
    return {
      profile: normalizeTextSection(sections.get("Profile")) || normalizeTextSection(sections.get("Summary")) || record.description || record.preview,
      preferences: normalizeListSection(sections.get("Preferences")),
      constraints: normalizeListSection(sections.get("Constraints")),
      relationships: normalizeListSection(sections.get("Relationships")),
      files: [{
        name: record.name,
        description: record.description,
        type: record.type,
        scope: record.scope,
        updatedAt: record.updatedAt,
        file: record.file,
        relativePath: record.relativePath,
        absolutePath: record.absolutePath,
      }],
    };
  }

  listProjectIds(options: { includeTmp?: boolean } = {}): string[] {
    const dir = join(this.rootDir, PROJECTS_DIR);
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((projectId) => options.includeTmp || projectId !== TMP_PROJECT_ID)
      .sort();
  }

  listProjectMetas(options: { includeTmp?: boolean } = {}): ProjectMetaRecord[] {
    const metas: ProjectMetaRecord[] = [];
    for (const projectId of this.listProjectIds(options.includeTmp ? { includeTmp: true } : {})) {
      const meta = this.getProjectMeta(projectId);
      if (!meta) continue;
      metas.push(meta);
    }
    return metas.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  getProjectMeta(projectId: string): ProjectMetaRecord | undefined {
    const normalized = normalizeProjectId(projectId);
    if (!normalized || normalized === TMP_PROJECT_ID) return undefined;
    const meta = parseProjectMeta(this.projectMetaPath(normalized));
    if (!meta) return undefined;
    return {
      ...meta,
      relativePath: relative(this.rootDir, meta.absolutePath),
    };
  }

  exportBundleRecords(options: { includeTmp?: boolean } = {}): {
    projectMetas: ProjectMetaExportRecord[];
    memoryFiles: MemoryFileExportRecord[];
  } {
    const projectMetas = this.listProjectMetas()
      .map((meta) => ({
        projectId: meta.projectId,
        projectName: meta.projectName,
        description: meta.description,
        aliases: [...meta.aliases],
        status: meta.status,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
        relativePath: meta.relativePath,
      }));
    const memoryFiles = this.rebuildAllManifests(options.includeTmp ? { includeTmp: true } : {})
      .map((entry) => this.readRecordFromPath(entry.absolutePath))
      .map((record) => ({
        name: record.name,
        description: record.description,
        type: record.type,
        scope: record.scope,
        ...(record.projectId ? { projectId: record.projectId } : {}),
        updatedAt: record.updatedAt,
        ...(record.deprecated ? { deprecated: true } : {}),
        ...(record.capturedAt ? { capturedAt: record.capturedAt } : {}),
        ...(record.sourceSessionKey ? { sourceSessionKey: record.sourceSessionKey } : {}),
        ...(typeof record.dreamAttempts === "number" ? { dreamAttempts: record.dreamAttempts } : {}),
        file: record.file,
        relativePath: record.relativePath,
        content: record.content,
      }));
    return { projectMetas, memoryFiles };
  }

  clearAllData(): void {
    if (existsSync(this.rootDir)) {
      for (const entry of readdirSync(this.rootDir)) {
        rmSync(join(this.rootDir, entry), { recursive: true, force: true });
      }
    }
    this.ensureLayout();
    this.rebuildManifest("global");
    this.rebuildManifest("project", TMP_PROJECT_ID);
  }

  private writeImportedProjectMeta(record: ProjectMetaExportRecord): ProjectMetaRecord {
    const projectId = normalizeProjectId(record.projectId);
    if (!projectId || projectId === TMP_PROJECT_ID) {
      throw new Error("Imported project meta requires a stable projectId");
    }
    ensureDir(this.projectRoot(projectId));
    const metaPath = this.projectMetaPath(projectId);
    const next: ProjectMetaRecord = {
      projectId,
      projectName: normalizeWhitespace(record.projectName) || projectId,
      description: normalizeWhitespace(record.description || record.projectName || projectId),
      aliases: uniqueItems(record.aliases, 50),
      status: normalizeWhitespace(record.status || "active") || "active",
      createdAt: record.createdAt || nowIso(),
      updatedAt: record.updatedAt || nowIso(),
      relativePath: relative(this.rootDir, metaPath),
      absolutePath: metaPath,
    };
    writeFileSync(metaPath, renderProjectMeta(next), "utf-8");
    return next;
  }

  private writeImportedMemoryFile(record: MemoryFileExportRecord): MemoryFileRecord {
    if (record.type === "user") {
      const absolutePath = join(this.rootDir, GLOBAL_DIR, USER_DIR, "user-profile.md");
      ensureDir(dirname(absolutePath));
      writeFileSync(absolutePath, `${renderFrontmatter({
        name: "user-profile",
        description: normalizeWhitespace(record.description || record.name || "User profile"),
        type: "user",
        scope: "global",
        updatedAt: record.updatedAt || nowIso(),
        ...(record.capturedAt ? { capturedAt: record.capturedAt } : {}),
        ...(record.sourceSessionKey ? { sourceSessionKey: record.sourceSessionKey } : {}),
        ...(record.deprecated ? { deprecated: true } : {}),
      })}${record.content.trim()}\n`, "utf-8");
      return this.readRecordFromPath(absolutePath);
    }

    const projectId = normalizeProjectId(record.projectId);
    if (!projectId) {
      throw new Error(`Imported ${record.type} memory is missing projectId`);
    }
    const typeDir = selectTypeDirectory(record.type);
    const baseDir = join(this.projectRoot(projectId), typeDir);
    ensureDir(baseDir);
    const absolutePath = join(baseDir, sanitizeFileName(record.file, slugify(record.name || record.type)));
    writeFileSync(absolutePath, `${renderFrontmatter({
      name: normalizeWhitespace(record.name || record.file || record.type),
      description: normalizeWhitespace(record.description || record.name || ""),
      type: record.type,
      scope: "project",
      projectId,
      updatedAt: record.updatedAt || nowIso(),
      ...(record.capturedAt ? { capturedAt: record.capturedAt } : {}),
      ...(record.sourceSessionKey ? { sourceSessionKey: record.sourceSessionKey } : {}),
      ...(record.deprecated ? { deprecated: true } : {}),
      ...(typeof record.dreamAttempts === "number" ? { dreamAttempts: record.dreamAttempts } : {}),
    })}${record.content.trim()}\n`, "utf-8");
    return this.readRecordFromPath(absolutePath);
  }

  replaceFromBundle(bundle: {
    projectMetas: ProjectMetaExportRecord[];
    memoryFiles: MemoryFileExportRecord[];
  }): {
    projectMetas: ProjectMetaRecord[];
    memoryFiles: MemoryFileRecord[];
  } {
    this.clearAllData();
    const seenProjectMetas = new Set<string>();
    for (const meta of bundle.projectMetas) {
      const projectId = normalizeProjectId(meta.projectId);
      if (!projectId || projectId === TMP_PROJECT_ID) {
        throw new Error("Imported project meta contains invalid projectId");
      }
      if (seenProjectMetas.has(projectId)) {
        throw new Error(`Duplicate project meta for ${projectId}`);
      }
      seenProjectMetas.add(projectId);
      this.writeImportedProjectMeta(meta);
    }

    const seenPaths = new Set<string>();
    const importedMemoryFiles = bundle.memoryFiles.map((record) => {
      const projectId = record.type === "user" ? undefined : normalizeProjectId(record.projectId);
      const baseDir = record.type === "user"
        ? join(GLOBAL_DIR, USER_DIR)
        : join(PROJECTS_DIR, projectId || TMP_PROJECT_ID, selectTypeDirectory(record.type));
      const relativePath = join(baseDir, sanitizeFileName(record.file, slugify(record.name || record.type)));
      if (seenPaths.has(relativePath)) {
        throw new Error(`Duplicate imported memory file path: ${relativePath}`);
      }
      seenPaths.add(relativePath);
      return this.writeImportedMemoryFile(record);
    });

    const missingMetaByProject = new Map<string, MemoryFileRecord>();
    for (const record of importedMemoryFiles) {
      if (record.type === "user" || !record.projectId || record.projectId === TMP_PROJECT_ID) continue;
      if (seenProjectMetas.has(record.projectId)) continue;
      if (!missingMetaByProject.has(record.projectId)) {
        missingMetaByProject.set(record.projectId, record);
      }
    }
    for (const [projectId, record] of missingMetaByProject) {
      this.upsertProjectMeta({
        projectId,
        projectName: record.name || projectId,
        description: record.description || record.name || projectId,
        aliases: [record.name, record.description].filter(Boolean) as string[],
      });
    }

    this.rebuildManifest("global");
    this.rebuildManifest("project", TMP_PROJECT_ID);
    for (const projectId of this.listProjectIds()) {
      this.rebuildManifest("project", projectId);
    }

    return {
      projectMetas: this.listProjectMetas({ includeTmp: true }),
      memoryFiles: this.rebuildAllManifests({ includeTmp: true }).map((entry) => this.readRecordFromPath(entry.absolutePath)),
    };
  }

  upsertProjectMeta(input: {
    projectId: string;
    projectName: string;
    description: string;
    aliases?: string[];
    status?: string;
  }): ProjectMetaRecord {
    const projectId = normalizeProjectId(input.projectId);
    if (!projectId || projectId === TMP_PROJECT_ID) {
      throw new Error("projectId must be a stable project id");
    }
    ensureDir(this.projectRoot(projectId));
    const metaPath = this.projectMetaPath(projectId);
    const existing = this.getProjectMeta(projectId);
    const createdAt = existing?.createdAt ?? nowIso();
    const next: ProjectMetaRecord = {
      projectId,
      projectName: normalizeWhitespace(input.projectName) || existing?.projectName || projectId,
      description: normalizeWhitespace(input.description || "") || existing?.description || input.projectName || projectId,
      aliases: uniqueItems([
        ...(existing?.aliases ?? []),
        ...(input.aliases ?? []),
        input.projectName,
      ], 50),
      status: normalizeWhitespace(input.status || existing?.status || "active") || "active",
      createdAt,
      updatedAt: nowIso(),
      relativePath: relative(this.rootDir, metaPath),
      absolutePath: metaPath,
    };
    writeFileSync(metaPath, renderProjectMeta(next), "utf-8");
    return next;
  }

  createStableProjectId(seed: string): string {
    const normalized = normalizeWhitespace(seed) || nowIso();
    let candidate = `project_${hashText(normalized)}`;
    let counter = 1;
    while (existsSync(this.projectRoot(candidate)) && !existsSync(this.projectMetaPath(candidate))) {
      candidate = `project_${hashText(`${normalized}:${counter}`)}`;
      counter += 1;
    }
    return candidate;
  }

  listTmpEntries(limit = 500): MemoryManifestEntry[] {
    return this.listMemoryEntries({
      scope: "project",
      projectId: TMP_PROJECT_ID,
      includeTmp: true,
      limit,
    });
  }

  private renderCandidateBody(candidate: MemoryCandidate, existing?: MemoryFileRecord): string {
    const sections = existing ? parseSections(existing.content) : new Map<string, string[]>();
    if (candidate.type === "user") {
      const existingProfile = truncate(
        normalizeTextSection(sections.get("Profile")) || normalizeTextSection(sections.get("Summary")),
        400,
      );
      const existingPreferences = (sections.get("Preferences") ?? []).map((line) => line.replace(/^- /, "").trim());
      const existingConstraints = (sections.get("Constraints") ?? []).map((line) => line.replace(/^- /, "").trim());
      const existingRelationships = (sections.get("Relationships") ?? []).map((line) => line.replace(/^- /, "").trim());
      return [
        renderFixedTextSection("Profile", truncate(pickLongest(existingProfile, candidate.profile ?? candidate.summary ?? ""), 400)),
        renderFixedListSection("Preferences", uniqueItems([...existingPreferences, ...(candidate.preferences ?? [])], 20)),
        renderFixedListSection("Constraints", uniqueItems([...existingConstraints, ...(candidate.constraints ?? [])], 20)),
        renderFixedListSection("Relationships", uniqueItems([...existingRelationships, ...(candidate.relationships ?? [])], 20)),
      ].join("\n").trim();
    }
    if (candidate.type === "feedback") {
      const existingRule = (sections.get("Rule") ?? []).join("\n");
      const existingWhy = (sections.get("Why") ?? []).join("\n");
      const existingHow = (sections.get("How to apply") ?? []).join("\n");
      const existingNotes = (sections.get("Notes") ?? []).map((line) => line.replace(/^- /, "").trim());
      return [
        renderTextSection("Rule", pickLongest(existingRule, candidate.rule ?? candidate.summary ?? "")),
        renderTextSection("Why", mergeSectionText(existingWhy, candidate.why ?? "")),
        renderTextSection("How to apply", mergeSectionText(existingHow, candidate.howToApply ?? "")),
        renderListSection("Notes", uniqueItems([...existingNotes, ...(candidate.notes ?? [])], 20)),
      ].filter(Boolean).join("\n").trim();
    }
    const existingStage = (sections.get("Current Stage") ?? []).join("\n");
    const existingDecisions = (sections.get("Decisions") ?? []).map((line) => line.replace(/^- /, "").trim());
    const existingConstraints = (sections.get("Constraints") ?? []).map((line) => line.replace(/^- /, "").trim());
    const existingNextSteps = (sections.get("Next Steps") ?? []).map((line) => line.replace(/^- /, "").trim());
    const existingBlockers = (sections.get("Blockers") ?? []).map((line) => line.replace(/^- /, "").trim());
    const existingTimeline = (sections.get("Timeline") ?? []).map((line) => line.replace(/^- /, "").trim());
    const existingNotes = (sections.get("Notes") ?? []).map((line) => line.replace(/^- /, "").trim());
    return [
      renderTextSection("Current Stage", pickLongest(existingStage, candidate.stage ?? candidate.summary ?? "")),
      renderListSection("Decisions", uniqueItems([...existingDecisions, ...(candidate.decisions ?? [])], 20)),
      renderListSection("Constraints", uniqueItems([...existingConstraints, ...(candidate.constraints ?? [])], 20)),
      renderListSection("Next Steps", uniqueItems([...existingNextSteps, ...(candidate.nextSteps ?? [])], 20)),
      renderListSection("Blockers", uniqueItems([...existingBlockers, ...(candidate.blockers ?? [])], 20)),
      renderListSection("Timeline", uniqueItems([...existingTimeline, ...(candidate.timeline ?? [])], 20)),
      renderListSection("Notes", uniqueItems([...existingNotes, ...(candidate.notes ?? [])], 20)),
    ].filter(Boolean).join("\n").trim();
  }

  private buildCandidateLocation(candidate: MemoryCandidate): {
    scope: MemoryScope;
    projectId?: string;
    absolutePath: string;
    frontmatter: MemoryFileFrontmatter;
  } {
    if (candidate.type === "user") {
      const absolutePath = join(this.rootDir, GLOBAL_DIR, USER_DIR, "user-profile.md");
      return {
        scope: "global",
        absolutePath,
        frontmatter: {
          name: "user-profile",
          description: normalizeWhitespace(candidate.description || candidate.profile || candidate.summary || "User profile"),
          type: "user",
          scope: "global",
          updatedAt: nowIso(),
          ...(candidate.capturedAt ? { capturedAt: candidate.capturedAt } : {}),
          ...(candidate.sourceSessionKey ? { sourceSessionKey: candidate.sourceSessionKey } : {}),
        },
      };
    }

    const projectId = normalizeProjectId(candidate.projectId) || TMP_PROJECT_ID;
    const typeDir = selectTypeDirectory(candidate.type);
    const baseDir = join(this.projectRoot(projectId), typeDir);
    ensureDir(baseDir);
    const normalizedName = candidate.type === "project"
      ? normalizeWhitespace(candidate.name || "overview")
      : normalizeWhitespace(candidate.name || "memory-item");
    const absolutePath = join(
      baseDir,
      projectId === TMP_PROJECT_ID
        ? buildTmpCandidateFileName(candidate)
        : `${slugify(normalizedName)}.md`,
    );
    return {
      scope: "project",
      projectId,
      absolutePath,
      frontmatter: {
        name: normalizedName,
        description: normalizeWhitespace(candidate.description || candidate.summary || candidate.rule || candidate.stage || ""),
        type: candidate.type,
        scope: "project",
        projectId,
        updatedAt: nowIso(),
        ...(candidate.capturedAt ? { capturedAt: candidate.capturedAt } : {}),
        ...(candidate.sourceSessionKey ? { sourceSessionKey: candidate.sourceSessionKey } : {}),
      },
    };
  }

  upsertCandidate(candidate: MemoryCandidate): MemoryFileRecord {
    this.ensureLayout();
    const location = this.buildCandidateLocation(candidate);
    const existing = existsSync(location.absolutePath) ? this.readRecordFromPath(location.absolutePath) : undefined;
    const frontmatter: MemoryFileFrontmatter = {
      ...location.frontmatter,
      ...(existing?.deprecated ? { deprecated: true } : {}),
      ...(location.projectId === TMP_PROJECT_ID && typeof existing?.dreamAttempts === "number"
        ? { dreamAttempts: existing.dreamAttempts }
        : {}),
    };
    const body = this.renderCandidateBody(candidate, existing);
    const serialized = `${renderFrontmatter(frontmatter)}${body}\n`;
    writeFileSync(location.absolutePath, serialized, "utf-8");

    if (location.scope === "global") {
      this.rebuildManifest("global");
    } else if (location.projectId) {
      if (location.projectId !== TMP_PROJECT_ID) {
        const existingMeta = this.getProjectMeta(location.projectId);
        if (candidate.type === "project") {
          this.upsertProjectMeta({
            projectId: location.projectId,
            projectName: candidate.name || existingMeta?.projectName || location.projectId,
            description: candidate.description || candidate.summary || candidate.stage || existingMeta?.description || location.projectId,
            aliases: [candidate.name, candidate.description].filter(Boolean) as string[],
          });
        } else if (!existingMeta) {
          this.upsertProjectMeta({
            projectId: location.projectId,
            projectName: location.projectId,
            description: candidate.description || candidate.rule || location.projectId,
            aliases: [candidate.name, candidate.description].filter(Boolean) as string[],
          });
        }
      }
      this.rebuildManifest("project", location.projectId);
    }

    return this.getMemoryRecord(relative(this.rootDir, location.absolutePath))!;
  }

  toCandidate(record: MemoryFileRecord): MemoryCandidate {
    const sections = parseSections(record.content);
    if (record.type === "user") {
      return {
        type: "user",
        scope: "global",
        name: "user-profile",
        description: record.description,
        ...(record.capturedAt ? { capturedAt: record.capturedAt } : {}),
        ...(record.sourceSessionKey ? { sourceSessionKey: record.sourceSessionKey } : {}),
        profile: normalizeTextSection(sections.get("Profile")) || normalizeTextSection(sections.get("Summary")) || record.description,
        preferences: normalizeListSection(sections.get("Preferences")),
        constraints: normalizeListSection(sections.get("Constraints")),
        relationships: normalizeListSection(sections.get("Relationships")),
      };
    }
    if (record.type === "feedback") {
      return {
        type: "feedback",
        scope: "project",
        ...(record.projectId ? { projectId: record.projectId } : {}),
        name: record.name,
        description: record.description,
        ...(record.capturedAt ? { capturedAt: record.capturedAt } : {}),
        ...(record.sourceSessionKey ? { sourceSessionKey: record.sourceSessionKey } : {}),
        rule: normalizeTextSection(sections.get("Rule")) || record.description,
        why: normalizeTextSection(sections.get("Why")),
        howToApply: normalizeTextSection(sections.get("How to apply")),
        notes: normalizeListSection(sections.get("Notes")),
      };
    }
    return {
      type: "project",
      scope: "project",
      ...(record.projectId ? { projectId: record.projectId } : {}),
      name: record.name,
      description: record.description,
      ...(record.capturedAt ? { capturedAt: record.capturedAt } : {}),
      ...(record.sourceSessionKey ? { sourceSessionKey: record.sourceSessionKey } : {}),
      stage: normalizeTextSection(sections.get("Current Stage")) || record.description,
      decisions: normalizeListSection(sections.get("Decisions")),
      constraints: normalizeListSection(sections.get("Constraints")),
      nextSteps: normalizeListSection(sections.get("Next Steps")),
      blockers: normalizeListSection(sections.get("Blockers")),
      timeline: normalizeListSection(sections.get("Timeline")),
      notes: normalizeListSection(sections.get("Notes")),
    };
  }

  promoteTmpRecord(relativePath: string, projectId: string): MemoryFileRecord | undefined {
    const record = this.getMemoryRecord(relativePath, 5000);
    if (!record || record.projectId !== TMP_PROJECT_ID) return undefined;
    const candidate = this.toCandidate(record);
    const promoted = this.upsertCandidate({
      ...candidate,
      scope: "project",
      projectId,
    });
    this.deleteRecord({
      name: record.name,
      description: record.description,
      type: record.type,
      scope: "project",
      projectId: TMP_PROJECT_ID,
      updatedAt: record.updatedAt,
      file: record.file,
      relativePath: record.relativePath,
      absolutePath: record.absolutePath,
      ...(typeof record.dreamAttempts === "number" ? { dreamAttempts: record.dreamAttempts } : {}),
    });
    return promoted;
  }

  incrementDreamAttempts(relativePath: string): MemoryFileRecord | undefined {
    const absolutePath = join(this.rootDir, relativePath);
    if (!existsSync(absolutePath)) return undefined;
    const record = this.readRecordFromPath(absolutePath);
    if (record.projectId !== TMP_PROJECT_ID) return undefined;
    const nextFrontmatter: MemoryFileFrontmatter = {
      name: record.name,
      description: record.description,
      type: record.type,
      scope: record.scope,
      ...(record.projectId ? { projectId: record.projectId } : {}),
      updatedAt: record.updatedAt,
      ...(record.deprecated ? { deprecated: true } : {}),
      dreamAttempts: (record.dreamAttempts ?? 0) + 1,
    };
    writeFileSync(absolutePath, `${renderFrontmatter(nextFrontmatter)}${record.content}\n`, "utf-8");
    this.rebuildManifest("project", TMP_PROJECT_ID);
    return this.getMemoryRecord(relativePath, 5000);
  }

  cleanupTmpEntries(options: {
    maxDreamAttempts?: number;
    olderThanMs?: number;
    archive?: boolean;
  } = {}): TmpCleanupResult {
    const maxDreamAttempts = Math.max(1, options.maxDreamAttempts ?? 3);
    const olderThanMs = Math.max(1, options.olderThanMs ?? 7 * 24 * 60 * 60 * 1000);
    const archive = options.archive !== false;
    const now = Date.now();
    let archived = 0;
    let deleted = 0;
    let kept = 0;
    const changedFiles: string[] = [];
    for (const entry of this.listTmpEntries(1000)) {
      const record = this.getMemoryRecord(entry.relativePath, 5000);
      if (!record) continue;
      const updatedAt = Date.parse(record.updatedAt);
      const tooOld = Number.isFinite(updatedAt) ? now - updatedAt >= olderThanMs : false;
      const tooManyAttempts = (record.dreamAttempts ?? 0) >= maxDreamAttempts;
      if (!tooOld && !tooManyAttempts) {
        kept += 1;
        continue;
      }
      if (archive) {
        this.archiveRecord(entry);
        archived += 1;
      } else {
        this.deleteRecord(entry);
        deleted += 1;
      }
      changedFiles.push(entry.relativePath);
    }
    return { archived, deleted, kept, changedFiles };
  }

  archiveRecord(entry: MemoryManifestEntry): void {
    if (!existsSync(entry.absolutePath)) return;
    const archiveDir = join(dirname(entry.absolutePath), ARCHIVE_DIR);
    ensureDir(archiveDir);
    renameSync(entry.absolutePath, join(archiveDir, entry.file));
    if (entry.scope === "global") {
      this.rebuildManifest("global");
    } else {
      this.rebuildManifest("project", entry.projectId ?? TMP_PROJECT_ID);
    }
  }

  deleteRecord(entry: MemoryManifestEntry): void {
    if (!existsSync(entry.absolutePath)) return;
    unlinkSync(entry.absolutePath);
    if (entry.scope === "global") {
      this.rebuildManifest("global");
    } else {
      this.rebuildManifest("project", entry.projectId ?? TMP_PROJECT_ID);
    }
  }

  getOverview(lastDreamAt?: string): FileMemoryOverview {
    const entries = this.listMemoryEntries({ limit: 1000 });
    const totalUserMemories = entries.filter((entry) => entry.type === "user").length;
    const totalFeedbackMemories = entries.filter((entry) => entry.type === "feedback").length;
    const totalProjectMemories = entries.filter((entry) => entry.type === "project").length;
    return {
      totalMemoryFiles: entries.length,
      totalUserMemories,
      totalFeedbackMemories,
      totalProjectMemories,
      changedFilesSinceLastDream: lastDreamAt
        ? entries.filter((entry) => entry.updatedAt > lastDreamAt).length
        : entries.length,
    };
  }

  getSnapshotVersion(lastDreamAt?: string): string {
    const overview = this.getOverview(lastDreamAt);
    const latest = this.listMemoryEntries({ limit: 1 })[0]?.updatedAt ?? "";
    const latestProjectMeta = this.listProjectMetas()[0]?.updatedAt ?? "";
    return JSON.stringify({
      totalMemoryFiles: overview.totalMemoryFiles,
      totalUserMemories: overview.totalUserMemories,
      totalFeedbackMemories: overview.totalFeedbackMemories,
      totalProjectMemories: overview.totalProjectMemories,
      projectMetaCount: this.listProjectMetas().length,
      latest,
      latestProjectMeta,
    });
  }

  repairManifests(): { changed: number; summary: string } {
    const before = this.listMemoryEntries({ limit: 1000, includeTmp: true });
    const after = this.rebuildAllManifests({ includeTmp: true });
    const changed = Math.abs(after.length - before.length);
    return {
      changed,
      summary: `Rebuilt manifests for ${after.length} memory files.`,
    };
  }

  mergeDuplicateEntries(entries: MemoryManifestEntry[]): { merged: number; changedFiles: string[] } {
    const groups = new Map<string, MemoryManifestEntry[]>();
    for (const entry of entries) {
      const key = `${entry.scope}:${entry.projectId ?? "global"}:${entry.type}:${slugify(entry.name)}`;
      const bucket = groups.get(key) ?? [];
      bucket.push(entry);
      groups.set(key, bucket);
    }
    let merged = 0;
    const changedFiles: string[] = [];
    for (const bucket of groups.values()) {
      if (bucket.length < 2) continue;
      const [primary, ...duplicates] = sortEntriesByUpdatedAt(bucket);
      if (!primary) continue;
      const primaryRecord = this.getMemoryRecord(primary.relativePath, 5000);
      if (!primaryRecord) continue;
      let mergedCandidate = this.toCandidate(primaryRecord);
      for (const duplicate of duplicates) {
        const duplicateRecord = this.getMemoryRecord(duplicate.relativePath, 5000);
        if (!duplicateRecord) continue;
        const incoming = this.toCandidate(duplicateRecord);
        if (mergedCandidate.type === "user" && incoming.type === "user") {
          mergedCandidate = {
            ...mergedCandidate,
            summary: pickLongest(mergedCandidate.summary ?? "", incoming.summary ?? ""),
            preferences: uniqueItems([...(mergedCandidate.preferences ?? []), ...(incoming.preferences ?? [])], 20),
            constraints: uniqueItems([...(mergedCandidate.constraints ?? []), ...(incoming.constraints ?? [])], 20),
            relationships: uniqueItems([...(mergedCandidate.relationships ?? []), ...(incoming.relationships ?? [])], 20),
            notes: uniqueItems([...(mergedCandidate.notes ?? []), ...(incoming.notes ?? [])], 20),
          };
        } else if (mergedCandidate.type === "feedback" && incoming.type === "feedback") {
          mergedCandidate = {
            ...mergedCandidate,
            description: pickLongest(mergedCandidate.description, incoming.description),
            rule: pickLongest(mergedCandidate.rule ?? "", incoming.rule ?? ""),
            why: mergeSectionText(mergedCandidate.why ?? "", incoming.why ?? ""),
            howToApply: mergeSectionText(mergedCandidate.howToApply ?? "", incoming.howToApply ?? ""),
            notes: uniqueItems([...(mergedCandidate.notes ?? []), ...(incoming.notes ?? []), duplicate.relativePath], 20),
          };
        } else if (mergedCandidate.type === "project" && incoming.type === "project") {
          mergedCandidate = {
            ...mergedCandidate,
            description: pickLongest(mergedCandidate.description, incoming.description),
            stage: pickLongest(mergedCandidate.stage ?? "", incoming.stage ?? ""),
            decisions: uniqueItems([...(mergedCandidate.decisions ?? []), ...(incoming.decisions ?? [])], 20),
            constraints: uniqueItems([...(mergedCandidate.constraints ?? []), ...(incoming.constraints ?? [])], 20),
            nextSteps: uniqueItems([...(mergedCandidate.nextSteps ?? []), ...(incoming.nextSteps ?? [])], 20),
            blockers: uniqueItems([...(mergedCandidate.blockers ?? []), ...(incoming.blockers ?? [])], 20),
            timeline: uniqueItems([...(mergedCandidate.timeline ?? []), ...(incoming.timeline ?? [])], 20),
            notes: uniqueItems([...(mergedCandidate.notes ?? []), ...(incoming.notes ?? []), duplicate.relativePath], 20),
          };
        }
        this.archiveRecord(duplicate);
        merged += 1;
        changedFiles.push(primary.relativePath, duplicate.relativePath);
      }
      this.upsertCandidate(mergedCandidate);
    }
    return { merged, changedFiles: Array.from(new Set(changedFiles)) };
  }

  getFileUpdatedAt(relativePath: string): string | undefined {
    const absolutePath = join(this.rootDir, relativePath);
    if (!existsSync(absolutePath)) return undefined;
    const stats = statSync(absolutePath);
    return stats.mtime.toISOString();
  }
}
