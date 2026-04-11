export type ChatRole = "user" | "assistant" | "system" | string;

export interface MemoryMessage {
  msgId?: string;
  role: ChatRole;
  content: string;
}

export type MemoryRoute = "none" | "user" | "feedback" | "project" | "mixed";
export type MemoryRecordType = "user" | "feedback" | "project";
export type MemoryScope = "global" | "project";

export interface MemoryFileFrontmatter {
  name: string;
  description: string;
  type: MemoryRecordType;
  scope: MemoryScope;
  projectId?: string;
  updatedAt: string;
  capturedAt?: string;
  sourceSessionKey?: string;
  deprecated?: boolean;
  dreamAttempts?: number;
}

export interface MemoryManifestEntry extends MemoryFileFrontmatter {
  file: string;
  relativePath: string;
  absolutePath: string;
}

export interface MemoryFileRecord extends MemoryManifestEntry {
  content: string;
  preview: string;
}

export interface MemoryUserSummary {
  profile: string;
  preferences: string[];
  constraints: string[];
  relationships: string[];
  files: MemoryManifestEntry[];
}

export type ManagedWorkspaceFileName = "USER.md" | "MEMORY.md";
export type ManagedWorkspaceFileStateStatus = "isolated" | "restored" | "conflict";

export interface ManagedWorkspaceFileState {
  name: ManagedWorkspaceFileName;
  originalPath: string;
  managedPath: string;
  hash: string;
  isolatedAt: string;
  status: ManagedWorkspaceFileStateStatus;
  restoredAt?: string;
  conflictPath?: string;
}

export interface ManagedWorkspaceBoundaryState {
  version: 1;
  workspaceDir: string;
  updatedAt: string;
  lastAction: string;
  files: ManagedWorkspaceFileState[];
}

export type ManagedBoundaryStatus = "ready" | "isolated" | "conflict" | "warning";

export interface MemoryCandidate {
  type: MemoryRecordType;
  scope: MemoryScope;
  projectId?: string;
  name: string;
  description: string;
  capturedAt?: string;
  sourceSessionKey?: string;
  profile?: string;
  summary?: string;
  preferences?: string[];
  constraints?: string[];
  relationships?: string[];
  rule?: string;
  why?: string;
  howToApply?: string;
  stage?: string;
  decisions?: string[];
  nextSteps?: string[];
  blockers?: string[];
  timeline?: string[];
  notes?: string[];
}

export interface ProjectMetaRecord {
  projectId: string;
  projectName: string;
  description: string;
  aliases: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  dreamUpdatedAt?: string;
  relativePath: string;
  absolutePath: string;
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
export type DreamPipelineStatus = "running" | "success" | "skipped" | "failed";

export interface IndexingSettings {
  reasoningMode: ReasoningMode;
  recallTopK: number;
  autoIndexIntervalMinutes: number;
  autoDreamIntervalMinutes: number;
  autoDreamMinNewL1: number;
  dreamProjectRebuildTimeoutMs: number;
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

export const LEGACY_MEMORY_EXPORT_FORMAT_VERSION = "clawxmemory-memory-bundle.v1" as const;
export const MEMORY_EXPORT_FORMAT_VERSION = "clawxmemory-file-memory-bundle.v2" as const;

export interface MemoryFileExportRecord extends MemoryFileFrontmatter {
  file: string;
  relativePath: string;
  content: string;
}

export interface ProjectMetaExportRecord {
  projectId: string;
  projectName: string;
  description: string;
  aliases: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  dreamUpdatedAt?: string;
  relativePath: string;
}

export interface MemoryExportBundle {
  formatVersion: typeof MEMORY_EXPORT_FORMAT_VERSION;
  exportedAt: string;
  lastIndexedAt?: string;
  lastDreamAt?: string;
  lastDreamStatus?: DreamPipelineStatus;
  lastDreamSummary?: string;
  projectMetas: ProjectMetaExportRecord[];
  memoryFiles: MemoryFileExportRecord[];
}

export interface LegacyMemoryExportBundle {
  formatVersion: typeof LEGACY_MEMORY_EXPORT_FORMAT_VERSION;
  exportedAt: string;
  lastIndexedAt?: string;
  l0Sessions: L0SessionRecord[];
  l1Windows: L1WindowRecord[];
  l2TimeIndexes: L2TimeIndexRecord[];
  l2ProjectIndexes: L2ProjectIndexRecord[];
  globalProfile: GlobalProfileRecord;
  indexLinks: IndexLinkRecord[];
}

export type MemoryImportableBundle = MemoryExportBundle | LegacyMemoryExportBundle;

export interface MemoryTransferCounts {
  memoryFiles: number;
  project: number;
  feedback: number;
  user: number;
  tmp: number;
  projectMetas: number;
  legacyL0?: number;
  legacyL1?: number;
  legacyL2Time?: number;
  legacyL2Project?: number;
  legacyProfile?: number;
  legacyLinks?: number;
}

export interface MemoryImportResult {
  formatVersion: typeof MEMORY_EXPORT_FORMAT_VERSION | typeof LEGACY_MEMORY_EXPORT_FORMAT_VERSION;
  imported: MemoryTransferCounts;
  importedAt: string;
  lastIndexedAt?: string;
  lastDreamAt?: string;
  lastDreamStatus?: DreamPipelineStatus;
  lastDreamSummary?: string;
}

export type IntentType = "time" | "project" | "fact" | "general" | MemoryRoute;

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

export interface RetrievalTraceKvEntry {
  label: string;
  value: string;
}

export type RetrievalTraceDetail =
  | {
      key: string;
      label: string;
      kind: "text" | "note";
      text: string;
    }
  | {
      key: string;
      label: string;
      kind: "list";
      items: string[];
    }
  | {
      key: string;
      label: string;
      kind: "kv";
      entries: RetrievalTraceKvEntry[];
    }
  | {
      key: string;
      label: string;
      kind: "json";
      json: unknown;
    };

export interface RetrievalPromptDebug {
  requestLabel: string;
  systemPrompt: string;
  userPrompt: string;
  rawResponse: string;
  parsedResult?: unknown;
  timedOut?: boolean;
  errored?: boolean;
  errorMessage?: string;
}

export type IndexTraceTrigger = "explicit_remember" | "manual_sync" | "scheduled";
export type IndexTraceStatus = "running" | "completed" | "error";
export type IndexTraceStorageKind =
  | "global_user"
  | "tmp_project"
  | "tmp_feedback"
  | "formal_project"
  | "formal_feedback";

export interface IndexTraceBatchSummary {
  l0Ids: string[];
  segmentCount: number;
  focusUserTurnCount: number;
  fromTimestamp: string;
  toTimestamp: string;
}

export interface IndexTraceStoredResult {
  candidateType: MemoryRecordType;
  candidateName: string;
  scope: MemoryScope;
  projectId?: string;
  relativePath: string;
  storageKind: IndexTraceStorageKind;
}

export type IndexTraceStepKind =
  | "index_start"
  | "batch_loaded"
  | "focus_turns_selected"
  | "turn_classified"
  | "candidate_validated"
  | "candidate_grouped"
  | "candidate_persisted"
  | "user_profile_rewritten"
  | "index_finished";

export interface IndexTraceStep {
  stepId: string;
  kind: IndexTraceStepKind;
  title: string;
  status: "info" | "success" | "warning" | "error" | "skipped";
  inputSummary: string;
  outputSummary: string;
  refs?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  details?: RetrievalTraceDetail[];
  promptDebug?: RetrievalPromptDebug;
}

export interface IndexTraceRecord {
  indexTraceId: string;
  sessionKey: string;
  trigger: IndexTraceTrigger;
  startedAt: string;
  finishedAt?: string;
  status: IndexTraceStatus;
  batchSummary: IndexTraceBatchSummary;
  steps: IndexTraceStep[];
  storedResults: IndexTraceStoredResult[];
}

export type DreamTraceTrigger = "manual" | "scheduled";
export type DreamTraceStatus = "running" | "completed" | "skipped" | "error";
export type DreamTraceMutationAction = "write" | "delete" | "delete_project" | "rewrite_user_profile";

export interface DreamTraceSnapshotSummary {
  formalProjectCount: number;
  tmpProjectCount: number;
  tmpFeedbackCount: number;
  formalProjectFileCount: number;
  formalFeedbackFileCount: number;
  hasUserProfile: boolean;
}

export interface DreamTraceMutation {
  mutationId: string;
  action: DreamTraceMutationAction;
  relativePath?: string;
  projectId?: string;
  projectName?: string;
  candidateType?: MemoryRecordType;
  name?: string;
  description?: string;
  preview?: string;
}

export type DreamTraceStepKind =
  | "dream_start"
  | "snapshot_loaded"
  | "global_plan_generated"
  | "global_plan_validated"
  | "project_rewrite_generated"
  | "project_mutations_applied"
  | "user_profile_rewritten"
  | "manifests_repaired"
  | "dream_finished";

export interface DreamTraceStep {
  stepId: string;
  kind: DreamTraceStepKind;
  title: string;
  status: "info" | "success" | "warning" | "error" | "skipped";
  inputSummary: string;
  outputSummary: string;
  refs?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  details?: RetrievalTraceDetail[];
  promptDebug?: RetrievalPromptDebug;
}

export interface DreamTraceOutcome {
  rewrittenProjects: number;
  deletedProjects: number;
  deletedFiles: number;
  profileUpdated: boolean;
  summary: string;
}

export interface DreamTraceRecord {
  dreamTraceId: string;
  trigger: DreamTraceTrigger;
  startedAt: string;
  finishedAt?: string;
  status: DreamTraceStatus;
  snapshotSummary: DreamTraceSnapshotSummary;
  steps: DreamTraceStep[];
  mutations: DreamTraceMutation[];
  outcome: DreamTraceOutcome;
  skipReason?: string;
}

export type RetrievalTraceStepKind =
  | "recall_start"
  | "cache_hit"
  | "hop1_decision"
  | "l2_candidates"
  | "hop2_decision"
  | "l1_candidates"
  | "hop3_decision"
  | "l0_candidates"
  | "hop4_decision"
  | "memory_gate"
  | "user_base_loaded"
  | "project_resolved"
  | "manifest_built"
  | "manifest_selected"
  | "files_loaded"
  | "context_rendered"
  | "fallback_applied"
  | "recall_skipped";

export interface RetrievalTraceStep {
  stepId: string;
  kind: RetrievalTraceStepKind;
  title: string;
  status: "info" | "success" | "warning" | "error" | "skipped";
  inputSummary: string;
  outputSummary: string;
  refs?: Record<string, unknown>;
  metrics?: Record<string, unknown>;
  details?: RetrievalTraceDetail[];
  promptDebug?: RetrievalPromptDebug;
}

export interface RetrievalTrace {
  traceId: string;
  query: string;
  mode: "auto" | "explicit";
  startedAt: string;
  finishedAt: string;
  steps: RetrievalTraceStep[];
}

export interface CaseToolEvent {
  eventId: string;
  phase: "start" | "result";
  toolName: string;
  toolCallId?: string;
  occurredAt: string;
  status: "running" | "success" | "error";
  summary: string;
  paramsPreview?: string;
  resultPreview?: string;
  durationMs?: number;
}

export interface CaseTraceRecord {
  caseId: string;
  sessionKey: string;
  query: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "interrupted" | "error";
  retrieval?: {
    intent?: IntentType;
    enoughAt?: RetrievalResult["enoughAt"];
    injected: boolean;
    contextPreview: string;
    evidenceNotePreview: string;
    pathSummary: string;
    trace: RetrievalTrace | null;
  };
  toolEvents: CaseToolEvent[];
  assistantReply: string;
}

export interface RetrievalResult {
  query: string;
  intent: IntentType;
  enoughAt: "profile" | "l2" | "l1" | "l0" | "manifest" | "file" | "none";
  profile: GlobalProfileRecord | null;
  evidenceNote: string;
  l2Results: L2SearchResult[];
  l1Results: L1SearchResult[];
  l0Results: L0SearchResult[];
  context: string;
  trace?: RetrievalTrace;
  debug?: {
    mode: "llm" | "local_fallback" | "none";
    elapsedMs: number;
    cacheHit: boolean;
    path?: "auto" | "explicit" | "shadow";
    resolvedProjectId?: string;
    budgetLimited?: boolean;
    shadowDeepQueued?: boolean;
    hop1QueryScope?: "standalone" | "continuation";
    hop1EffectiveQuery?: string;
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
    route?: MemoryRoute;
    manifestCount?: number;
    selectedFileIds?: string[];
  };
}

export type RecallMode = "llm" | "local_fallback" | "none";
export type StartupRepairStatus = "idle" | "running" | "failed";

export interface DashboardOverview {
  totalL0: number;
  pendingL0: number;
  pendingSegments?: number;
  openTopics: number;
  totalL1: number;
  totalL2Time: number;
  totalL2Project: number;
  totalProfiles: number;
  totalMemoryFiles?: number;
  totalUserMemories?: number;
  totalFeedbackMemories?: number;
  totalProjectMemories?: number;
  tmpTotalFiles?: number;
  tmpProjectMemories?: number;
  tmpFeedbackMemories?: number;
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
  managedWorkspaceFiles?: ManagedWorkspaceFileState[];
  boundaryStatus?: ManagedBoundaryStatus;
  lastBoundaryAction?: string;
  lastIndexedAt?: string;
  lastDreamAt?: string;
  lastDreamStatus?: DreamPipelineStatus;
  lastDreamSummary?: string;
  lastDreamL1EndedAt?: string;
  changedFilesSinceLastDream?: number;
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
  recentMemoryFiles?: MemoryManifestEntry[];
}

export type DreamReviewFocus = "all" | "projects" | "profile";

export type DreamReviewTarget = "l2_project" | "global_profile" | "l1_only" | "time_note";

export interface DreamEvidenceRef {
  refId: string;
  level: "profile" | "l2_project" | "l2_time" | "l1" | "l0";
  id: string;
  label: string;
  summary: string;
}

export interface DreamReviewFinding {
  title: string;
  rationale: string;
  confidence: number;
  target: DreamReviewTarget;
  evidenceRefs: string[];
}

export interface DreamReviewResult {
  summary: string;
  projectRebuild: DreamReviewFinding[];
  profileSuggestions: DreamReviewFinding[];
  cleanup: DreamReviewFinding[];
  ambiguous: DreamReviewFinding[];
  noAction: DreamReviewFinding[];
  timeLayerNotes: DreamReviewFinding[];
  evidenceRefs: DreamEvidenceRef[];
}
