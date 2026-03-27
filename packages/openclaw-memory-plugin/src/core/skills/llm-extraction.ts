import type {
  FactCandidate,
  GlobalProfileRecord,
  IntentType,
  L0SessionRecord,
  L1WindowRecord,
  L2ProjectIndexRecord,
  L2TimeIndexRecord,
  MemoryMessage,
  ProjectDetail,
  ProjectStatus,
  RetrievalResult,
} from "../types.js";

type LoggerLike = {
  info?: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
};

type ProviderHeaders = Record<string, string> | undefined;

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || /timeout/i.test(error.message));
}

function resolveRequestTimeoutMs(timeoutMs: number | undefined): number | null {
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) return 15_000;
  if (timeoutMs <= 0) return null;
  return timeoutMs;
}

interface ModelSelection {
  provider: string;
  model: string;
  api: string;
  baseUrl?: string;
  headers?: ProviderHeaders;
}

interface RawFactItem {
  category?: unknown;
  subject?: unknown;
  value?: unknown;
  confidence?: unknown;
}

interface RawProjectItem {
  key?: unknown;
  name?: unknown;
  status?: unknown;
  summary?: unknown;
  latest_progress?: unknown;
  confidence?: unknown;
}

interface RawExtractionPayload {
  summary?: unknown;
  situation_time_info?: unknown;
  facts?: unknown;
  projects?: unknown;
}

interface RawProjectResolutionPayload {
  matched_project_key?: unknown;
  canonical_key?: unknown;
  canonical_name?: unknown;
}

interface RawProjectBatchResolutionPayload {
  projects?: unknown;
}

interface RawTopicShiftPayload {
  topic_changed?: unknown;
  topic_summary?: unknown;
}

interface RawDailySummaryPayload {
  summary?: unknown;
}

interface RawProfilePayload {
  profile_text?: unknown;
}

interface RawReasoningPayload {
  intent?: unknown;
  enough_at?: unknown;
  use_profile?: unknown;
  l2_ids?: unknown;
  l1_ids?: unknown;
  l0_ids?: unknown;
}

interface RawHop1RoutePayload {
  memory_relevant?: unknown;
  base_only?: unknown;
  lookup_queries?: unknown;
}

interface RawHop2L2Payload {
  intent?: unknown;
  selected_l2_ids?: unknown;
  enough_at?: unknown;
}

interface RawHop3L1Payload {
  use_profile?: unknown;
  selected_l1_ids?: unknown;
  enough_at?: unknown;
}

interface RawHop4L0Payload {
  selected_l0_ids?: unknown;
  enough_at?: unknown;
}

interface RawLookupQueryPayload {
  target_types?: unknown;
  lookup_query?: unknown;
}

export interface SessionExtractionResult {
  summary: string;
  situationTimeInfo: string;
  facts: FactCandidate[];
  projectDetails: ProjectDetail[];
}

export interface LlmProjectResolutionInput {
  project: ProjectDetail;
  existingProjects: L2ProjectIndexRecord[];
  agentId?: string;
}

export interface LlmTopicShiftInput {
  currentTopicSummary: string;
  recentUserTurns: string[];
  incomingUserTurns: string[];
  agentId?: string;
}

export interface LlmTopicShiftDecision {
  topicChanged: boolean;
  topicSummary: string;
}

export interface LlmDailyTimeSummaryInput {
  dateKey: string;
  existingSummary: string;
  l1: L1WindowRecord;
  agentId?: string;
}

export interface LlmGlobalProfileInput {
  existingProfile: string;
  l1: L1WindowRecord;
  agentId?: string;
}

export interface LlmReasoningInput {
  query: string;
  profile: GlobalProfileRecord | null;
  l2Time: L2TimeIndexRecord[];
  l2Projects: L2ProjectIndexRecord[];
  l1Windows: L1WindowRecord[];
  l0Sessions: L0SessionRecord[];
  limits: {
    l2: number;
    l1: number;
    l0: number;
  };
  timeoutMs?: number;
  agentId?: string;
}

export interface LlmReasoningSelection {
  intent: IntentType;
  enoughAt: RetrievalResult["enoughAt"];
  useProfile: boolean;
  l2Ids: string[];
  l1Ids: string[];
  l0Ids: string[];
}

export interface LlmProjectBatchResolutionInput {
  projects: ProjectDetail[];
  existingProjects: L2ProjectIndexRecord[];
  agentId?: string;
}

export interface LlmProjectMemoryRewriteItem {
  incomingProject: ProjectDetail;
  existingProject: L2ProjectIndexRecord | null;
  recentWindows: L1WindowRecord[];
}

export interface LlmProjectMemoryRewriteInput {
  l1: L1WindowRecord;
  projects: LlmProjectMemoryRewriteItem[];
  agentId?: string;
}

export type LookupTargetType = "time" | "project";

export interface LlmMemoryRouteInput {
  query: string;
  profile: GlobalProfileRecord | null;
  timeoutMs?: number;
  agentId?: string;
}

export interface LookupQuerySpec {
  targetTypes: LookupTargetType[];
  lookupQuery: string;
}

export interface Hop1LookupDecision {
  memoryRelevant: boolean;
  baseOnly: boolean;
  lookupQueries: LookupQuerySpec[];
}

export interface L2CatalogEntry {
  id: string;
  type: LookupTargetType;
  label: string;
  lookupKeys: string[];
  compressedContent: string;
}

export interface LlmHop2L2Input {
  query: string;
  profile: GlobalProfileRecord | null;
  lookupQueries: LookupQuerySpec[];
  l2Entries: L2CatalogEntry[];
  catalogTruncated?: boolean;
  timeoutMs?: number;
  agentId?: string;
}

export interface Hop2L2Decision {
  intent: IntentType;
  selectedL2Ids: string[];
  enoughAt: "l2" | "descend_l1" | "none";
}

export interface L0HeaderCandidate {
  l0IndexId: string;
  sessionKey: string;
  timestamp: string;
  lastUserMessage: string;
  lastAssistantMessage: string;
}

export interface LlmHop3L1Input {
  query: string;
  profile: GlobalProfileRecord | null;
  selectedL2Entries: L2CatalogEntry[];
  l1Windows: L1WindowRecord[];
  timeoutMs?: number;
  agentId?: string;
}

export interface Hop3L1Decision {
  useProfile: boolean;
  selectedL1Ids: string[];
  enoughAt: "l1" | "descend_l0" | "none";
}

export interface LlmHop4L0Input {
  query: string;
  selectedL2Entries: L2CatalogEntry[];
  selectedL1Windows: L1WindowRecord[];
  l0Sessions: L0SessionRecord[];
  timeoutMs?: number;
  agentId?: string;
}

export interface Hop4L0Decision {
  selectedL0Ids: string[];
  enoughAt: "l0" | "none";
}

const EXTRACTION_SYSTEM_PROMPT = `
You are a memory indexing engine for a conversational assistant.

Your job is to convert a visible user/assistant conversation into durable memory indexes.

Rules:
- Only use information explicitly present in the conversation.
- Ignore system prompts, tool scaffolding, hidden reasoning, formatting artifacts, and operational chatter.
- Be conservative. If something is ambiguous, omit it.
- Track projects only when they look like a real ongoing effort, task stream, research topic, implementation effort, or recurring problem worth revisiting later.
- "Project" here is broad: it can be a workstream, submission, research effort, health/problem thread, or other ongoing topic the user is likely to revisit.
- If the conversation contains multiple independent ongoing threads, return multiple project items instead of collapsing them into one.
- Repeated caregiving, illness handling, symptom tracking, recovery follow-up, or other ongoing real-world problem-solving threads should be treated as projects when the user is actively managing them.
- Example: "friend has diarrhea / user buys medicine / later reports recovery" is a project-like thread.
- Example: "preparing an EMNLP submission" is another independent project-like thread.
- Do not treat casual one-off mentions as projects.
- Extract facts only when they are likely to matter in future conversations: preferences, constraints, goals, identity, long-lived context, stable relationships, or durable project context.
- The facts are intermediate material for a later global profile rewrite, so prefer stable facts over temporary situation notes.
- Natural-language output fields must use the dominant language of the user messages. If user messages are mixed, prefer the most recent user language. Keys and enums must stay in English.
- Each project summary must be a compact 1-2 sentence project memory, not a generic status line.
- A good project summary should preserve: what the project is, what stage it is in now, and the next step / blocker / missing info when available.
- Do not output vague summaries like "用户正在推进这个项目", "进展顺利", "还可以", or "正在处理某事" unless the project-specific context is also included.
- latest_progress must stay short and only capture the newest meaningful update, newest blocker, or newest confirmation state.
- Return valid JSON only. No markdown fences, no commentary.

Use this exact JSON shape:
{
  "summary": "short session summary",
  "situation_time_info": "short time-aware progress line",
  "facts": [
    {
      "category": "preference | profile | goal | constraint | relationship | project | context | other",
      "subject": "stable english key fragment",
      "value": "durable fact text",
      "confidence": 0.0
    }
  ],
  "projects": [
    {
      "key": "stable english identifier, lower-kebab-case",
      "name": "project name as the user would recognize it",
      "status": "planned | in_progress | done",
      "summary": "rolling 1-2 sentence summary: what this project is + current phase + next step/blocker when known",
      "latest_progress": "short latest meaningful progress or blocker, without repeating the full project background",
      "confidence": 0.0
    }
  ]
}
`.trim();

const PROJECT_RESOLUTION_SYSTEM_PROMPT = `
You resolve whether an incoming project memory should merge into an existing project memory.

Rules:
- Prefer merging duplicates caused by wording differences, synonyms, or different granularity of the same effort.
- Match only when the underlying ongoing effort is clearly the same.
- Reuse an existing project when possible.
- If multiple labels refer to the same EMNLP submission, the same health follow-up, or the same long-running effort, merge them.
- Return JSON only.

Use this exact JSON shape:
{
  "matched_project_key": "existing project key or null",
  "canonical_key": "stable lower-kebab-case key",
  "canonical_name": "project name users would recognize"
}
`.trim();

const PROJECT_BATCH_RESOLUTION_SYSTEM_PROMPT = `
You resolve whether each incoming project memory should merge into an existing project memory.

Rules:
- Process all incoming projects together so duplicates inside the same batch can be merged.
- Prefer merging duplicates caused by wording differences, synonyms, or different granularity of the same effort.
- Reuse an existing project when possible.
- Only create a new canonical project when none of the existing projects match.
- Return JSON only.

Use this exact JSON shape:
{
  "projects": [
    {
      "incoming_key": "original incoming project key",
      "matched_project_key": "existing project key or null",
      "canonical_key": "stable lower-kebab-case key",
      "canonical_name": "project name users would recognize"
    }
  ]
}
`.trim();

const PROJECT_COMPLETION_SYSTEM_PROMPT = `
You review an extracted project list and complete any missing ongoing threads from the conversation.

Rules:
- Return the full corrected project list, not just additions.
- Include all independent ongoing threads that are likely to matter in future conversation.
- Health/caregiving/problem-management threads count as projects when the user is actively managing them.
- Resolved but substantial threads from the current window may still be kept with status "done" if they are a meaningful thread the user may refer back to.
- Example pair of separate projects in one window: "friend's stomach illness and medicine follow-up" plus "EMNLP submission preparation".
- Merge duplicates caused by wording differences.
- For each project summary, write a compact 1-2 sentence project memory that explains what the project is, what phase it is in, and the next step / blocker / missing info when available.
- Do not flatten summaries into generic text like "用户正在做某事", "进展还可以", or "正在推进".
- latest_progress should stay short and only describe the newest concrete update.
- Return JSON only.

Use this exact JSON shape:
{
  "projects": [
    {
      "key": "stable english identifier, lower-kebab-case",
      "name": "project name as the user would recognize it",
      "status": "planned | in_progress | done",
      "summary": "rolling 1-2 sentence summary: what this project is + current phase + next step/blocker when known",
      "latest_progress": "short latest meaningful progress or blocker, without repeating the full project background",
      "confidence": 0.0
    }
  ]
}
`.trim();

const TOPIC_BOUNDARY_SYSTEM_PROMPT = `
You judge whether new user messages continue the current topic or start a new topic.

Rules:
- Use only semantic meaning, not keyword overlap.
- Treat a topic as the same if the user is still talking about the same underlying problem, project, situation, or intent.
- Treat it as changed only when the new user messages clearly pivot to a different underlying topic.
- You are given only user messages. Do not assume any assistant content.
- Return JSON only.

Use this exact JSON shape:
{
  "topic_changed": true,
  "topic_summary": "short topic summary in the user's language"
}
`.trim();

const DAILY_TIME_SUMMARY_SYSTEM_PROMPT = `
You maintain a single daily episodic memory summary for a user.

Rules:
- Focus on what happened during that day, what the user was dealing with, and the day's situation.
- Do not turn the summary into a long-term profile.
- Do not over-focus on project metadata; describe the day's lived context.
- Merge the existing daily summary with the new L1 window into one concise updated daily summary.
- Natural-language output must follow the language used by the user in the new L1 window.
- Return JSON only.

Use this exact JSON shape:
{
  "summary": "updated daily summary"
}
`.trim();

const PROJECT_MEMORY_REWRITE_SYSTEM_PROMPT = `
You maintain rolling L2 project memories for a conversational memory system.

Rules:
- Rewrite the full project memory for each incoming project using the existing L2 memory, recent linked L1 windows, and the new L1 window.
- Preserve earlier project background and major stage transitions whenever they are still useful.
- The new summary must not overwrite older context with only the newest update.
- summary must be a compact 1-2 sentence rolling project memory that preserves:
  1. what the project is,
  2. important stage progression or milestones so far,
  3. the current phase,
  4. the next step / blocker / missing info when present.
- latest_progress must stay short and only describe the newest meaningful update, blocker, or confirmation state.
- Do not output generic summaries like "用户正在推进这个项目", "进展顺利", "还可以", or "正在处理某事" unless the project-specific context is explicitly preserved.
- Keep each project's incoming key stable.
- Natural-language output must follow the language used by the user in the new L1 window.
- Return JSON only.

Use this exact JSON shape:
{
  "projects": [
    {
      "key": "same stable english identifier as the incoming project",
      "name": "project name as the user would recognize it",
      "status": "planned | in_progress | done",
      "summary": "rolling 1-2 sentence project memory with background + stage progression + current phase + next step/blocker when known",
      "latest_progress": "short latest meaningful progress or blocker",
      "confidence": 0.0
    }
  ]
}
`.trim();

const GLOBAL_PROFILE_SYSTEM_PROMPT = `
You maintain a single global user profile summary.

Rules:
- Rewrite the whole profile as one concise paragraph.
- Keep only stable user traits, identity, long-term preferences, constraints, relationships, communication style, and long-range goals.
- Do not include temporary daily events, short-lived situations, or project progress updates.
- Use the existing profile plus the new L1 facts as evidence, then rewrite the full profile.
- Natural-language output must follow the user's dominant language in the new L1 window.
- Return JSON only.

Use this exact JSON shape:
{
  "profile_text": "updated stable user profile paragraph"
}
`.trim();

const REASONING_SYSTEM_PROMPT = `
You are a semantic memory retrieval reasoner.

Your job is to decide which memory records are relevant to the user's query.

Rules:
- Use semantic meaning, not keyword overlap.
- Use high recall for obvious paraphrases and near-synonyms.
- Temporal summary questions like "我今天都在忙什么", "今天发生了什么", "我最近在做什么", "what was I doing today", or "what happened recently" should usually select L2 time indexes.
- If there is a current-day or recent-day L2 time summary and the user asks about today/recent activity, prefer that L2 time record even if wording differs.
- For project queries, prefer L2 project indexes when they already capture enough.
- For time queries, prefer L2 time indexes when they already capture enough.
- For profile/fact queries about the user's identity, preferences, habits, or stable traits, set use_profile=true when the global profile is useful.
- Select the smallest set of records needed to answer the query well.
- enough_at only refers to L2/L1/L0 structured memory. The profile is an additional supporting source.
- If L2 already captures enough, set enough_at to "l2".
- If L2 is insufficient but L1 is enough, set enough_at to "l1".
- If detailed raw conversation is needed, set enough_at to "l0".
- Return JSON only.

Use this exact JSON shape:
{
  "intent": "time | project | fact | general",
  "enough_at": "l2 | l1 | l0 | none",
  "use_profile": true,
  "l2_ids": ["l2 index id"],
  "l1_ids": ["l1 index id"],
  "l0_ids": ["l0 index id"]
}
`.trim();

const HOP1_LOOKUP_SYSTEM_PROMPT = `
你是记忆检索系统的第一跳规划器。

你的任务不是选具体索引，而是判断：
1. 这个问题是否需要动态记忆
2. 如果需要，后续应该朝哪个索引类型查
3. 后续应该带什么查询词去查

规则：
- 以语义为准，不要做表面关键词匹配。
- 输入里的 global_profile 是顶层稳定画像。
- 如果问题仅靠 global_profile 就能回答，必须设为 base_only=true。
- 典型 base_only 问题：
  - 用户身份、偏好、习惯、长期属性
  - 例如："我喜欢用什么语言交流"
  - 例如："我平时喜欢吃什么"
  - 例如："介绍一下我"
  - 例如："良子是谁"
  - 例如："你还记得我吗"
- 只要问题在问某一天发生了什么、最近做了什么、今天在忙什么、某个项目最近进展如何、之前推荐过什么，base_only 就必须是 false。
- 如果 base_only=false，你必须输出至少一条 lookup_queries。
- 如果 base_only=true，lookup_queries 必须是空数组。
- mixed question 可以同时涉及时间和项目，此时 target_types 可以是 ["time","project"]。
- lookup_query 要写成后续检索可用的短查询词，而不是复述整段规则。
- 时间相关问题尽量写出明确日期或带日期感的查询词；如果做不到，也要写出清晰的时间范围表达。
- 不要在这一跳选择具体记录 id。
- 只返回 JSON，不要返回解释。

重点示例：
- Query: "我喜欢用什么语言交流"
  -> memory_relevant=true, base_only=true, lookup_queries=[]
- Query: "介绍一下我"
  -> memory_relevant=true, base_only=true, lookup_queries=[]
- Query: "良子是谁"
  -> memory_relevant=true, base_only=true, lookup_queries=[]
- Query: "我今天都在忙什么"
  -> memory_relevant=true, base_only=false, lookup_queries=[{"target_types":["time"],"lookup_query":"今天 2026-03-16 做了什么"}]
- Query: "我今天论文进展怎么样"
  -> memory_relevant=true, base_only=false, lookup_queries=[{"target_types":["time","project"],"lookup_query":"今天 EMNLP 论文进展"}]
- Query: "你之前推荐我的北京烧烤店是哪家"
  -> memory_relevant=true, base_only=false, lookup_queries=[{"target_types":["project"],"lookup_query":"北京 烧烤店 推荐"}]

严格使用这个 JSON 结构：
{
  "memory_relevant": true,
  "base_only": false,
  "lookup_queries": [
    {
      "target_types": ["time", "project"],
      "lookup_query": "short lookup query"
    }
  ]
}
`.trim();

const HOP2_L2_SYSTEM_PROMPT = `
你是记忆检索系统的第二跳规划器。

你现在已经看到了真实的 L2 索引内容。你的任务是：
1. 选择真正相关的 L2 记录
2. 判断停在 L2 是否已经足够
3. 如果不够，再决定继续下钻到 L1

规则：
- l2_entries 不是目录名，它们已经包含压缩后的真实 L2 内容。
- 以语义为准，不要做表面关键词匹配。
- selected_l2_ids 可以是 0 条、1 条或多条。
- 如果某条或某几条 L2 已经足够回答，就设 enough_at="l2"。
- 如果 L2 相关但还不够，需要看它 link 到的 L1，就设 enough_at="descend_l1"。
- 只有在 L2 真的帮不上忙时，才设 enough_at="none"。
- 如果问题是稳定画像类问题，例如语言偏好、长期身份、交流风格，而 global_profile 已经足够，就不要选 L2。
- mixed question 可以同时选中时间 L2 和项目 L2。
- 如果 exact answer 已经直接出现在项目 L2 的 latest progress 或 summary 里，就可以停在 L2，不需要强行下钻。
- catalog_truncated=true 只表示为了 prompt 预算省略了一些更旧条目，不表示当前条目不可靠。
- 只返回 JSON，不要解释。

重点示例：
- Query: "我喜欢用什么语言交流"
  -> selected_l2_ids=[], enough_at="none"
- Query: "我今天都在忙什么"
  -> 选中今天的 time L2，enough_at="l2"
- Query: "我今天论文进展怎么样"
  -> 可以同时选中今天的 time L2 和相关 project L2
- Query: "你之前推荐我的北京烧烤店是哪家"
  -> 如果项目 L2 的 latest progress 已经列出店名，则 enough_at="l2"；如果没有 exact name，再设为 "descend_l1"

严格使用这个 JSON 结构：
{
  "intent": "time | project | fact | general",
  "selected_l2_ids": ["l2 id"],
  "enough_at": "l2 | descend_l1 | none"
}
`.trim();

const HOP3_L1_SYSTEM_PROMPT = `
You are the L1 planner for a memory retrieval system.

Your job is to read selected L2 evidence plus linked L1 windows and decide whether L1 is enough.

Rules:
- Read the selected L2 entries as higher-level context.
- Read the candidate L1 windows as the next level of evidence.
- Do not choose L0 here.
- If selected L1 windows already answer the query, set enough_at="l1".
- If lower raw conversation detail is still needed, set enough_at="descend_l0".
- If neither L1 nor lower levels help, set enough_at="none".
- use_profile should be true when the global profile still helps answer the question.
- Return JSON only.

Use this exact JSON shape:
{
  "use_profile": true,
  "selected_l1_ids": ["l1 id"],
  "enough_at": "l1 | descend_l0 | none"
}
`.trim();

const HOP4_L0_SYSTEM_PROMPT = `
You are the raw-conversation planner for a memory retrieval system.

Your job is to read selected L2 evidence, selected L1 windows, and linked raw L0 conversations, then choose whether raw L0 detail is enough.

Rules:
- Choose only the L0 sessions that materially help answer the query.
- Use raw L0 only when exact prior wording, exact recommendation, exact names, or other conversation-level detail is needed.
- If one or more selected L0 sessions contain the needed detail, set enough_at="l0".
- Otherwise set enough_at="none".
- Return JSON only.

Use this exact JSON shape:
{
  "selected_l0_ids": ["l0 id"],
  "enough_at": "l0 | none"
}
`.trim();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength).trim();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function sanitizeHeaders(headers: unknown): ProviderHeaders {
  if (!isRecord(headers)) return undefined;
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string" && value.trim()) next[key] = value;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

function parseModelRef(modelRef: string | undefined, config: Record<string, unknown>): { provider: string; model: string } | undefined {
  if (typeof modelRef === "string" && modelRef.includes("/")) {
    const [provider, ...rest] = modelRef.split("/");
    const model = rest.join("/").trim();
    if (provider?.trim() && model) {
      return { provider: provider.trim(), model };
    }
  }

  const modelsConfig = isRecord(config.models) ? config.models : undefined;
  const providers = modelsConfig && isRecord(modelsConfig.providers) ? modelsConfig.providers : undefined;
  if (!providers) return undefined;

  if (typeof modelRef === "string" && modelRef.trim()) {
    const providerEntries = Object.entries(providers);
    if (providerEntries.length === 1) {
      return { provider: providerEntries[0]![0], model: modelRef.trim() };
    }
  }

  for (const [provider, providerConfig] of Object.entries(providers)) {
    if (!isRecord(providerConfig)) continue;
    const models = Array.isArray(providerConfig.models) ? providerConfig.models : [];
    const firstModel = models.find((entry) => isRecord(entry) && typeof entry.id === "string" && entry.id.trim());
    if (firstModel && isRecord(firstModel)) {
      return { provider, model: String(firstModel.id).trim() };
    }
  }
  return undefined;
}

function resolveAgentPrimaryModel(config: Record<string, unknown>, agentId?: string): string | undefined {
  const agents = isRecord(config.agents) ? config.agents : undefined;
  const defaults = agents && isRecord(agents.defaults) ? agents.defaults : undefined;
  const defaultsModel = defaults && isRecord(defaults.model) ? defaults.model : undefined;

  if (agentId && agents && isRecord(agents[agentId])) {
    const agentConfig = agents[agentId] as Record<string, unknown>;
    const agentModel = isRecord(agentConfig.model) ? agentConfig.model : undefined;
    if (typeof agentModel?.primary === "string" && agentModel.primary.trim()) {
      return agentModel.primary.trim();
    }
  }

  if (typeof defaultsModel?.primary === "string" && defaultsModel.primary.trim()) {
    return defaultsModel.primary.trim();
  }

  return undefined;
}

function detectPreferredOutputLanguage(messages: MemoryMessage[]): string | undefined {
  const userText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  if (/[\u4e00-\u9fff]/.test(userText)) return "Simplified Chinese";
  return undefined;
}

function buildPrompt(timestamp: string, messages: MemoryMessage[], extraInstruction?: string): string {
  const conversation = messages.map((message, index) => ({
    index,
    role: message.role,
    content: message.content,
  }));
  const preferredLanguage = detectPreferredOutputLanguage(messages);

  const sections = [
    "Conversation timestamp:",
    timestamp,
    "",
    "Visible conversation messages:",
    JSON.stringify(conversation, null, 2),
    "",
    "Remember:",
    "- summary should describe the session at a glance.",
    "- situation_time_info should read like a short progress update anchored to this conversation moment.",
    "- facts should be durable and future-useful, not turn-specific noise.",
    "- projects should only include trackable ongoing efforts.",
    "- if there are two or more unrelated ongoing threads, list them as separate project entries.",
    "- health/caregiving/problem-management threads count as projects when they are ongoing across turns.",
    "- each project summary should explain what the project is, what phase it is in, and the next step or blocker when available.",
    "- avoid generic project summaries that only say progress is fine or ongoing.",
  ];
  if (preferredLanguage) {
    sections.push(`- Write all natural-language output fields in ${preferredLanguage}.`);
  }
  if (extraInstruction) {
    sections.push("", "Additional requirement:", extraInstruction);
  }
  return sections.join("\n");
}

function buildProjectCompletionPrompt(input: {
  timestamp: string;
  messages: MemoryMessage[];
  summary: string;
  facts: FactCandidate[];
  projectDetails: ProjectDetail[];
}): string {
  return JSON.stringify({
    timestamp: input.timestamp,
    messages: input.messages.map((message, index) => ({
      index,
      role: message.role,
      content: truncateForPrompt(message.content, 220),
    })),
    current_summary: input.summary,
    current_facts: input.facts,
    current_projects: input.projectDetails,
    completion_goal: "Keep all meaningful ongoing projects. Each summary should preserve project background, current phase, and next step or blocker when available.",
  }, null, 2);
}

function buildTopicShiftPrompt(input: LlmTopicShiftInput): string {
  return JSON.stringify({
    current_topic_summary: truncateForPrompt(input.currentTopicSummary, 160),
    recent_user_turns: input.recentUserTurns.map((value) => truncateForPrompt(value, 180)).slice(-8),
    incoming_user_turns: input.incomingUserTurns.map((value) => truncateForPrompt(value, 180)).slice(-6),
  }, null, 2);
}

function buildDailyTimeSummaryPrompt(input: LlmDailyTimeSummaryInput): string {
  return JSON.stringify({
    date_key: input.dateKey,
    existing_daily_summary: truncateForPrompt(input.existingSummary, 320),
    new_l1: {
      summary: truncateForPrompt(input.l1.summary, 220),
      situation_time_info: truncateForPrompt(input.l1.situationTimeInfo, 220),
      projects: input.l1.projectDetails.map((project) => ({
        name: project.name,
        status: project.status,
        summary: truncateForPrompt(project.summary, 160),
        latest_progress: truncateForPrompt(project.latestProgress, 160),
      })),
      facts: input.l1.facts.map((fact) => ({
        key: fact.factKey,
        value: truncateForPrompt(fact.factValue, 120),
      })).slice(0, 10),
    },
  }, null, 2);
}

function buildProjectMemoryRewritePrompt(input: LlmProjectMemoryRewriteInput): string {
  return JSON.stringify({
    current_l1: {
      id: input.l1.l1IndexId,
      time_period: input.l1.timePeriod,
      summary: truncateForPrompt(input.l1.summary, 220),
      situation_time_info: truncateForPrompt(input.l1.situationTimeInfo, 220),
      projects: input.l1.projectDetails.map((project) => ({
        key: project.key,
        name: project.name,
        status: project.status,
        summary: truncateForPrompt(project.summary, 220),
        latest_progress: truncateForPrompt(project.latestProgress, 180),
      })),
    },
    incoming_projects: input.projects.map((item) => ({
      incoming_project: {
        key: item.incomingProject.key,
        name: item.incomingProject.name,
        status: item.incomingProject.status,
        summary: truncateForPrompt(item.incomingProject.summary, 240),
        latest_progress: truncateForPrompt(item.incomingProject.latestProgress, 180),
        confidence: item.incomingProject.confidence,
      },
      existing_project_memory: item.existingProject
        ? {
            project_key: item.existingProject.projectKey,
            project_name: item.existingProject.projectName,
            status: item.existingProject.currentStatus,
            summary: truncateForPrompt(item.existingProject.summary, 320),
            latest_progress: truncateForPrompt(item.existingProject.latestProgress, 180),
          }
        : null,
      recent_stage_windows: item.recentWindows.slice(0, 5).map((window) => ({
        id: window.l1IndexId,
        time_period: window.timePeriod,
        summary: truncateForPrompt(window.summary, 180),
        situation_time_info: truncateForPrompt(window.situationTimeInfo, 180),
        matching_project_details: window.projectDetails
          .filter((project) => project.key === item.incomingProject.key || project.name === item.incomingProject.name)
          .slice(0, 2)
          .map((project) => ({
            key: project.key,
            name: project.name,
            status: project.status,
            summary: truncateForPrompt(project.summary, 180),
            latest_progress: truncateForPrompt(project.latestProgress, 160),
          })),
      })),
    })),
  }, null, 2);
}

function buildGlobalProfilePrompt(input: LlmGlobalProfileInput): string {
  return JSON.stringify({
    existing_profile: truncateForPrompt(input.existingProfile, 320),
    new_l1: {
      summary: truncateForPrompt(input.l1.summary, 220),
      situation_time_info: truncateForPrompt(input.l1.situationTimeInfo, 160),
      facts: input.l1.facts.map((fact) => ({
        key: fact.factKey,
        value: truncateForPrompt(fact.factValue, 140),
        confidence: fact.confidence,
      })).slice(0, 16),
      projects: input.l1.projectDetails.map((project) => ({
        name: project.name,
        status: project.status,
        summary: truncateForPrompt(project.summary, 140),
      })).slice(0, 8),
    },
  }, null, 2);
}

function buildHop1RoutePrompt(input: LlmMemoryRouteInput): string {
  return JSON.stringify({
    query: input.query,
    global_profile: input.profile
      ? {
          id: input.profile.recordId,
          text: truncateForPrompt(input.profile.profileText, 140),
        }
      : null,
  }, null, 2);
}

function buildHop2L2Prompt(input: LlmHop2L2Input): string {
  return JSON.stringify({
    query: input.query,
    global_profile: input.profile
      ? {
          id: input.profile.recordId,
          text: truncateForPrompt(input.profile.profileText, 220),
        }
      : null,
    lookup_queries: input.lookupQueries.map((entry) => ({
      target_types: entry.targetTypes,
      lookup_query: truncateForPrompt(entry.lookupQuery, 120),
    })),
    catalog_truncated: Boolean(input.catalogTruncated),
    l2_entries: input.l2Entries.map((item) => ({
      id: item.id,
      type: item.type,
      label: item.label,
      lookup_keys: item.lookupKeys.map((value) => truncateForPrompt(value, 80)).slice(0, 6),
      compressed_content: truncateForPrompt(item.compressedContent, 140),
    })),
  }, null, 2);
}

function buildHop3L1Prompt(input: LlmHop3L1Input): string {
  return JSON.stringify({
    query: input.query,
    global_profile: input.profile
      ? {
          id: input.profile.recordId,
          text: truncateForPrompt(input.profile.profileText, 220),
        }
      : null,
    selected_l2_entries: input.selectedL2Entries.map((item) => ({
      id: item.id,
      type: item.type,
      label: item.label,
      lookup_keys: item.lookupKeys.map((value) => truncateForPrompt(value, 80)).slice(0, 6),
      compressed_content: truncateForPrompt(item.compressedContent, 220),
    })),
    l1_windows: input.l1Windows.map((item) => ({
      id: item.l1IndexId,
      session_key: item.sessionKey,
      time_period: item.timePeriod,
      summary: truncateForPrompt(item.summary, 180),
      situation: truncateForPrompt(item.situationTimeInfo, 160),
      projects: item.projectDetails.map((project) => project.name).slice(0, 6),
    })),
  }, null, 2);
}

function buildHop4L0Prompt(input: LlmHop4L0Input): string {
  return JSON.stringify({
    query: input.query,
    selected_l2_entries: input.selectedL2Entries.map((item) => ({
      id: item.id,
      type: item.type,
      label: item.label,
      lookup_keys: item.lookupKeys.map((value) => truncateForPrompt(value, 80)).slice(0, 6),
      compressed_content: truncateForPrompt(item.compressedContent, 220),
    })),
    selected_l1_windows: input.selectedL1Windows.map((item) => ({
      id: item.l1IndexId,
      session_key: item.sessionKey,
      time_period: item.timePeriod,
      summary: truncateForPrompt(item.summary, 180),
      situation: truncateForPrompt(item.situationTimeInfo, 160),
      projects: item.projectDetails.map((project) => project.name).slice(0, 6),
    })),
    l0_sessions: input.l0Sessions.map((item) => ({
      id: item.l0IndexId,
      session_key: item.sessionKey,
      timestamp: item.timestamp,
      messages: item.messages.slice(-8).map((message) => ({
        role: message.role,
        content: truncateForPrompt(message.content, 220),
      })),
    })),
  }, null, 2);
}

function extractFirstJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty extraction response");
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;

  const start = trimmed.indexOf("{");
  if (start < 0) throw new Error("No JSON object found in extraction response");

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < trimmed.length; index += 1) {
    const char = trimmed[index]!;
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return trimmed.slice(start, index + 1);
    }
  }

  throw new Error("Incomplete JSON object in extraction response");
}

function slugifyKeyPart(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "item";
}

function clampConfidence(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function normalizeStatus(value: unknown): ProjectStatus {
  if (typeof value !== "string") return "planned";
  const normalized = value.trim().toLowerCase();
  if (normalized === "planned") return "planned";
  if (normalized === "in_progress" || normalized === "in progress") return "in_progress";
  if (normalized === "blocked") return "in_progress";
  if (normalized === "on_hold" || normalized === "on hold") return "in_progress";
  if (normalized === "unknown") return "planned";
  if (normalized === "done" || normalized === "completed" || normalized === "complete") return "done";
  return "planned";
}

function buildFallbackSituationTimeInfo(timestamp: string, summary: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return summary;
  const yyyyMmDd = date.toISOString().slice(0, 10);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${yyyyMmDd} ${hour}:${minute} ${summary}`.trim();
}

function normalizeFacts(items: unknown): FactCandidate[] {
  if (!Array.isArray(items)) return [];
  const facts = new Map<string, FactCandidate>();

  for (const item of items) {
    const raw = item as RawFactItem;
    const category = typeof raw.category === "string" ? slugifyKeyPart(raw.category) : "context";
    const subject = typeof raw.subject === "string" && raw.subject.trim()
      ? slugifyKeyPart(raw.subject)
      : slugifyKeyPart(typeof raw.value === "string" ? raw.value : "item");
    const value = typeof raw.value === "string" ? normalizeWhitespace(raw.value) : "";
    if (!value) continue;
    const factKey = `${category}:${subject}`;
    facts.set(factKey, {
      factKey,
      factValue: truncate(value, 180),
      confidence: clampConfidence(raw.confidence, 0.65),
    });
  }

  return Array.from(facts.values()).slice(0, 12);
}

function normalizeProjectDetails(items: unknown): ProjectDetail[] {
  if (!Array.isArray(items)) return [];
  const projects = new Map<string, ProjectDetail>();

  for (const item of items) {
    const raw = item as RawProjectItem;
    const key = typeof raw.key === "string" && raw.key.trim()
      ? slugifyKeyPart(raw.key)
      : "";
    const name = typeof raw.name === "string" ? normalizeWhitespace(raw.name) : "";
    if (!name) continue;
    const stableKey = key || slugifyKeyPart(name);
    if (projects.has(stableKey)) continue;
    projects.set(stableKey, {
      key: stableKey,
      name: truncate(name, 80),
      status: normalizeStatus(raw.status),
      summary: truncate(typeof raw.summary === "string" ? normalizeWhitespace(raw.summary) : "", 360),
      latestProgress: truncate(typeof raw.latest_progress === "string" ? normalizeWhitespace(raw.latest_progress) : "", 220),
      confidence: clampConfidence(raw.confidence, 0.7),
    });
  }

  return Array.from(projects.values()).slice(0, 8);
}

function truncateForPrompt(value: string, maxLength: number): string {
  return truncate(normalizeWhitespace(value), maxLength);
}

function normalizeStringArray(items: unknown, maxItems: number): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function normalizeIntent(value: unknown): IntentType {
  if (value === "time" || value === "project" || value === "fact" || value === "general") return value;
  return "general";
}

function normalizeEnoughAt(value: unknown): RetrievalResult["enoughAt"] {
  if (value === "l2" || value === "l1" || value === "l0" || value === "none") return value;
  return "none";
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

function normalizeLookupTargetTypes(value: unknown): LookupTargetType[] {
  if (!Array.isArray(value)) return [];
  return uniqueById(
    value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item): item is LookupTargetType => item === "time" || item === "project"),
    (item) => item,
  );
}

function normalizeLookupQueries(value: unknown, defaultQuery: string, maxItems = 4): LookupQuerySpec[] {
  if (!Array.isArray(value)) {
    return [{
      targetTypes: ["time", "project"],
      lookupQuery: defaultQuery,
    }];
  }
  const normalized = value
    .filter(isRecord)
    .map((item) => {
      const targetTypes = normalizeLookupTargetTypes(item.target_types);
      const lookupQuery = typeof item.lookup_query === "string"
        ? truncateForPrompt(item.lookup_query, 120)
        : "";
      if (targetTypes.length === 0 || !lookupQuery) return undefined;
      return {
        targetTypes,
        lookupQuery,
      };
    })
    .filter((item): item is LookupQuerySpec => Boolean(item));
  if (normalized.length > 0) return normalized.slice(0, maxItems);
  return [{
    targetTypes: ["time", "project"],
    lookupQuery: defaultQuery,
  }];
}

function uniqueById<T>(items: T[], getId: (item: T) => string): T[] {
  const seen = new Set<string>();
  const next: T[] = [];
  for (const item of items) {
    const id = getId(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    next.push(item);
  }
  return next;
}

function extractChatCompletionsText(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.choices)) {
    throw new Error("Invalid chat completions payload");
  }
  const firstChoice = payload.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    throw new Error("Missing chat completion message");
  }
  const content = firstChoice.message.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (isRecord(item) && typeof item.text === "string" ? item.text : ""))
      .filter(Boolean)
      .join("\n");
  }
  throw new Error("Unsupported chat completion content shape");
}

function extractResponsesText(payload: unknown): string {
  if (!isRecord(payload)) throw new Error("Invalid responses payload");
  if (typeof payload.output_text === "string" && payload.output_text.trim()) return payload.output_text;
  if (!Array.isArray(payload.output)) throw new Error("Responses payload missing output");

  const chunks: string[] = [];
  for (const item of payload.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (isRecord(part) && typeof part.text === "string") chunks.push(part.text);
    }
  }
  const text = chunks.join("\n").trim();
  if (!text) throw new Error("Responses payload did not contain text");
  return text;
}

function looksLikeEnvVarName(value: string): boolean {
  return /^[A-Z0-9_]+$/.test(value);
}

export class LlmMemoryExtractor {
  constructor(
    private readonly config: Record<string, unknown>,
    private readonly runtime: Record<string, unknown> | undefined,
    private readonly logger?: LoggerLike,
  ) {}

  private resolveSelection(agentId?: string): ModelSelection {
    const modelRef = resolveAgentPrimaryModel(this.config, agentId);
    const parsed = parseModelRef(modelRef, this.config);
    if (!parsed) throw new Error("Could not resolve an OpenClaw model for memory extraction");

    const modelsConfig = isRecord(this.config.models) ? this.config.models : undefined;
    const providers = modelsConfig && isRecord(modelsConfig.providers) ? modelsConfig.providers : undefined;
    const providerConfig = providers && isRecord(providers[parsed.provider])
      ? providers[parsed.provider] as Record<string, unknown>
      : undefined;
    const configuredModel = Array.isArray(providerConfig?.models)
      ? providerConfig.models.find((item) => isRecord(item) && item.id === parsed.model)
      : undefined;
    const modelConfig = isRecord(configuredModel) ? configuredModel : undefined;

    const api = typeof modelConfig?.api === "string"
      ? modelConfig.api
      : typeof providerConfig?.api === "string"
        ? providerConfig.api
        : "openai-completions";
    const baseUrl = typeof modelConfig?.baseUrl === "string"
      ? modelConfig.baseUrl
      : typeof providerConfig?.baseUrl === "string"
        ? providerConfig.baseUrl
        : undefined;
    const headers = {
      ...sanitizeHeaders(providerConfig?.headers),
      ...sanitizeHeaders(modelConfig?.headers),
    };

    const selection: ModelSelection = {
      provider: parsed.provider,
      model: parsed.model,
      api,
    };
    if (baseUrl?.trim()) selection.baseUrl = stripTrailingSlash(baseUrl.trim());
    if (Object.keys(headers).length > 0) selection.headers = headers;
    return selection;
  }

  private async resolveApiKey(provider: string): Promise<string> {
    const modelsConfig = isRecord(this.config.models) ? this.config.models : undefined;
    const providers = modelsConfig && isRecord(modelsConfig.providers) ? modelsConfig.providers : undefined;
    const providerConfig = providers && isRecord(providers[provider])
      ? providers[provider] as Record<string, unknown>
      : undefined;
    const configured = typeof providerConfig?.apiKey === "string" ? providerConfig.apiKey.trim() : "";
    if (configured) {
      if (looksLikeEnvVarName(configured) && typeof process.env[configured] === "string" && process.env[configured]?.trim()) {
        return process.env[configured]!.trim();
      }
      return configured;
    }

    const modelAuth = this.runtime && isRecord(this.runtime.modelAuth)
      ? this.runtime.modelAuth as Record<string, unknown>
      : undefined;
    const resolver = typeof modelAuth?.resolveApiKeyForProvider === "function"
      ? modelAuth.resolveApiKeyForProvider as (params: { provider: string; cfg?: Record<string, unknown> }) => Promise<{ apiKey?: string }>
      : undefined;
    if (resolver) {
      const auth = await resolver({ provider, cfg: this.config });
      if (auth?.apiKey && String(auth.apiKey).trim()) {
        return String(auth.apiKey).trim();
      }
    }

    throw new Error(`No API key resolved for extraction provider "${provider}"`);
  }

  private async callStructuredJson(input: {
    systemPrompt: string;
    userPrompt: string;
    agentId?: string;
    requestLabel: string;
    timeoutMs?: number;
  }): Promise<string> {
    const selection = this.resolveSelection(input.agentId);
    if (!selection.baseUrl) {
      throw new Error(`${input.requestLabel} provider "${selection.provider}" does not have a baseUrl`);
    }
    const apiKey = await this.resolveApiKey(selection.provider);
    const headers = new Headers(selection.headers);
    if (!headers.has("content-type")) headers.set("content-type", "application/json");
    if (!headers.has("authorization")) headers.set("authorization", `Bearer ${apiKey}`);
    const apiType = selection.api.trim().toLowerCase();
    let url = "";
    let body: Record<string, unknown>;

    if (apiType === "openai-responses" || apiType === "responses") {
      url = `${selection.baseUrl}/responses`;
      body = {
        model: selection.model,
        temperature: 0,
        input: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
      };
    } else {
      url = `${selection.baseUrl}/chat/completions`;
      body = {
        model: selection.model,
        temperature: 0,
        stream: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
      };
    }

    const execute = async (payloadBody: Record<string, unknown>): Promise<Response> => {
      const controller = new AbortController();
      const timeoutMs = resolveRequestTimeoutMs(input.timeoutMs);
      const timeoutId = timeoutMs === null ? null : setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payloadBody),
          signal: controller.signal,
        });
      } catch (error) {
        if (timeoutMs !== null && error instanceof Error && error.name === "AbortError") {
          throw new Error(`${input.requestLabel} request timed out after ${timeoutMs}ms`);
        }
        throw error;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    let response = await execute(body);
    if (!response.ok && "response_format" in body) {
      const fallbackBody = { ...body };
      delete fallbackBody.response_format;
      response = await execute(fallbackBody);
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${input.requestLabel} request failed (${response.status}): ${truncate(errorText, 300)}`);
    }

    const payload = await response.json();
    return apiType === "openai-responses" || apiType === "responses"
      ? extractResponsesText(payload)
      : extractChatCompletionsText(payload);
  }

  async extract(input: { timestamp: string; messages: MemoryMessage[]; agentId?: string }): Promise<SessionExtractionResult> {
    let parsed: RawExtractionPayload | undefined;
    let lastError: unknown;
    for (const extraInstruction of [
      undefined,
      "Return one complete JSON object only. Do not use ellipses, placeholders, comments, markdown fences, or trailing commas.",
    ]) {
      try {
        const rawText = await this.callStructuredJson({
          systemPrompt: EXTRACTION_SYSTEM_PROMPT,
          userPrompt: buildPrompt(input.timestamp, input.messages, extraInstruction),
          requestLabel: "Extraction",
          timeoutMs: 20_000,
          ...(input.agentId ? { agentId: input.agentId } : {}),
        });
        parsed = JSON.parse(extractFirstJsonObject(rawText)) as RawExtractionPayload;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!parsed) throw lastError;
    const summary = truncate(
      typeof parsed.summary === "string" ? normalizeWhitespace(parsed.summary) : "",
      280,
    );
    if (!summary) {
      throw new Error("Extraction payload did not include a usable summary");
    }

    let projectDetails = normalizeProjectDetails(parsed.projects);
    const facts = normalizeFacts(parsed.facts);
    projectDetails = await this.completeProjectDetails({
      timestamp: input.timestamp,
      messages: input.messages,
      summary,
      facts,
      projectDetails,
      ...(input.agentId ? { agentId: input.agentId } : {}),
    });
    const situationTimeInfoRaw = typeof parsed.situation_time_info === "string"
      ? normalizeWhitespace(parsed.situation_time_info)
      : "";
    const situationTimeInfo = truncate(
      situationTimeInfoRaw || buildFallbackSituationTimeInfo(input.timestamp, summary),
      220,
    );

    this.logger?.info?.(
      `[clawxmemory] llm extraction complete summary=${summary.slice(0, 60)} projects=${projectDetails.length} facts=${facts.length}`,
    );

    return {
      summary,
      situationTimeInfo,
      facts,
      projectDetails,
    };
  }

  private async completeProjectDetails(input: {
    timestamp: string;
    messages: MemoryMessage[];
    summary: string;
    facts: FactCandidate[];
    projectDetails: ProjectDetail[];
    agentId?: string;
  }): Promise<ProjectDetail[]> {
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: PROJECT_COMPLETION_SYSTEM_PROMPT,
        userPrompt: buildProjectCompletionPrompt(input),
        requestLabel: "Project completion",
        timeoutMs: 20_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawExtractionPayload;
      const completed = normalizeProjectDetails(parsed.projects);
      return completed.length > 0 ? completed : input.projectDetails;
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] project completion fallback: ${String(error)}`);
      return input.projectDetails;
    }
  }

  async judgeTopicShift(input: LlmTopicShiftInput): Promise<LlmTopicShiftDecision> {
    const fallbackSummary = truncate(
      normalizeWhitespace(
        input.currentTopicSummary
          || input.incomingUserTurns[input.incomingUserTurns.length - 1]
          || input.recentUserTurns[input.recentUserTurns.length - 1]
          || "当前话题",
      ),
      120,
    );
    if (input.incomingUserTurns.length === 0) {
      return { topicChanged: false, topicSummary: fallbackSummary };
    }
    if (!input.currentTopicSummary.trim() && input.recentUserTurns.length === 0) {
      return {
        topicChanged: false,
        topicSummary: truncate(input.incomingUserTurns.map((item) => normalizeWhitespace(item)).join(" / "), 120) || fallbackSummary,
      };
    }

    try {
      const raw = await this.callStructuredJson({
        systemPrompt: TOPIC_BOUNDARY_SYSTEM_PROMPT,
        userPrompt: buildTopicShiftPrompt(input),
        requestLabel: "Topic shift",
        timeoutMs: 8_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawTopicShiftPayload;
      return {
        topicChanged: normalizeBoolean(parsed.topic_changed, false),
        topicSummary: truncate(
          typeof parsed.topic_summary === "string" && parsed.topic_summary.trim()
            ? normalizeWhitespace(parsed.topic_summary)
            : fallbackSummary,
          120,
        ),
      };
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] topic shift fallback: ${String(error)}`);
      return { topicChanged: false, topicSummary: fallbackSummary };
    }
  }

  async resolveProjectIdentity(input: LlmProjectResolutionInput): Promise<ProjectDetail> {
    if (input.existingProjects.length === 0) return input.project;
    const candidates = input.existingProjects.slice(0, 24).map((project) => ({
      project_key: project.projectKey,
      project_name: project.projectName,
      summary: truncateForPrompt(project.summary, 160),
      latest_progress: truncateForPrompt(project.latestProgress, 160),
      status: project.currentStatus,
    }));
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: PROJECT_RESOLUTION_SYSTEM_PROMPT,
        userPrompt: JSON.stringify({
          incoming_project: {
            key: input.project.key,
            name: input.project.name,
            summary: input.project.summary,
            latest_progress: input.project.latestProgress,
            status: input.project.status,
          },
          existing_projects: candidates,
        }, null, 2),
        requestLabel: "Project resolution",
        timeoutMs: 15_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawProjectResolutionPayload;
      const matchedProjectKey = typeof parsed.matched_project_key === "string"
        ? parsed.matched_project_key.trim()
        : "";
      const matched = matchedProjectKey
        ? input.existingProjects.find((project) => project.projectKey === matchedProjectKey)
        : undefined;
      return {
        ...input.project,
        key: matched?.projectKey
          ?? (typeof parsed.canonical_key === "string" && parsed.canonical_key.trim()
            ? slugifyKeyPart(parsed.canonical_key)
            : input.project.key),
        name: matched?.projectName
          ?? (typeof parsed.canonical_name === "string" && parsed.canonical_name.trim()
            ? truncateForPrompt(parsed.canonical_name, 80)
            : input.project.name),
      };
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] project resolution fallback for ${input.project.key}: ${String(error)}`);
      return input.project;
    }
  }

  async resolveProjectIdentities(input: LlmProjectBatchResolutionInput): Promise<ProjectDetail[]> {
    if (input.projects.length === 0 || input.existingProjects.length === 0) return input.projects;
    const candidates = input.existingProjects.slice(0, 40).map((project) => ({
      project_key: project.projectKey,
      project_name: project.projectName,
      summary: truncateForPrompt(project.summary, 140),
      latest_progress: truncateForPrompt(project.latestProgress, 140),
      status: project.currentStatus,
    }));
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: PROJECT_BATCH_RESOLUTION_SYSTEM_PROMPT,
        userPrompt: JSON.stringify({
          incoming_projects: input.projects.map((project) => ({
            incoming_key: project.key,
            key: project.key,
            name: project.name,
            summary: truncateForPrompt(project.summary, 160),
            latest_progress: truncateForPrompt(project.latestProgress, 160),
            status: project.status,
          })),
          existing_projects: candidates,
        }, null, 2),
        requestLabel: "Project batch resolution",
        timeoutMs: 15_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawProjectBatchResolutionPayload;
      const resolutions = Array.isArray(parsed.projects) ? parsed.projects : [];
      const byIncomingKey = new Map<string, { matched?: string; canonicalKey?: string; canonicalName?: string }>();
      for (const item of resolutions) {
        if (!isRecord(item) || typeof item.incoming_key !== "string") continue;
        const normalized: { matched?: string; canonicalKey?: string; canonicalName?: string } = {};
        if (typeof item.matched_project_key === "string" && item.matched_project_key.trim()) {
          normalized.matched = item.matched_project_key.trim();
        }
        if (typeof item.canonical_key === "string" && item.canonical_key.trim()) {
          normalized.canonicalKey = item.canonical_key.trim();
        }
        if (typeof item.canonical_name === "string" && item.canonical_name.trim()) {
          normalized.canonicalName = item.canonical_name.trim();
        }
        byIncomingKey.set(item.incoming_key.trim(), normalized);
      }

      return input.projects.map((project) => {
        const resolution = byIncomingKey.get(project.key);
        const matched = resolution?.matched
          ? input.existingProjects.find((existing) => existing.projectKey === resolution.matched)
          : undefined;
        return {
          ...project,
          key: matched?.projectKey
            ?? (resolution?.canonicalKey ? slugifyKeyPart(resolution.canonicalKey) : project.key),
          name: matched?.projectName
            ?? (resolution?.canonicalName ? truncateForPrompt(resolution.canonicalName, 80) : project.name),
        };
      });
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] project batch resolution fallback: ${String(error)}`);
      return input.projects;
    }
  }

  async rewriteDailyTimeSummary(input: LlmDailyTimeSummaryInput): Promise<string> {
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: DAILY_TIME_SUMMARY_SYSTEM_PROMPT,
        userPrompt: buildDailyTimeSummaryPrompt(input),
        requestLabel: "Daily summary",
        timeoutMs: 15_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawDailySummaryPayload;
      const summary = typeof parsed.summary === "string" ? normalizeWhitespace(parsed.summary) : "";
      if (summary) return truncate(summary, 280);
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] daily summary fallback: ${String(error)}`);
    }
    return truncate(input.l1.situationTimeInfo || input.l1.summary || input.existingSummary, 280);
  }

  async rewriteProjectMemories(input: LlmProjectMemoryRewriteInput): Promise<ProjectDetail[]> {
    if (input.projects.length === 0) return [];

    const fallbackProjects = input.projects.map((item) => item.incomingProject);
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: PROJECT_MEMORY_REWRITE_SYSTEM_PROMPT,
        userPrompt: buildProjectMemoryRewritePrompt(input),
        requestLabel: "Project memory rewrite",
        timeoutMs: 20_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawExtractionPayload;
      const rewritten = normalizeProjectDetails(parsed.projects);
      if (rewritten.length === 0) throw new Error("Project memory rewrite returned no projects");

      const rewrittenByKey = new Map(rewritten.map((project) => [project.key, project]));
      return fallbackProjects.map((project) => {
        const next = rewrittenByKey.get(project.key);
        if (!next) return project;
        return {
          ...project,
          name: next.name || project.name,
          status: next.status,
          summary: next.summary || project.summary,
          latestProgress: next.latestProgress || project.latestProgress,
          confidence: Math.max(project.confidence, next.confidence),
        };
      });
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] project memory rewrite fallback: ${String(error)}`);
      throw error;
    }
  }

  async rewriteGlobalProfile(input: LlmGlobalProfileInput): Promise<string> {
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: GLOBAL_PROFILE_SYSTEM_PROMPT,
        userPrompt: buildGlobalProfilePrompt(input),
        requestLabel: "Global profile",
        timeoutMs: 15_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawProfilePayload;
      const profileText = typeof parsed.profile_text === "string" ? normalizeWhitespace(parsed.profile_text) : "";
      if (profileText) return truncate(profileText, 420);
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] global profile fallback: ${String(error)}`);
    }

    const fallbackFacts = input.l1.facts.map((fact) => fact.factValue).filter(Boolean).slice(0, 8).join("；");
    return truncate(input.existingProfile || fallbackFacts || input.l1.summary, 420);
  }

  async decideMemoryLookup(input: LlmMemoryRouteInput): Promise<Hop1LookupDecision> {
    const defaultQuery = truncateForPrompt(input.query, 120);
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: HOP1_LOOKUP_SYSTEM_PROMPT,
        userPrompt: buildHop1RoutePrompt(input),
        requestLabel: "Hop1 lookup",
        timeoutMs: input.timeoutMs ?? 4_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawHop1RoutePayload;
      const baseOnly = normalizeBoolean(parsed.base_only, false);
      return {
        memoryRelevant: normalizeBoolean(parsed.memory_relevant, true),
        baseOnly,
        lookupQueries: baseOnly ? [] : normalizeLookupQueries(parsed.lookup_queries, defaultQuery),
      };
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] hop1 lookup fallback: ${String(error)}`);
      return {
        memoryRelevant: true,
        baseOnly: false,
        lookupQueries: [{
          targetTypes: ["time", "project"],
          lookupQuery: defaultQuery,
        }],
      };
    }
  }

  private async runL2SelectionOnce(input: LlmHop2L2Input): Promise<Hop2L2Decision> {
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: HOP2_L2_SYSTEM_PROMPT,
        userPrompt: buildHop2L2Prompt(input),
        requestLabel: "Hop2 L2 selection",
        timeoutMs: input.timeoutMs ?? 5_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawHop2L2Payload;
      const enoughAt = parsed.enough_at === "l2" || parsed.enough_at === "descend_l1" || parsed.enough_at === "none"
        ? parsed.enough_at
        : "none";
      return {
        intent: normalizeIntent(parsed.intent),
        selectedL2Ids: normalizeStringArray(parsed.selected_l2_ids, input.l2Entries.length),
        enoughAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async selectL2FromCatalog(input: LlmHop2L2Input): Promise<Hop2L2Decision> {
    if (input.l2Entries.length === 0) {
      return {
        intent: input.profile ? "fact" : "general",
        selectedL2Ids: [],
        enoughAt: "none",
      };
    }
    try {
      return await this.runL2SelectionOnce(input);
    } catch (error) {
      const hasTime = input.l2Entries.some((entry) => entry.type === "time");
      const hasProject = input.l2Entries.some((entry) => entry.type === "project");
      if (hasTime && hasProject && !isTimeoutError(error)) {
        try {
          const baseTimeoutMs = typeof input.timeoutMs === "number" && Number.isFinite(input.timeoutMs)
            ? input.timeoutMs
            : 5_000;
          const splitTimeoutMs = baseTimeoutMs > 0
            ? Math.min(baseTimeoutMs, Math.max(300, Math.floor(baseTimeoutMs / 2)))
            : 0;
          const [timeDecision, projectDecision] = await Promise.all([
            this.runL2SelectionOnce({
              ...input,
              l2Entries: input.l2Entries.filter((entry) => entry.type === "time"),
              timeoutMs: splitTimeoutMs,
            }),
            this.runL2SelectionOnce({
              ...input,
              l2Entries: input.l2Entries.filter((entry) => entry.type === "project"),
              timeoutMs: splitTimeoutMs,
            }),
          ]);
          const selectedL2Ids = normalizeStringArray(
            [...timeDecision.selectedL2Ids, ...projectDecision.selectedL2Ids],
            input.l2Entries.length,
          );
          const enoughAt = timeDecision.enoughAt === "descend_l1" || projectDecision.enoughAt === "descend_l1"
            ? "descend_l1"
            : selectedL2Ids.length > 0 && (timeDecision.enoughAt === "l2" || projectDecision.enoughAt === "l2")
              ? "l2"
              : "none";
          const intent = selectedL2Ids.length > 0 && timeDecision.selectedL2Ids.length > 0 && projectDecision.selectedL2Ids.length > 0
            ? "general"
            : timeDecision.selectedL2Ids.length > 0
              ? timeDecision.intent
              : projectDecision.selectedL2Ids.length > 0
                ? projectDecision.intent
                : input.profile ? "fact" : "general";
          return {
            intent,
            selectedL2Ids,
            enoughAt,
          };
        } catch (splitError) {
          this.logger?.warn?.(`[clawxmemory] hop2 l2 split fallback failed: ${String(splitError)}`);
        }
      }
      this.logger?.warn?.(`[clawxmemory] hop2 l2 fallback: ${String(error)}`);
      return {
        intent: input.profile ? "fact" : "general",
        selectedL2Ids: [],
        enoughAt: "none",
      };
    }
  }

  async selectL1FromEvidence(input: LlmHop3L1Input): Promise<Hop3L1Decision> {
    if (input.l1Windows.length === 0) {
      return {
        useProfile: Boolean(input.profile?.profileText.trim()),
        selectedL1Ids: [],
        enoughAt: "none",
      };
    }
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: HOP3_L1_SYSTEM_PROMPT,
        userPrompt: buildHop3L1Prompt(input),
        requestLabel: "Hop3 L1 selection",
        timeoutMs: input.timeoutMs ?? 5_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawHop3L1Payload;
      const enoughAt = parsed.enough_at === "l1" || parsed.enough_at === "descend_l0" || parsed.enough_at === "none"
        ? parsed.enough_at
        : "none";
      return {
        useProfile: normalizeBoolean(parsed.use_profile, Boolean(input.profile?.profileText.trim())),
        selectedL1Ids: normalizeStringArray(parsed.selected_l1_ids, input.l1Windows.length),
        enoughAt,
      };
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] hop3 l1 fallback: ${String(error)}`);
      return {
        useProfile: Boolean(input.profile?.profileText.trim()),
        selectedL1Ids: [],
        enoughAt: "none",
      };
    }
  }

  async selectL0FromEvidence(input: LlmHop4L0Input): Promise<Hop4L0Decision> {
    if (input.l0Sessions.length === 0) {
      return {
        selectedL0Ids: [],
        enoughAt: "none",
      };
    }
    try {
      const raw = await this.callStructuredJson({
        systemPrompt: HOP4_L0_SYSTEM_PROMPT,
        userPrompt: buildHop4L0Prompt(input),
        requestLabel: "Hop4 L0 selection",
        timeoutMs: input.timeoutMs ?? 5_000,
        ...(input.agentId ? { agentId: input.agentId } : {}),
      });
      const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawHop4L0Payload;
      const enoughAt = parsed.enough_at === "l0" || parsed.enough_at === "none"
        ? parsed.enough_at
        : "none";
      return {
        selectedL0Ids: normalizeStringArray(parsed.selected_l0_ids, input.l0Sessions.length),
        enoughAt,
      };
    } catch (error) {
      this.logger?.warn?.(`[clawxmemory] hop4 l0 fallback: ${String(error)}`);
      return {
        selectedL0Ids: [],
        enoughAt: "none",
      };
    }
  }

  async reasonOverMemory(input: LlmReasoningInput): Promise<LlmReasoningSelection> {
    if (!input.profile && input.l2Time.length === 0 && input.l2Projects.length === 0 && input.l1Windows.length === 0 && input.l0Sessions.length === 0) {
      return {
        intent: "general",
        enoughAt: "none",
        useProfile: false,
        l2Ids: [],
        l1Ids: [],
        l0Ids: [],
      };
    }

    const raw = await this.callStructuredJson({
      systemPrompt: REASONING_SYSTEM_PROMPT,
      userPrompt: JSON.stringify({
        query: input.query,
        profile: input.profile
          ? {
              id: input.profile.recordId,
              text: truncateForPrompt(input.profile.profileText, 260),
            }
          : null,
        l2_time: input.l2Time.map((item) => ({
          id: item.l2IndexId,
          date_key: item.dateKey,
          summary: truncateForPrompt(item.summary, 180),
        })),
        l2_project: input.l2Projects.map((item) => ({
          id: item.l2IndexId,
          project_key: item.projectKey,
          project_name: item.projectName,
          summary: truncateForPrompt(item.summary, 180),
          latest_progress: truncateForPrompt(item.latestProgress, 180),
          status: item.currentStatus,
        })),
        l1_windows: input.l1Windows.map((item) => ({
          id: item.l1IndexId,
          session_key: item.sessionKey,
          time_period: item.timePeriod,
          summary: truncateForPrompt(item.summary, 180),
          situation: truncateForPrompt(item.situationTimeInfo, 160),
          projects: item.projectDetails.map((project) => project.name),
        })),
        l0_sessions: input.l0Sessions.map((item) => ({
          id: item.l0IndexId,
          session_key: item.sessionKey,
          timestamp: item.timestamp,
          messages: item.messages
            .filter((message) => message.role === "user")
            .slice(-2)
            .map((message) => truncateForPrompt(message.content, 160)),
        })),
        limits: input.limits,
      }, null, 2),
      requestLabel: "Reasoning",
      timeoutMs: input.timeoutMs ?? 8_000,
      ...(input.agentId ? { agentId: input.agentId } : {}),
    });
    const parsed = JSON.parse(extractFirstJsonObject(raw)) as RawReasoningPayload;
    return {
      intent: normalizeIntent(parsed.intent),
      enoughAt: normalizeEnoughAt(parsed.enough_at),
      useProfile: normalizeBoolean(parsed.use_profile, false),
      l2Ids: normalizeStringArray(parsed.l2_ids, input.limits.l2),
      l1Ids: normalizeStringArray(parsed.l1_ids, input.limits.l1),
      l0Ids: normalizeStringArray(parsed.l0_ids, input.limits.l0),
    };
  }
}
