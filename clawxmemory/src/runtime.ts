import {
  type DashboardOverview,
  HeartbeatIndexer,
  LlmMemoryExtractor,
  MemoryRepository,
  ReasoningRetriever,
  loadSkillsRuntime,
  type HeartbeatStats,
  type IndexingSettings,
  type MemoryMessage,
  type MemoryExportBundle,
  type MemoryImportResult,
  type MemoryUiSnapshot,
  type StartupRepairStatus,
  nowIso,
} from "./core/index.js";
import type { InternalHookEvent } from "openclaw/plugin-sdk/hook-runtime";
import type {
  PluginHookAgentEndEvent,
  PluginHookAgentContext,
  PluginHookBeforeMessageWriteEvent,
  PluginHookBeforeMessageWriteResult,
  PluginHookBeforePromptBuildEvent,
  PluginHookBeforePromptBuildResult,
  PluginHookBeforeResetEvent,
  PluginLogger,
  PluginRuntime,
} from "openclaw/plugin-sdk/plugin-runtime";
import { buildPluginConfig, type PluginRuntimeConfig } from "./config.js";
import { inspectTranscriptMessage, isCommandOnlyUserText, isSessionBoundaryMarkerMessage, isSessionStartupMarkerText, normalizeMessages, normalizeTranscriptMessage } from "./message-utils.js";
import { buildPluginTools } from "./tools.js";
import { LocalUiServer } from "./ui-server.js";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const MEMORY_REPAIR_VERSION = "2026-03-24-recall-injection-cleanup-v15";
const INDEXING_SETTINGS_MIGRATION_VERSION = "2026-03-16-reasoning-mode-settings-v1";
const PLUGIN_ID = "clawxmemory";
const RECENT_INBOUND_TTL_MS = 30_000;
const COMMAND_REPLY_TTL_MS = 10_000;
const NON_MEMORY_TURN_TTL_MS = 15_000;
const STARTUP_REPAIR_SNAPSHOT_LIMIT = 200;
const STARTUP_FALLBACK_GREETING = "I'm ready. What would you like to do?";

interface MemoryBoundaryDiagnostics {
  slotOwner: string;
  dynamicMemoryRuntime: string;
  workspaceBootstrapPresent: boolean;
  memoryRuntimeHealthy: boolean;
  runtimeIssues: string[];
}

interface LoggerLike {
  debug?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
}

function safeLog(logger: PluginLogger | undefined): LoggerLike {
  if (!logger) return console;

  const wrap = (method: ((message: string, meta?: Record<string, unknown>) => void) | undefined) => (
    ...args: unknown[]
  ): void => {
    if (!method) return;
    const [message, meta] = args;
    const rendered = typeof message === "string" ? message : String(message);
    if (meta && typeof meta === "object" && !Array.isArray(meta)) {
      method(rendered, meta as Record<string, unknown>);
      return;
    }
    method(rendered);
  };

  return {
    debug: wrap(logger.debug),
    info: wrap(logger.info),
    warn: wrap(logger.warn),
    error: wrap(logger.error),
  };
}

function asObject(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function getConfigValue(root: Record<string, unknown> | undefined, path: string[]): unknown {
  let current: unknown = root;
  for (const part of path) {
    const object = asObject(current);
    if (!object) return undefined;
    current = object[part];
  }
  return current;
}

function getConfigString(root: Record<string, unknown> | undefined, path: string[]): string {
  const value = getConfigValue(root, path);
  return typeof value === "string" ? value.trim() : "";
}

function getConfigBoolean(root: Record<string, unknown> | undefined, path: string[]): boolean | undefined {
  const value = getConfigValue(root, path);
  return typeof value === "boolean" ? value : undefined;
}

function resolveSessionKey(ctx: Record<string, unknown>): string {
  if (typeof ctx.sessionKey === "string" && ctx.sessionKey.trim()) return ctx.sessionKey;
  if (typeof ctx.sessionId === "string" && ctx.sessionId.trim()) return ctx.sessionId;
  return `session-${Date.now()}`;
}

function shouldSkipCapture(event: Record<string, unknown>, ctx: Record<string, unknown>): boolean {
  if (event.success === false) return true;
  const provider = typeof ctx.messageProvider === "string" ? ctx.messageProvider : "";
  const trigger = typeof ctx.trigger === "string" ? ctx.trigger : "";
  const sessionKey = resolveSessionKey(ctx);
  return ["exec-event", "cron-event"].includes(provider)
    || ["heartbeat", "cron", "memory"].includes(trigger)
    || sessionKey.startsWith("temp:");
}

function isControlCommandText(text: string): boolean {
  return isCommandOnlyUserText(text);
}

function truncateMessageText(text: string, maxMessageChars: number): string {
  if (text.length <= maxMessageChars) return text;
  return `${text.slice(0, maxMessageChars)}...`;
}

function sanitizeStoredMessages(messages: MemoryMessage[]): MemoryMessage[] {
  const cleaned: MemoryMessage[] = [];
  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index]!;
    if (message.role !== "user" && message.role !== "assistant") continue;
    if (!message.content.trim()) continue;
    const next = messages[index + 1];
    if (
      message.role === "assistant"
      && next?.role === "assistant"
      && !message.content.includes("\n")
      && !/[你您?？]/.test(message.content)
    ) {
      continue;
    }
    const previous = cleaned[cleaned.length - 1];
    if (previous && previous.role === message.role && previous.content === message.content) continue;
    cleaned.push(message);
  }
  return cleaned;
}

function sanitizeL0Record(
  record: { sessionKey: string; messages: unknown[] },
  config: { includeAssistant: boolean; maxMessageChars: number },
): MemoryMessage[] {
  if (record.sessionKey.startsWith("temp:")) return [];
  return sanitizeStoredMessages(normalizeMessages(record.messages, {
    captureStrategy: "last_turn",
    includeAssistant: config.includeAssistant,
    maxMessageChars: config.maxMessageChars,
  })).filter((message, index, all) => {
    if (message.role === "assistant") {
      return all.slice(0, index).some((item) => item.role === "user");
    }
    return true;
  });
}

function shouldLogStats(stats: HeartbeatStats): boolean {
  return stats.l0Captured > 0
    || stats.l1Created > 0
    || stats.l2TimeUpdated > 0
    || stats.l2ProjectUpdated > 0
    || stats.profileUpdated > 0
    || stats.failed > 0;
}

function logIndexStats(logger: LoggerLike, reason: string, stats: HeartbeatStats): void {
  if (!shouldLogStats(stats)) return;
  logger.info?.(
    `[clawxmemory] indexed reason=${reason} l0=${stats.l0Captured}, l1=${stats.l1Created}, l2_time=${stats.l2TimeUpdated}, l2_project=${stats.l2ProjectUpdated}, profile=${stats.profileUpdated}, failed=${stats.failed}`,
  );
}

function emptyStats(): HeartbeatStats {
  return {
    l0Captured: 0,
    l1Created: 0,
    l2TimeUpdated: 0,
    l2ProjectUpdated: 0,
    profileUpdated: 0,
    failed: 0,
  };
}

function mergeStats(left: HeartbeatStats, right: HeartbeatStats): HeartbeatStats {
  return {
    l0Captured: left.l0Captured + right.l0Captured,
    l1Created: left.l1Created + right.l1Created,
    l2TimeUpdated: left.l2TimeUpdated + right.l2TimeUpdated,
    l2ProjectUpdated: left.l2ProjectUpdated + right.l2ProjectUpdated,
    profileUpdated: left.profileUpdated + right.profileUpdated,
    failed: left.failed + right.failed,
  };
}

function sliceUiSnapshot(snapshot: MemoryUiSnapshot, limit: number): MemoryUiSnapshot {
  return {
    overview: { ...snapshot.overview },
    settings: { ...snapshot.settings },
    recentTimeIndexes: snapshot.recentTimeIndexes.slice(0, limit),
    recentProjectIndexes: snapshot.recentProjectIndexes.slice(0, limit),
    recentL1Windows: snapshot.recentL1Windows.slice(0, limit),
    recentSessions: snapshot.recentSessions.slice(0, limit),
    globalProfile: { ...snapshot.globalProfile },
  };
}

function replaceAssistantMessageText(rawMessage: unknown, text: string): unknown {
  const replacementContent = [{ type: "text", text }];
  if (!rawMessage || typeof rawMessage !== "object") {
    return { role: "assistant", content: replacementContent };
  }

  const root = { ...(rawMessage as Record<string, unknown>) };
  const nested = asObject(root.message);
  if (nested) {
    root.message = {
      ...nested,
      role: "assistant",
      content: replacementContent,
    };
    return root;
  }

  return {
    ...root,
    role: "assistant",
    content: replacementContent,
  };
}

function buildMemoryRecallSystemContext(evidenceBlock: string): string {
  return [
    "## ClawXMemory Recall",
    "Use the following retrieved ClawXMemory evidence for this turn.",
    evidenceBlock.trim(),
  ].filter(Boolean).join("\n\n");
}

export interface MemoryPluginRuntimeOptions {
  apiConfig: Record<string, unknown> | undefined;
  pluginRuntime: PluginRuntime | undefined;
  pluginConfig: Record<string, unknown> | undefined;
  logger: PluginLogger | undefined;
}

export class MemoryPluginRuntime {
  readonly logger: LoggerLike;
  readonly config: PluginRuntimeConfig;
  readonly repository: MemoryRepository;
  readonly indexer: HeartbeatIndexer;
  readonly retriever: ReasoningRetriever;

  private readonly apiConfig: Record<string, unknown> | undefined;
  private readonly pendingBySession = new Map<string, MemoryMessage[]>();
  private readonly idleIndexTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly debouncedSessions = new Set<string>();
  private readonly queuedSessionKeys = new Set<string>();
  private readonly effectiveSessionKeyByRawSession = new Map<string, string>();
  private readonly conversationGenerationByRawSession = new Map<string, number>();
  private readonly recentInboundBySession = new Map<string, number>();
  private readonly startupGraceByRawSession = new Set<string>();
  private readonly nonMemoryTurnByRawSession = new Map<string, number>();
  private readonly pendingCommandReplyByRawSession = new Map<string, number>();

  private heartbeatTimer: ReturnType<typeof setInterval> | undefined;
  private uiServer: LocalUiServer | undefined;
  private queuePromise: Promise<HeartbeatStats> | undefined;
  private activeSessionKey: string | undefined;
  private queuedFullRun = false;
  private queuedReason = "";
  private indexingInProgress = false;
  private started = false;
  private stopped = false;
  private startupRepairStatus: StartupRepairStatus = "idle";
  private startupRepairMessage = "";
  private startupRepairSnapshot: MemoryUiSnapshot | undefined;

  constructor(options: MemoryPluginRuntimeOptions) {
    this.logger = safeLog(options.logger);
    this.apiConfig = options.apiConfig;
    this.config = buildPluginConfig(options.pluginConfig);

    const skills = this.config.skillsDir
      ? loadSkillsRuntime({ skillsDir: this.config.skillsDir, logger: this.logger })
      : loadSkillsRuntime({ logger: this.logger });
    this.repository = new MemoryRepository(this.config.dbPath);
    const persistedSettings = this.repository.getIndexingSettings(this.config.defaultIndexingSettings);
    const migratedSettings = this.maybeUpgradeIndexingSettings(persistedSettings);
    const extractor = new LlmMemoryExtractor(
      options.apiConfig ?? {},
      options.pluginRuntime as Record<string, unknown> | undefined,
      this.logger,
    );
    this.indexer = new HeartbeatIndexer(
      this.repository,
      extractor,
      {
        batchSize: this.config.heartbeatBatchSize,
        source: "openclaw",
        settings: migratedSettings,
        logger: this.logger,
      },
    );
    this.retriever = new ReasoningRetriever(
      this.repository,
      skills,
      extractor,
      {
        getSettings: () => this.indexer.getSettings(),
        isBackgroundBusy: () => this.indexingInProgress,
      },
    );

    if (this.config.uiEnabled) {
      this.uiServer = new LocalUiServer(
        this.repository,
        this.retriever,
        {
          host: this.config.uiHost,
          port: this.config.uiPort,
          prefix: this.config.uiPathPrefix,
        },
        {
          getSettings: () => this.indexer.getSettings(),
          saveSettings: (partial) => this.applyIndexingSettings(partial),
          runIndexNow: () => this.flushAllNow("manual"),
          exportMemoryBundle: () => this.repository.exportMemoryBundle(),
          importMemoryBundle: (bundle) => this.replaceMemoryBundle(bundle),
          getRuntimeOverview: () => this.getRuntimeOverview(),
          getStartupRepairSnapshot: (limit) => this.getStartupRepairSnapshot(limit),
        },
        this.logger,
      );
    }
  }

  private maybeUpgradeIndexingSettings(settings: IndexingSettings): IndexingSettings {
    const migrationState = this.repository.getPipelineState("indexingSettingsMigration");
    if (migrationState === INDEXING_SETTINGS_MIGRATION_VERSION) return settings;
    const normalized = this.repository.saveIndexingSettings(settings, this.config.defaultIndexingSettings);
    this.repository.setPipelineState("indexingSettingsMigration", INDEXING_SETTINGS_MIGRATION_VERSION);
    return normalized;
  }

  private setStartupRepairState(
    status: StartupRepairStatus,
    options?: { message?: string; snapshot?: MemoryUiSnapshot },
  ): void {
    this.startupRepairStatus = status;
    if (status === "idle") {
      this.startupRepairMessage = "";
      this.startupRepairSnapshot = undefined;
      return;
    }
    this.startupRepairMessage = options?.message?.trim() ?? "";
    this.startupRepairSnapshot = options?.snapshot;
  }

  private getStartupRepairSnapshot(limit: number): MemoryUiSnapshot | undefined {
    if (this.startupRepairStatus === "idle" || !this.startupRepairSnapshot) return undefined;
    return sliceUiSnapshot(this.startupRepairSnapshot, limit);
  }

  private clearEphemeralMemoryState(): void {
    for (const sessionKey of Array.from(this.idleIndexTimers.keys())) {
      this.clearIdleTimer(sessionKey);
    }
    this.pendingBySession.clear();
    this.debouncedSessions.clear();
    this.queuedSessionKeys.clear();
    this.queuedFullRun = false;
    this.queuedReason = "";
    this.activeSessionKey = undefined;
    this.effectiveSessionKeyByRawSession.clear();
    this.conversationGenerationByRawSession.clear();
    this.recentInboundBySession.clear();
    this.startupGraceByRawSession.clear();
    this.nonMemoryTurnByRawSession.clear();
    this.pendingCommandReplyByRawSession.clear();
    this.retriever.resetTransientState();
  }

  async replaceMemoryBundle(bundle: MemoryExportBundle): Promise<MemoryImportResult> {
    this.setStartupRepairState("idle");
    this.clearEphemeralMemoryState();
    if (this.queuePromise) {
      try {
        await this.queuePromise;
      } catch (error) {
        this.logger.warn?.(`[clawxmemory] pending index queue failed before import: ${String(error)}`);
      }
    }
    this.clearEphemeralMemoryState();
    return this.repository.importMemoryBundle(bundle);
  }

  getTools() {
    return buildPluginTools(this.repository, this.retriever, {
      getOverview: () => ({
        ...this.repository.getOverview(),
        ...this.getRuntimeOverview(),
      }),
      flushAll: () => this.flushAllNow("manual"),
    });
  }

  start(): void {
    if (this.started || this.stopped) return;
    this.started = true;
    this.rescheduleHeartbeat();
    this.uiServer?.start();
    this.startBackgroundRepair();
    this.logMemoryBoundaryDiagnostics();
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.started = false;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    for (const sessionKey of Array.from(this.idleIndexTimers.keys())) {
      this.clearIdleTimer(sessionKey);
    }
    this.pendingBySession.clear();
    this.effectiveSessionKeyByRawSession.clear();
    this.conversationGenerationByRawSession.clear();
    this.recentInboundBySession.clear();
    this.startupGraceByRawSession.clear();
    this.nonMemoryTurnByRawSession.clear();
    this.pendingCommandReplyByRawSession.clear();
    this.uiServer?.stop();
    this.repository.close();
  }

  private appendPendingMessage(sessionKey: string, message: MemoryMessage): void {
    const pending = this.pendingBySession.get(sessionKey) ?? [];
    const previous = pending[pending.length - 1];
    if (!previous || previous.role !== message.role || previous.content !== message.content) {
      pending.push(message);
      this.pendingBySession.set(sessionKey, pending);
    }
  }

  private markRecentInbound(sessionKey: string): void {
    this.recentInboundBySession.set(sessionKey, Date.now());
  }

  private hasRecentInbound(sessionKey: string): boolean {
    const receivedAt = this.recentInboundBySession.get(sessionKey);
    if (!receivedAt) return false;
    if (Date.now() - receivedAt > RECENT_INBOUND_TTL_MS) {
      this.recentInboundBySession.delete(sessionKey);
      return false;
    }
    return true;
  }

  private markStartupGrace(rawSessionKey: string): void {
    const trimmed = rawSessionKey.trim();
    if (!trimmed || trimmed.startsWith("temp:")) return;
    this.startupGraceByRawSession.add(trimmed);
  }

  private hasStartupGrace(rawSessionKey: string): boolean {
    const trimmed = rawSessionKey.trim();
    return Boolean(trimmed) && this.startupGraceByRawSession.has(trimmed);
  }

  private clearStartupGrace(rawSessionKey: string): void {
    const trimmed = rawSessionKey.trim();
    if (!trimmed) return;
    this.startupGraceByRawSession.delete(trimmed);
  }

  private markNonMemoryTurn(rawSessionKey: string): void {
    const trimmed = rawSessionKey.trim();
    if (!trimmed || trimmed.startsWith("temp:")) return;
    this.nonMemoryTurnByRawSession.set(trimmed, Date.now());
  }

  private hasNonMemoryTurn(rawSessionKey: string): boolean {
    const trimmed = rawSessionKey.trim();
    if (!trimmed) return false;
    const markedAt = this.nonMemoryTurnByRawSession.get(trimmed);
    if (!markedAt) return false;
    if (Date.now() - markedAt > NON_MEMORY_TURN_TTL_MS) {
      this.nonMemoryTurnByRawSession.delete(trimmed);
      return false;
    }
    return true;
  }

  private clearNonMemoryTurn(rawSessionKey: string): void {
    const trimmed = rawSessionKey.trim();
    if (!trimmed) return;
    this.nonMemoryTurnByRawSession.delete(trimmed);
  }

  private markPendingCommandReply(rawSessionKey: string): void {
    const trimmed = rawSessionKey.trim();
    if (!trimmed || trimmed.startsWith("temp:")) return;
    this.pendingCommandReplyByRawSession.set(trimmed, Date.now());
  }

  private hasPendingCommandReply(rawSessionKey: string): boolean {
    const trimmed = rawSessionKey.trim();
    if (!trimmed) return false;
    const markedAt = this.pendingCommandReplyByRawSession.get(trimmed);
    if (!markedAt) return false;
    if (Date.now() - markedAt > COMMAND_REPLY_TTL_MS) {
      this.pendingCommandReplyByRawSession.delete(trimmed);
      return false;
    }
    return true;
  }

  private clearPendingCommandReply(rawSessionKey: string): void {
    const trimmed = rawSessionKey.trim();
    if (!trimmed) return;
    this.pendingCommandReplyByRawSession.delete(trimmed);
  }

  private getEffectiveSessionKey(rawSessionKey: string): string {
    const trimmed = rawSessionKey.trim();
    if (!trimmed) return trimmed;
    const cached = this.effectiveSessionKeyByRawSession.get(trimmed);
    if (cached) return cached;
    this.effectiveSessionKeyByRawSession.set(trimmed, trimmed);
    this.conversationGenerationByRawSession.set(trimmed, 0);
    return trimmed;
  }

  private rotateConversationWindow(rawSessionKey: string, reason: string): void {
    const trimmed = rawSessionKey.trim();
    if (!trimmed || trimmed.startsWith("temp:")) return;
    const previousSessionKey = this.getEffectiveSessionKey(trimmed);
    const pending = this.pendingBySession.get(previousSessionKey) ?? [];
    const pendingMessages = sanitizeStoredMessages(pending);
    if (pendingMessages.length > 0 && pendingMessages.some((message) => message.role === "user")) {
      const captured = this.indexer.captureL0Session({
        sessionKey: previousSessionKey,
        timestamp: nowIso(),
        messages: pendingMessages,
      });
      if (captured) {
        this.logger.info?.(`[clawxmemory] captured pending l0 before ${reason} session=${previousSessionKey}`);
      }
    }
    const nextGeneration = (this.conversationGenerationByRawSession.get(trimmed) ?? 0) + 1;
    const nextSessionKey = `${trimmed}#window:${nextGeneration}`;
    this.conversationGenerationByRawSession.set(trimmed, nextGeneration);
    this.effectiveSessionKeyByRawSession.set(trimmed, nextSessionKey);

    this.pendingBySession.delete(previousSessionKey);
    this.recentInboundBySession.delete(previousSessionKey);
    if (this.activeSessionKey === previousSessionKey) {
      this.activeSessionKey = undefined;
    }

    void this.flushSessionNow(previousSessionKey, reason).catch((error) => {
      this.logger.warn?.(`[clawxmemory] ${reason} failed session=${previousSessionKey}: ${String(error)}`);
    });
    this.logger.info?.(
      `[clawxmemory] opened new conversation window raw_session=${trimmed} previous=${previousSessionKey} next=${nextSessionKey} reason=${reason}`,
    );
  }

  handleInternalMessageReceived = (event: InternalHookEvent): void => {
    if (event.type !== "message" || event.action !== "received") return;
    const rawSessionKey = typeof event.sessionKey === "string" ? event.sessionKey.trim() : "";
    if (!rawSessionKey || rawSessionKey.startsWith("temp:")) return;

    const context = event.context && typeof event.context === "object"
      ? event.context as Record<string, unknown>
      : undefined;
    const rawContent = typeof context?.content === "string" ? context.content.trim() : "";
    if (!rawContent || isControlCommandText(rawContent) || isSessionStartupMarkerText(rawContent)) return;

    const sessionKey = this.getEffectiveSessionKey(rawSessionKey);
    const normalized: MemoryMessage = {
      role: "user",
      content: truncateMessageText(rawContent, this.config.maxMessageChars),
    };
    const rawMessageId = typeof context?.messageId === "string" ? context.messageId.trim() : "";
    if (rawMessageId) {
      normalized.msgId = rawMessageId;
    }

    this.appendPendingMessage(sessionKey, normalized);
    this.markRecentInbound(sessionKey);
  };

  handleInternalCommandEvent = (event: InternalHookEvent): void => {
    if (event.type !== "command") return;
    const rawSessionKey = typeof event.sessionKey === "string" ? event.sessionKey.trim() : "";
    if (!rawSessionKey || rawSessionKey.startsWith("temp:")) return;

    const action = typeof event.action === "string" ? event.action.trim().toLowerCase() : "";
    if (!action) return;

    if (action === "new" || action === "reset") {
      this.markStartupGrace(rawSessionKey);
      this.markNonMemoryTurn(rawSessionKey);
      this.clearPendingCommandReply(rawSessionKey);
      return;
    }

    this.markPendingCommandReply(rawSessionKey);
  };

  handleBeforePromptBuild = async (
    event: PluginHookBeforePromptBuildEvent,
    _ctx: PluginHookAgentContext,
  ): Promise<PluginHookBeforePromptBuildResult | void> => {
    if (!this.config.recallEnabled) return;
    const prompt = typeof event.prompt === "string" ? event.prompt : "";
    if (prompt.trim().length < 2) return;
    try {
      const startedAt = Date.now();
      const settings = this.indexer.getSettings();
      const retrieved = await this.retriever.retrieve(prompt, {
        retrievalMode: "auto",
        l2Limit: 4,
        l1Limit: 2,
        l0Limit: 1,
        includeFacts: true,
      });
      const elapsedMs = Date.now() - startedAt;
      if (
        settings.reasoningMode === "answer_first"
        && elapsedMs > settings.maxAutoReplyLatencyMs + 300
      ) {
        this.logger.warn?.(`[clawxmemory] recall slow query_ms=${elapsedMs} prompt_chars=${prompt.length}`);
      }
      const injected = Boolean(retrieved.context?.trim());
      this.logger.info?.(
        `[clawxmemory] recall mode=${retrieved.debug?.mode ?? "none"} reasoning_mode=${settings.reasoningMode} latency_cap_ms=${settings.reasoningMode === "answer_first" ? settings.maxAutoReplyLatencyMs : "none"} enough_at=${retrieved.enoughAt} injected=${injected} elapsed_ms=${retrieved.debug?.elapsedMs ?? elapsedMs} cache_hit=${retrieved.debug?.cacheHit ? "1" : "0"}`,
      );
      if (!retrieved.context.trim()) return;
      // Dynamic recall must stay in system prompt space; prependContext leaks into user-visible prompt displays.
      return { prependSystemContext: buildMemoryRecallSystemContext(retrieved.context) };
    } catch (error) {
      this.logger.warn?.(`[clawxmemory] recall failed: ${String(error)}`);
      return;
    }
  };

  handleBeforeMessageWrite = (
    event: PluginHookBeforeMessageWriteEvent,
    ctx: { agentId?: string; sessionKey?: string },
  ): PluginHookBeforeMessageWriteResult | void => {
    const rawSessionKey = typeof ctx.sessionKey === "string" ? ctx.sessionKey.trim() : "";
    if (!rawSessionKey || rawSessionKey.startsWith("temp:")) return;
    const messageInfo = inspectTranscriptMessage(event.message);

    if (messageInfo.role === "user" && isSessionBoundaryMarkerMessage(event.message)) {
      this.markStartupGrace(rawSessionKey);
      this.markNonMemoryTurn(rawSessionKey);
      this.rotateConversationWindow(rawSessionKey, "session_boundary_marker");
      this.logger.info?.(`[clawxmemory] blocked startup marker session=${rawSessionKey}`);
      return { block: true };
    }

    if (messageInfo.role === "user" && isCommandOnlyUserText(messageInfo.content)) {
      this.markNonMemoryTurn(rawSessionKey);
      this.markPendingCommandReply(rawSessionKey);
      return;
    }

    if (messageInfo.role === "assistant" && !messageInfo.content && !messageInfo.hasToolCalls) {
      if (this.hasStartupGrace(rawSessionKey)) {
        this.clearStartupGrace(rawSessionKey);
        this.logger.warn?.(`[clawxmemory] replaced empty startup assistant session=${rawSessionKey}`);
        return {
          message: replaceAssistantMessageText(
            event.message,
            STARTUP_FALLBACK_GREETING,
          ) as typeof event.message,
        };
      }
      this.logger.warn?.(`[clawxmemory] blocked empty assistant message session=${rawSessionKey}`);
      return { block: true };
    }

    if (messageInfo.role === "assistant" && this.hasPendingCommandReply(rawSessionKey)) {
      this.clearPendingCommandReply(rawSessionKey);
      this.logger.info?.(`[clawxmemory] skipped command reply from memory session=${rawSessionKey}`);
      return;
    }

    if (messageInfo.role === "assistant" && messageInfo.content && this.hasStartupGrace(rawSessionKey)) {
      this.clearStartupGrace(rawSessionKey);
    }

    if (
      messageInfo.role === "user"
      && !this.hasStartupGrace(rawSessionKey)
      && !this.hasPendingCommandReply(rawSessionKey)
    ) {
      this.clearNonMemoryTurn(rawSessionKey);
    }

    const sessionKey = this.getEffectiveSessionKey(rawSessionKey);
    const normalized = normalizeTranscriptMessage(event.message, {
      includeAssistant: this.config.includeAssistant,
      maxMessageChars: this.config.maxMessageChars,
    });
    if (!normalized) return;
    if (normalized.role === "user" && this.hasRecentInbound(sessionKey)) {
      const pending = this.pendingBySession.get(sessionKey) ?? [];
      if (pending[pending.length - 1]?.role === "user") {
        return;
      }
    }
    this.appendPendingMessage(sessionKey, normalized);
  };

  handleAgentEnd = async (event: PluginHookAgentEndEvent, ctx: PluginHookAgentContext): Promise<void> => {
    if (!this.config.addEnabled) return;
    if (shouldSkipCapture(event as unknown as Record<string, unknown>, ctx as Record<string, unknown>)) return;

    const rawSessionKey = typeof ctx.sessionKey === "string" && ctx.sessionKey.trim()
      ? ctx.sessionKey.trim()
      : resolveSessionKey(ctx as Record<string, unknown>);
    const sessionKey = this.getEffectiveSessionKey(rawSessionKey);
    try {
      if (this.hasNonMemoryTurn(rawSessionKey)) {
        this.pendingBySession.delete(sessionKey);
        this.recentInboundBySession.delete(sessionKey);
        return;
      }

      if (this.activeSessionKey && this.activeSessionKey !== sessionKey) {
        void this.flushSessionNow(this.activeSessionKey, "session_boundary").catch((error) => {
          this.logger.warn?.(`[clawxmemory] session_boundary failed: ${String(error)}`);
        });
      }
      this.activeSessionKey = sessionKey;

      const pending = this.pendingBySession.get(sessionKey) ?? [];
      this.pendingBySession.delete(sessionKey);
      this.recentInboundBySession.delete(sessionKey);
      let messages = sanitizeStoredMessages(pending);
      if (messages.length === 0) {
        const rawMessages = Array.isArray(event.messages) ? event.messages : [];
        messages = sanitizeL0Record({ sessionKey, messages: rawMessages }, this.config);
      }
      if (messages.length === 0) return;
      if (!messages.some((message) => message.role === "user")) return;

      const captured = this.indexer.captureL0Session({
        sessionKey,
        timestamp: nowIso(),
        messages,
      });
      if (captured) {
        this.logger.info?.(
          `[clawxmemory] captured l0 session=${sessionKey} indexed=pending trigger=idle|timer|session_boundary|manual`,
        );
        this.scheduleIdleIndex(sessionKey);
      }
    } finally {
      this.clearNonMemoryTurn(rawSessionKey);
      this.clearPendingCommandReply(rawSessionKey);
    }
  };

  handleBeforeReset = async (event: PluginHookBeforeResetEvent, ctx: PluginHookAgentContext): Promise<void> => {
    if (!this.config.addEnabled) return;
    const fallbackRawSession = typeof ctx.sessionKey === "string" && ctx.sessionKey.trim()
      ? this.getEffectiveSessionKey(ctx.sessionKey)
      : this.activeSessionKey;
    const sessionKey = fallbackRawSession?.trim() ?? "";
    if (!sessionKey || sessionKey.startsWith("temp:")) return;

    try {
      const pending = this.pendingBySession.get(sessionKey) ?? [];
      this.pendingBySession.delete(sessionKey);
      this.recentInboundBySession.delete(sessionKey);
      let messages = sanitizeStoredMessages(pending);
      if (messages.length === 0 && Array.isArray(event.messages)) {
        messages = sanitizeL0Record({ sessionKey, messages: event.messages }, this.config);
      }
      if (messages.length > 0 && messages.some((message) => message.role === "user")) {
        const captured = this.indexer.captureL0Session({
          sessionKey,
          timestamp: nowIso(),
          messages,
        });
        if (captured) {
          this.logger.info?.(`[clawxmemory] captured pending l0 before reset session=${sessionKey}`);
        }
      }
      await this.flushSessionNow(sessionKey, "before_reset");
      if (this.activeSessionKey === sessionKey) {
        this.activeSessionKey = undefined;
      }
    } catch (error) {
      this.logger.warn?.(`[clawxmemory] before_reset flush failed session=${sessionKey}: ${String(error)}`);
    }
  };

  private getRuntimeOverview(): Pick<
    DashboardOverview,
    | "queuedSessions"
    | "lastRecallMs"
    | "recallTimeouts"
    | "lastRecallMode"
    | "currentReasoningMode"
    | "lastRecallPath"
    | "lastRecallBudgetLimited"
    | "lastShadowDeepQueued"
    | "lastRecallInjected"
    | "lastRecallEnoughAt"
    | "lastRecallCacheHit"
    | "slotOwner"
    | "dynamicMemoryRuntime"
    | "workspaceBootstrapPresent"
    | "memoryRuntimeHealthy"
    | "runtimeIssues"
    | "startupRepairStatus"
    | "startupRepairMessage"
  > {
    const queuedSessions = this.queuedFullRun
      ? Math.max(1, this.debouncedSessions.size + this.queuedSessionKeys.size)
      : new Set([...this.debouncedSessions, ...this.queuedSessionKeys]).size;
    const stats = this.retriever.getRuntimeStats();
    const diagnostics = this.collectMemoryBoundaryDiagnostics();
    return {
      queuedSessions,
      lastRecallMs: stats.lastRecallMs,
      recallTimeouts: stats.recallTimeouts,
      lastRecallMode: stats.lastRecallMode,
      currentReasoningMode: this.indexer.getSettings().reasoningMode,
      lastRecallPath: stats.lastRecallPath,
      lastRecallBudgetLimited: stats.lastRecallBudgetLimited,
      lastShadowDeepQueued: stats.lastShadowDeepQueued,
      lastRecallInjected: stats.lastRecallInjected,
      lastRecallEnoughAt: stats.lastRecallEnoughAt,
      lastRecallCacheHit: stats.lastRecallCacheHit,
      slotOwner: diagnostics.slotOwner,
      dynamicMemoryRuntime: diagnostics.dynamicMemoryRuntime,
      workspaceBootstrapPresent: diagnostics.workspaceBootstrapPresent,
      memoryRuntimeHealthy: diagnostics.memoryRuntimeHealthy,
      runtimeIssues: diagnostics.runtimeIssues,
      startupRepairStatus: this.startupRepairStatus,
      ...(this.startupRepairMessage ? { startupRepairMessage: this.startupRepairMessage } : {}),
    };
  }

  private clearIdleTimer(sessionKey: string): void {
    const timer = this.idleIndexTimers.get(sessionKey);
    if (timer) {
      clearTimeout(timer);
      this.idleIndexTimers.delete(sessionKey);
    }
    this.debouncedSessions.delete(sessionKey);
  }

  private async drainIndexQueue(): Promise<HeartbeatStats> {
    let aggregate = emptyStats();
    try {
      while (this.queuedFullRun || this.queuedSessionKeys.size > 0) {
        const reason = this.queuedReason || "heartbeat";
        const runAll = this.queuedFullRun;
        const sessionKeys = runAll ? undefined : Array.from(this.queuedSessionKeys);
        this.queuedFullRun = false;
        this.queuedSessionKeys.clear();
        this.queuedReason = "";

        this.indexingInProgress = true;
        const stats = runAll
          ? await this.indexer.runHeartbeat({ reason })
          : await this.indexer.runHeartbeat({ reason, sessionKeys: sessionKeys ?? [] });
        aggregate = mergeStats(aggregate, stats);
        logIndexStats(this.logger, reason, stats);
        if (runAll && this.startupRepairStatus === "failed" && !reason.includes("repair")) {
          this.setStartupRepairState("idle");
        }
      }
    } finally {
      this.indexingInProgress = false;
      this.queuePromise = undefined;
    }
    return aggregate;
  }

  private requestIndexRun(reason: string, sessionKeys?: string[]): Promise<HeartbeatStats> {
    if (sessionKeys && sessionKeys.length > 0) {
      sessionKeys.filter(Boolean).forEach((sessionKey) => this.queuedSessionKeys.add(sessionKey));
    } else {
      this.queuedFullRun = true;
    }
    this.queuedReason = this.queuedReason ? `${this.queuedReason}+${reason}` : reason;
    if (!this.queuePromise) {
      this.queuePromise = this.drainIndexQueue();
    }
    return this.queuePromise;
  }

  private rescheduleHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    const intervalMinutes = this.config.autoIndexIntervalMinutes;
    if (intervalMinutes <= 0) return;
    this.heartbeatTimer = setInterval(() => {
      for (const sessionKey of Array.from(this.debouncedSessions)) {
        this.clearIdleTimer(sessionKey);
      }
      void this.requestIndexRun("scheduled").catch((error) => {
        this.logger.warn?.(`[clawxmemory] scheduled index failed: ${String(error)}`);
      });
    }, intervalMinutes * 60_000);
  }

  private applyIndexingSettings(partial: Partial<IndexingSettings>): IndexingSettings {
    const merged = this.repository.saveIndexingSettings(
      {
        ...this.indexer.getSettings(),
        ...partial,
      },
      this.config.defaultIndexingSettings,
    );
    this.indexer.setSettings(merged);
    this.rescheduleHeartbeat();
    return merged;
  }

  private scheduleIdleIndex(sessionKey: string): void {
    this.clearIdleTimer(sessionKey);
    this.debouncedSessions.add(sessionKey);
    const delayMs = this.config.indexIdleDebounceMs;
    const timer = setTimeout(() => {
      this.idleIndexTimers.delete(sessionKey);
      this.debouncedSessions.delete(sessionKey);
      void this.requestIndexRun("message_capture", [sessionKey]).catch((error) => {
        this.logger.warn?.(`[clawxmemory] async message_capture failed: ${String(error)}`);
      });
    }, delayMs);
    this.idleIndexTimers.set(sessionKey, timer);
  }

  private flushSessionNow(sessionKey: string, reason: string): Promise<HeartbeatStats> {
    this.clearIdleTimer(sessionKey);
    return this.requestIndexRun(reason, [sessionKey]);
  }

  private flushAllNow(reason: string): Promise<HeartbeatStats> {
    for (const sessionKey of Array.from(this.debouncedSessions)) {
      this.clearIdleTimer(sessionKey);
    }
    return this.requestIndexRun(reason);
  }

  private startBackgroundRepair(): void {
    const repairedVersion = this.repository.getPipelineState("repairVersion");
    if (repairedVersion === MEMORY_REPAIR_VERSION) return;
    const cachedSnapshot = this.repository.getUiSnapshot(STARTUP_REPAIR_SNAPSHOT_LIMIT);
    void (async () => {
      try {
        const repair = this.repository.repairL0Sessions((record) => sanitizeL0Record(record, this.config));
        if (repair.updated === 0 && repair.removed === 0) {
          this.repository.setPipelineState("repairVersion", MEMORY_REPAIR_VERSION);
          this.logger.info?.("[clawxmemory] startup repair skipped: no l0 changes needed");
          return;
        }
        this.setStartupRepairState("running", {
          message: "startup repair rebuild in progress",
          snapshot: cachedSnapshot,
        });
        const stats = await this.flushAllNow("repair");
        this.logger.info?.(
          `[clawxmemory] repaired l0 updated=${repair.updated} removed=${repair.removed}; rebuilt l1=${stats.l1Created}, l2_time=${stats.l2TimeUpdated}, l2_project=${stats.l2ProjectUpdated}, profile=${stats.profileUpdated}, failed=${stats.failed}`,
        );
        this.repository.setPipelineState("repairVersion", MEMORY_REPAIR_VERSION);
        this.setStartupRepairState("idle");
      } catch (error) {
        this.setStartupRepairState("failed", {
          message: error instanceof Error ? error.message : String(error),
          snapshot: cachedSnapshot,
        });
        this.logger.warn?.(`[clawxmemory] startup repair failed: ${String(error)}`);
      }
    })();
  }

  private resolveWorkspaceDir(): string {
    const configured = getConfigString(this.apiConfig, ["agents", "defaults", "workspace"]);
    return resolve(configured || join(homedir(), ".openclaw", "workspace"));
  }

  private collectMemoryBoundaryDiagnostics(): MemoryBoundaryDiagnostics {
    const runtimeIssues: string[] = [];
    const slotOwner = getConfigString(this.apiConfig, ["plugins", "slots", "memory"]);
    if (slotOwner !== PLUGIN_ID) {
      runtimeIssues.push(`plugins.slots.memory=${slotOwner || "(empty)"}`);
    }
    if (getConfigBoolean(this.apiConfig, ["plugins", "entries", "memory-core", "enabled"]) !== false) {
      runtimeIssues.push("plugins.entries.memory-core.enabled should be false");
    }
    if (getConfigBoolean(this.apiConfig, ["hooks", "internal", "entries", "session-memory", "enabled"]) !== false) {
      runtimeIssues.push("hooks.internal.entries.session-memory.enabled should be false");
    }
    if (getConfigBoolean(this.apiConfig, ["agents", "defaults", "memorySearch", "enabled"]) !== false) {
      runtimeIssues.push("agents.defaults.memorySearch.enabled should be false");
    }
    if (getConfigBoolean(this.apiConfig, ["agents", "defaults", "compaction", "memoryFlush", "enabled"]) !== false) {
      runtimeIssues.push("agents.defaults.compaction.memoryFlush.enabled should be false");
    }
    if (getConfigBoolean(this.apiConfig, ["plugins", "entries", PLUGIN_ID, "hooks", "allowPromptInjection"]) === false) {
      runtimeIssues.push(`plugins.entries.${PLUGIN_ID}.hooks.allowPromptInjection should not be false`);
    }
    if (!this.config.recallEnabled) {
      runtimeIssues.push("plugin config recallEnabled=false");
    }

    const workspaceDir = this.resolveWorkspaceDir();
    const workspaceBootstrapPresent = [
      "AGENTS.md",
      "SOUL.md",
      "TOOLS.md",
      "IDENTITY.md",
      "USER.md",
      "HEARTBEAT.md",
      "BOOTSTRAP.md",
      "MEMORY.md",
    ].some((name) => existsSync(join(workspaceDir, name)));

    return {
      slotOwner,
      dynamicMemoryRuntime: slotOwner === PLUGIN_ID ? "ClawXMemory" : slotOwner || "unbound",
      workspaceBootstrapPresent,
      memoryRuntimeHealthy: runtimeIssues.length === 0,
      runtimeIssues,
    };
  }

  private logMemoryBoundaryDiagnostics(): void {
    const diagnostics = this.collectMemoryBoundaryDiagnostics();
    if (diagnostics.memoryRuntimeHealthy) {
      this.logger.info?.("[clawxmemory] dynamic memory runtime ready: active memory slot is ClawXMemory.");
      return;
    }
    this.logger.warn?.(
      `[clawxmemory] dynamic memory runtime issues detected: ${diagnostics.runtimeIssues.join(" | ")}`,
    );
  }
}
