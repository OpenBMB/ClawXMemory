export type ChatRole = "user" | "assistant" | "system" | string;

export interface MemoryMessage {
  msgId?: string;
  role: ChatRole;
  content: string;
}

export interface L0SessionRecord {
  l0IndexId: string;
  sessionKey: string;
  timestamp: string;
  messages: MemoryMessage[];
  source: string;
  indexed: boolean;
  createdAt: string;
}

export interface FactCandidate {
  factKey: string;
  factValue: string;
  confidence: number;
}

export type ProjectStatus = "planned" | "in_progress" | "done";
export type ReasoningMode = "answer_first" | "accuracy_first";

export interface IndexingSettings {
  reasoningMode: ReasoningMode;
  maxAutoReplyLatencyMs: number;
}

export interface ActiveTopicBufferRecord {
  sessionKey: string;
  startedAt: string;
  updatedAt: string;
  topicSummary: string;
  userTurns: string[];
  l0Ids: string[];
  lastL0Id: string;
  createdAt: string;
}

export interface ProjectDetail {
  key: string;
  name: string;
  status: ProjectStatus;
  summary: string;
  latestProgress: string;
  confidence: number;
}

export interface L1WindowRecord {
  l1IndexId: string;
  sessionKey: string;
  timePeriod: string;
  startedAt: string;
  endedAt: string;
  summary: string;
  facts: FactCandidate[];
  situationTimeInfo: string;
  projectTags: string[];
  projectDetails: ProjectDetail[];
  l0Source: string[];
  createdAt: string;
}

export interface L2TimeIndexRecord {
  l2IndexId: string;
  dateKey: string;
  summary: string;
  l1Source: string[];
  createdAt: string;
  updatedAt: string;
}

export interface L2ProjectIndexRecord {
  l2IndexId: string;
  projectKey: string;
  projectName: string;
  summary: string;
  currentStatus: ProjectStatus;
  latestProgress: string;
  l1Source: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GlobalProfileRecord {
  recordId: "global_profile_record";
  profileText: string;
  sourceL1Ids: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IndexLinkRecord {
  linkId: string;
  fromLevel: "l2" | "l1" | "l0";
  fromId: string;
  toLevel: "l2" | "l1" | "l0";
  toId: string;
  createdAt: string;
}

export const MEMORY_EXPORT_FORMAT_VERSION = "clawxmemory-memory-bundle.v1" as const;

export interface MemoryExportBundle {
  formatVersion: typeof MEMORY_EXPORT_FORMAT_VERSION;
  exportedAt: string;
  lastIndexedAt?: string;
  l0Sessions: L0SessionRecord[];
  l1Windows: L1WindowRecord[];
  l2TimeIndexes: L2TimeIndexRecord[];
  l2ProjectIndexes: L2ProjectIndexRecord[];
  globalProfile: GlobalProfileRecord;
  indexLinks: IndexLinkRecord[];
}

export interface MemoryTransferCounts {
  l0: number;
  l1: number;
  l2Time: number;
  l2Project: number;
  profile: number;
  links: number;
}

export interface MemoryImportResult {
  formatVersion: typeof MEMORY_EXPORT_FORMAT_VERSION;
  imported: MemoryTransferCounts;
  importedAt: string;
  lastIndexedAt?: string;
}

export type IntentType = "time" | "project" | "fact" | "general";

export type L2SearchResult =
  | {
      score: number;
      level: "l2_time";
      item: L2TimeIndexRecord;
    }
  | {
      score: number;
      level: "l2_project";
      item: L2ProjectIndexRecord;
    };

export interface L1SearchResult {
  score: number;
  item: L1WindowRecord;
}

export interface L0SearchResult {
  score: number;
  item: L0SessionRecord;
}

export interface RetrievalResult {
  query: string;
  intent: IntentType;
  enoughAt: "profile" | "l2" | "l1" | "l0" | "none";
  profile: GlobalProfileRecord | null;
  l2Results: L2SearchResult[];
  l1Results: L1SearchResult[];
  l0Results: L0SearchResult[];
  context: string;
  debug?: {
    mode: "llm" | "local_fallback" | "none";
    elapsedMs: number;
    cacheHit: boolean;
    path?: "auto" | "explicit" | "shadow";
    budgetLimited?: boolean;
    shadowDeepQueued?: boolean;
    hop1BaseOnly?: boolean;
    hop1LookupQueries?: Array<{
      targetTypes: Array<"time" | "project">;
      lookupQuery: string;
    }>;
    hop2EnoughAt?: "l2" | "descend_l1" | "none";
    hop2SelectedL2Ids?: string[];
    hop3EnoughAt?: "l1" | "descend_l0" | "none";
    hop3SelectedL1Ids?: string[];
    hop4SelectedL0Ids?: string[];
    catalogTruncated?: boolean;
    corrections?: string[];
  };
}

export type RecallMode = "llm" | "local_fallback" | "none";
export type StartupRepairStatus = "idle" | "running" | "failed";

export interface DashboardOverview {
  totalL0: number;
  pendingL0: number;
  openTopics: number;
  totalL1: number;
  totalL2Time: number;
  totalL2Project: number;
  totalProfiles: number;
  queuedSessions: number;
  lastRecallMs: number;
  recallTimeouts: number;
  lastRecallMode: RecallMode;
  currentReasoningMode?: ReasoningMode;
  lastRecallPath?: "auto" | "explicit" | "shadow";
  lastRecallBudgetLimited?: boolean;
  lastShadowDeepQueued?: boolean;
  lastRecallInjected?: boolean;
  lastRecallEnoughAt?: RetrievalResult["enoughAt"];
  lastRecallCacheHit?: boolean;
  slotOwner?: string;
  dynamicMemoryRuntime?: string;
  workspaceBootstrapPresent?: boolean;
  memoryRuntimeHealthy?: boolean;
  runtimeIssues?: string[];
  lastIndexedAt?: string;
  startupRepairStatus?: StartupRepairStatus;
  startupRepairMessage?: string;
}

export interface MemoryUiSnapshot {
  overview: DashboardOverview;
  settings: IndexingSettings;
  recentTimeIndexes: L2TimeIndexRecord[];
  recentProjectIndexes: L2ProjectIndexRecord[];
  recentL1Windows: L1WindowRecord[];
  recentSessions: L0SessionRecord[];
  globalProfile: GlobalProfileRecord;
}
