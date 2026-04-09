/* ── i18n ────────────────────────────────────────────────── */

const LOCALES = {
  zh: {
    "nav.project": "项目记忆",
    "nav.feedback": "协作反馈",
    "nav.user": "用户画像",
    "nav.memory_trace": "记忆追踪",
    "nav.lastIndexed": "最近索引",
    "nav.waiting": "等待索引",
    "topbar.title": "ClawXMemory",
    "topbar.idle": "等待操作",
    "topbar.refresh": "刷新",
    "topbar.build": "索引同步",
    "topbar.dream": "记忆 Dream",
    "topbar.overview": "仪表盘",
    "topbar.settings": "设置",
    "topbar.commandCenter": "画布视图",
    "topbar.listView": "列表视图",
    "stream.searchPlaceholder": "搜索当前视图",
    "stream.search": "搜索",
    "stream.clear": "清空",
    "stream.items": "{0} 条",
    "detail.title": "记录详情",
    "detail.empty": "选择一条记忆查看详情",
    "detail.summary": "Summary",
    "detail.preferences": "Preferences",
    "detail.constraints": "Constraints",
    "detail.relationships": "Relationships",
    "detail.notes": "Notes",
    "detail.rule": "Rule",
    "detail.why": "Why",
    "detail.howToApply": "How to apply",
    "detail.currentStage": "Current Stage",
    "detail.decisions": "Decisions",
    "detail.nextSteps": "Next Steps",
    "detail.blockers": "Blockers",
    "detail.timeline": "Timeline",
    "detail.sourceFiles": "Source Files",
    "detail.feedbackRules": "Feedback Rules",
    "detail.projectFiles": "项目记忆文件",
    "detail.feedbackFiles": "协作反馈文件",
    "detail.backToProject": "返回项目",
    "detail.backToList": "返回项目列表",
    "settings.advanced": "高级参数",
    "settings.maxLatency": "Selected Memory Files",
    "settings.autoIndexInterval": "自动索引间隔（小时）",
    "settings.autoDreamInterval": "自动 Dream 间隔（小时）",
    "settings.autoDreamMinL1": "Auto Dream Min Changed Files",
    "settings.dreamRebuildTimeout": "Dream Organize Timeout（秒）",
    "settings.dreamRebuildTimeoutHint": "默认 180 秒；0 表示不设超时。该设置同时作用于手动 Dream 和自动 Dream。",
    "settings.scheduleHint": "0 表示关闭自动任务",
    "settings.autoDreamHint": "只有变更的记忆文件达到门槛时，自动 Dream 才会真正执行。",
    "settings.save": "保存设置",
    "settings.theme": "主题",
    "settings.language": "语言",
    "settings.accentColor": "主题色",
    "settings.dataManagement": "数据管理",
    "settings.export": "导出记忆",
    "settings.import": "导入记忆",
    "settings.clear": "清除记忆",
    "settings.theme.light": "浅色",
    "settings.theme.dark": "深色",
    "settings.theme.auto": "跟随系统",
    "overview.title": "运行概览",
    "overview.group.memory": "记忆概况",
    "overview.group.recall": "最近召回与 Dream",
    "overview.group.health": "系统健康",
    "overview.totalMemoryFiles": "Memory Files",
    "overview.totalProjectMemories": "Project",
    "overview.totalFeedbackMemories": "Feedback",
    "overview.totalUserMemories": "User",
    "overview.pendingL0": "待索引会话",
    "overview.changedFilesSinceLastDream": "Dream 后变更文件",
    "overview.queued": "排队 Session",
    "overview.lastRecallMs": "最近召回耗时",
    "overview.lastRecallMode": "召回模式",
    "overview.lastRecallPath": "召回路径",
    "overview.lastRecallEnough": "停止层级",
    "overview.lastDreamAt": "最近 Dream",
    "overview.lastDreamStatus": "Dream 状态",
    "overview.lastDreamSummary": "Dream 摘要",
    "overview.runtimeHealth": "运行时健康",
    "overview.runtimeIssues": "运行时问题",
    "overview.startupRepair": "启动修复",
    "overview.slotOwner": "Memory Slot",
    "confirm.sync.title": "索引同步",
    "confirm.sync.body": "将扫描最近对话并把可归类内容写入文件式 memory。",
    "confirm.sync.ok": "开始同步",
    "confirm.dream.title": "记忆 Dream",
    "confirm.dream.body": "Dream 会整理当前 MEMORY.md 和记忆文件，修复索引并合并重复记忆。",
    "confirm.dream.ok": "开始 Dream",
    "confirm.clear.title": "清除记忆",
    "confirm.clear.body": "此操作将删除所有记忆数据，且不可撤销。确定继续吗？",
    "confirm.clear.ok": "确认清除",
    "confirm.import.title": "导入记忆",
    "confirm.import.body": "这会用导入文件覆盖当前本地记忆。确定继续吗？",
    "confirm.import.ok": "确认导入",
    "confirm.cancel": "取消",
    "status.refreshing": "刷新中…",
    "status.refreshed": "已刷新",
    "status.loading": "加载中…",
    "status.ready": "已就绪",
    "status.building": "同步中…",
    "status.built": "已同步 · captured sessions {0} / written memories {1} / project {2} / feedback {3} / user {4}",
    "status.dreaming": "Dream 整理中…",
    "status.dreamed": "Dream 完成 · {0}",
    "status.dreamFailed": "Dream 失败：{0}",
    "status.clearing": "清空中…",
    "status.cleared": "已清空本地记忆",
    "status.exporting": "导出中…",
    "status.exported": "已导出记忆 · {0}",
    "status.exportFailed": "导出失败：{0}",
    "status.importing": "导入中…",
    "status.imported": "已导入 · memory files {0} / project {1} / feedback {2} / user {3}",
    "status.importInvalid": "导入文件不是有效的记忆包",
    "status.importFailed": "导入失败：{0}",
    "status.settingsSaved": "设置已保存 · {0}",
    "status.searching": "搜索中…",
    "status.searched": "搜索完成",
    "status.loadFail": "加载失败：{0}",
    "level.project.label": "项目记忆",
    "level.feedback.label": "协作反馈",
    "level.user.label": "用户画像",
    "level.memory_trace.label": "记忆追踪",
    "level.project.empty": "暂无项目记忆",
    "level.feedback.empty": "暂无协作反馈",
    "level.user.empty": "暂无用户画像记忆",
    "level.memory_trace.empty": "暂无记忆追踪案例",
    "board.project": "项目记忆",
    "board.feedback": "协作反馈",
    "board.user": "用户画像",
    "board.memoryTrace": "记忆追踪",
    "board.user.empty": "暂无可展示的用户画像",
    "board.user.sources": "来源文件",
    "board.memoryTrace.empty": "暂无真实对话案例",
    "board.memoryTrace.selectCase": "选择案例",
    "board.memoryTrace.query": "问题",
    "board.memoryTrace.session": "Session",
    "board.memoryTrace.mode": "模式",
    "board.memoryTrace.status": "状态",
    "board.memoryTrace.injected": "注入",
    "board.memoryTrace.enoughAt": "停止层级",
    "board.memoryTrace.started": "开始",
    "board.memoryTrace.finished": "结束",
    "board.memoryTrace.path": "召回路径",
    "board.memoryTrace.context": "注入上下文",
    "board.memoryTrace.tools": "工具活动",
    "board.memoryTrace.answer": "最终回答",
    "board.memoryTrace.finalNote": "最终记忆笔记",
    "board.memoryTrace.flow": "推理过程",
    "board.memoryTrace.noTrace": "该案例没有可展示的 recall trace。",
    "board.memoryTrace.noStep": "展开步骤查看结构化细节与完整 prompt。",
    "board.project.feedbackCount": "{0} 条反馈",
    "board.project.memoryCount": "{0} 条项目记忆",
    "board.memoryTrace.promptDebug": "完整 Prompt 调试",
    "board.memoryTrace.systemPrompt": "System Prompt",
    "board.memoryTrace.userPrompt": "User Prompt",
    "board.memoryTrace.rawOutput": "模型原始输出",
    "board.memoryTrace.parsedResult": "解析结果",
    "meta.type": "Type",
    "meta.scope": "Scope",
    "meta.projectId": "Project",
    "meta.updatedAt": "Updated",
    "meta.path": "Path",
    "meta.file": "File",
    "meta.counts": "文件数",
    "meta.global": "Global",
    "meta.project": "Project",
    "common.none": "无",
    "common.unknown": "未知",
    "common.yes": "是",
    "common.no": "否",
    "type.user": "User",
    "type.feedback": "Feedback",
    "type.project": "Project",
    "scope.global": "Global",
    "scope.project": "Project",
    "recall.llm": "LLM 快选",
    "recall.local_fallback": "本地降级",
    "recall.none": "无注入",
    "path.auto": "自动回答",
    "path.explicit": "显式检索",
    "path.shadow": "后台备案",
    "dream.status.never": "尚未运行",
    "dream.status.running": "运行中",
    "dream.status.success": "成功",
    "dream.status.skipped": "已跳过",
    "dream.status.failed": "失败",
    "startup.idle": "空闲",
    "startup.running": "修复中",
    "startup.failed": "失败",
    "runtime.healthy": "正常",
    "runtime.unhealthy": "异常",
    "enough.none": "无",
    "enough.manifest": "Manifest",
    "enough.file": "File",
    "enough.profile": "画像",
    "enough.l2": "Legacy L2",
    "enough.l1": "Legacy L1",
    "enough.l0": "Legacy L0",
    "project.planned": "计划中",
    "project.in_progress": "进行中",
    "project.done": "已完成",
    "trace.step.recall_start": "Recall Start",
    "trace.step.memory_gate": "Memory Gate",
    "trace.step.user_base_loaded": "User Base Loaded",
    "trace.step.project_resolved": "Project Resolved",
    "trace.step.manifest_built": "Manifest Built",
    "trace.step.manifest_selected": "Manifest Selected",
    "trace.step.files_loaded": "Files Loaded",
    "trace.step.context_rendered": "Context Rendered",
    "trace.step.recall_skipped": "Recall Skipped",
    "trace.step.cache_hit": "Cache Hit",
    "trace.step.unknown": "Trace Step",
  },
  en: {
    "nav.project": "Project",
    "nav.feedback": "Feedback",
    "nav.user": "User",
    "nav.memory_trace": "Trace",
    "nav.lastIndexed": "Last Indexed",
    "nav.waiting": "Waiting",
    "topbar.title": "ClawXMemory",
    "topbar.idle": "Waiting for action",
    "topbar.refresh": "Refresh",
    "topbar.build": "Index Sync",
    "topbar.dream": "Dream",
    "topbar.overview": "Overview",
    "topbar.settings": "Settings",
    "topbar.commandCenter": "Canvas",
    "topbar.listView": "List",
    "stream.searchPlaceholder": "Search current view",
    "stream.search": "Search",
    "stream.clear": "Clear",
    "stream.items": "{0} items",
    "detail.title": "Record Detail",
    "detail.empty": "Select a memory to inspect",
    "detail.summary": "Summary",
    "detail.preferences": "Preferences",
    "detail.constraints": "Constraints",
    "detail.relationships": "Relationships",
    "detail.notes": "Notes",
    "detail.rule": "Rule",
    "detail.why": "Why",
    "detail.howToApply": "How to apply",
    "detail.currentStage": "Current Stage",
    "detail.decisions": "Decisions",
    "detail.nextSteps": "Next Steps",
    "detail.blockers": "Blockers",
    "detail.timeline": "Timeline",
    "detail.sourceFiles": "Source Files",
    "detail.feedbackRules": "Feedback Rules",
    "detail.projectFiles": "Project Files",
    "detail.feedbackFiles": "Feedback Files",
    "detail.backToProject": "Back to Project",
    "detail.backToList": "Back to Projects",
    "settings.advanced": "Advanced",
    "settings.maxLatency": "Selected Memory Files",
    "settings.autoIndexInterval": "Auto Index Interval (hours)",
    "settings.autoDreamInterval": "Auto Dream Interval (hours)",
    "settings.autoDreamMinL1": "Auto Dream Min Changed Files",
    "settings.dreamRebuildTimeout": "Dream Organize Timeout (sec)",
    "settings.dreamRebuildTimeoutHint": "Default 180 seconds. 0 disables the timeout for both manual and auto Dream.",
    "settings.scheduleHint": "0 disables the schedule",
    "settings.autoDreamHint": "Auto Dream only runs when enough memory files changed.",
    "settings.save": "Save Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.accentColor": "Accent",
    "settings.dataManagement": "Data",
    "settings.export": "Export Memory",
    "settings.import": "Import Memory",
    "settings.clear": "Clear Memory",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.auto": "Auto",
    "overview.title": "Runtime Overview",
    "overview.group.memory": "Memory Overview",
    "overview.group.recall": "Latest Recall & Dream",
    "overview.group.health": "System Health",
    "overview.totalMemoryFiles": "Memory Files",
    "overview.totalProjectMemories": "Project",
    "overview.totalFeedbackMemories": "Feedback",
    "overview.totalUserMemories": "User",
    "overview.pendingL0": "Pending Sessions",
    "overview.changedFilesSinceLastDream": "Changed Since Dream",
    "overview.queued": "Queued Sessions",
    "overview.lastRecallMs": "Last Recall",
    "overview.lastRecallMode": "Recall Mode",
    "overview.lastRecallPath": "Recall Path",
    "overview.lastRecallEnough": "Enough At",
    "overview.lastDreamAt": "Last Dream",
    "overview.lastDreamStatus": "Dream Status",
    "overview.lastDreamSummary": "Dream Summary",
    "overview.runtimeHealth": "Runtime Health",
    "overview.runtimeIssues": "Runtime Issues",
    "overview.startupRepair": "Startup Repair",
    "overview.slotOwner": "Memory Slot",
    "confirm.sync.title": "Index Sync",
    "confirm.sync.body": "This scans recent chats and writes classified items into file-based memory.",
    "confirm.sync.ok": "Start Sync",
    "confirm.dream.title": "Dream",
    "confirm.dream.body": "Dream will organize MEMORY.md files, repair manifests, and merge duplicate memories.",
    "confirm.dream.ok": "Start Dream",
    "confirm.clear.title": "Clear Memory",
    "confirm.clear.body": "This deletes all stored memory data and cannot be undone. Continue?",
    "confirm.clear.ok": "Clear",
    "confirm.import.title": "Import Memory",
    "confirm.import.body": "This replaces the current local memory with the imported bundle. Continue?",
    "confirm.import.ok": "Import",
    "confirm.cancel": "Cancel",
    "status.refreshing": "Refreshing…",
    "status.refreshed": "Refreshed",
    "status.loading": "Loading…",
    "status.ready": "Ready",
    "status.building": "Syncing…",
    "status.built": "Sync complete · captured sessions {0} / written memories {1} / project {2} / feedback {3} / user {4}",
    "status.dreaming": "Dream organizing…",
    "status.dreamed": "Dream complete · {0}",
    "status.dreamFailed": "Dream failed: {0}",
    "status.clearing": "Clearing…",
    "status.cleared": "Local memory cleared",
    "status.exporting": "Exporting…",
    "status.exported": "Memory exported · {0}",
    "status.exportFailed": "Export failed: {0}",
    "status.importing": "Importing…",
    "status.imported": "Import complete · memory files {0} / project {1} / feedback {2} / user {3}",
    "status.importInvalid": "The selected file is not a valid memory bundle",
    "status.importFailed": "Import failed: {0}",
    "status.settingsSaved": "Settings saved · {0}",
    "status.searching": "Searching…",
    "status.searched": "Search complete",
    "status.loadFail": "Load failed: {0}",
    "level.project.label": "Project Memory",
    "level.feedback.label": "Feedback Rules",
    "level.user.label": "User Portrait",
    "level.memory_trace.label": "Memory Trace",
    "level.project.empty": "No project memories yet",
    "level.feedback.empty": "No feedback memories yet",
    "level.user.empty": "No user memories yet",
    "level.memory_trace.empty": "No traced conversations yet",
    "board.project": "Project Memory",
    "board.feedback": "Feedback Rules",
    "board.user": "User Portrait",
    "board.memoryTrace": "Memory Trace",
    "board.user.empty": "No user portrait is available yet",
    "board.user.sources": "Source Files",
    "board.memoryTrace.empty": "No real traced conversations yet",
    "board.memoryTrace.selectCase": "Select Case",
    "board.memoryTrace.query": "Query",
    "board.memoryTrace.session": "Session",
    "board.memoryTrace.mode": "Mode",
    "board.memoryTrace.status": "Status",
    "board.memoryTrace.injected": "Injected",
    "board.memoryTrace.enoughAt": "Enough At",
    "board.memoryTrace.started": "Started",
    "board.memoryTrace.finished": "Finished",
    "board.memoryTrace.path": "Recall Path",
    "board.memoryTrace.context": "Injected Context",
    "board.memoryTrace.tools": "Tool Activity",
    "board.memoryTrace.answer": "Final Answer",
    "board.memoryTrace.finalNote": "Final Memory Note",
    "board.memoryTrace.flow": "Trace Flow",
    "board.memoryTrace.noTrace": "This case does not contain a retrieval trace.",
    "board.memoryTrace.noStep": "Expand a step to inspect structured details and prompt debug.",
    "board.project.feedbackCount": "{0} feedback",
    "board.project.memoryCount": "{0} project memories",
    "board.memoryTrace.promptDebug": "Prompt Debug",
    "board.memoryTrace.systemPrompt": "System Prompt",
    "board.memoryTrace.userPrompt": "User Prompt",
    "board.memoryTrace.rawOutput": "Raw Output",
    "board.memoryTrace.parsedResult": "Parsed Result",
    "meta.type": "Type",
    "meta.scope": "Scope",
    "meta.projectId": "Project",
    "meta.updatedAt": "Updated",
    "meta.path": "Path",
    "meta.file": "File",
    "meta.counts": "Counts",
    "meta.global": "Global",
    "meta.project": "Project",
    "common.none": "None",
    "common.unknown": "Unknown",
    "common.yes": "Yes",
    "common.no": "No",
    "type.user": "User",
    "type.feedback": "Feedback",
    "type.project": "Project",
    "scope.global": "Global",
    "scope.project": "Project",
    "recall.llm": "LLM Selection",
    "recall.local_fallback": "Local Fallback",
    "recall.none": "None",
    "path.auto": "Auto",
    "path.explicit": "Explicit",
    "path.shadow": "Shadow",
    "dream.status.never": "Never",
    "dream.status.running": "Running",
    "dream.status.success": "Success",
    "dream.status.skipped": "Skipped",
    "dream.status.failed": "Failed",
    "startup.idle": "Idle",
    "startup.running": "Running",
    "startup.failed": "Failed",
    "runtime.healthy": "Healthy",
    "runtime.unhealthy": "Issues",
    "enough.none": "None",
    "enough.manifest": "Manifest",
    "enough.file": "File",
    "enough.profile": "Profile",
    "enough.l2": "Legacy L2",
    "enough.l1": "Legacy L1",
    "enough.l0": "Legacy L0",
    "project.planned": "Planned",
    "project.in_progress": "In Progress",
    "project.done": "Done",
    "trace.step.recall_start": "Recall Start",
    "trace.step.memory_gate": "Memory Gate",
    "trace.step.user_base_loaded": "User Base Loaded",
    "trace.step.project_resolved": "Project Resolved",
    "trace.step.manifest_built": "Manifest Built",
    "trace.step.manifest_selected": "Manifest Selected",
    "trace.step.files_loaded": "Files Loaded",
    "trace.step.context_rendered": "Context Rendered",
    "trace.step.recall_skipped": "Recall Skipped",
    "trace.step.cache_hit": "Cache Hit",
    "trace.step.unknown": "Trace Step",
  },
};

/* ── constants & state ─────────────────────────────────── */

const STORAGE = {
  theme: "clawxmemory.ui.theme",
  accent: "clawxmemory.ui.accent",
  locale: "clawxmemory.ui.locale",
};

const LEVELS = ["project", "user", "memory_trace"];
const DEFAULT_SETTINGS = {
  reasoningMode: "answer_first",
  recallTopK: 5,
  autoIndexIntervalMinutes: 60,
  autoDreamIntervalMinutes: 360,
  autoDreamMinNewL1: 10,
  dreamProjectRebuildTimeoutMs: 180000,
};

const root = document.documentElement;
const body = document.body;
const appShell = document.querySelector(".app-shell");
const appScrim = document.getElementById("appScrim");

const boardNavTabs = document.getElementById("boardNavTabs");
const navMenuTrigger = document.getElementById("navMenuTrigger");
const settingsPopover = document.getElementById("settingsPopover");
const advancedSettingsToggle = document.getElementById("advancedSettingsToggle");
const advancedSettingsBody = document.getElementById("advancedSettingsBody");
const dataManagementToggle = document.getElementById("dataManagementToggle");
const dataManagementBody = document.getElementById("dataManagementBody");
const overviewToggleBtn = document.getElementById("overviewToggleBtn");
const overviewPanel = document.getElementById("overviewPanel");
const overviewCloseBtn = document.getElementById("overviewCloseBtn");
const overviewCards = document.getElementById("overviewCards");
const refreshBtn = document.getElementById("refreshBtn");
const buildNowBtn = document.getElementById("buildNowBtn");
const dreamRunBtn = document.getElementById("dreamRunBtn");
const navLastIndexed = document.getElementById("navLastIndexed");
const activityText = document.getElementById("activityText");
const browserTitle = document.getElementById("browserTitle");
const browserMeta = document.getElementById("browserMeta");
const listQueryInput = document.getElementById("listQueryInput");
const listSearchBtn = document.getElementById("listSearchBtn");
const listClearBtn = document.getElementById("listClearBtn");
const projectListBoard = document.getElementById("projectListBoard");
const projectDetailBoard = document.getElementById("projectDetailBoard");
const projectDetailBackBtn = document.getElementById("projectDetailBackBtn");
const projectDetailTitle = document.getElementById("projectDetailTitle");
const projectDetailSubtitle = document.getElementById("projectDetailSubtitle");
const projectDetailMeta = document.getElementById("projectDetailMeta");
const projectDetailBody = document.getElementById("projectDetailBody");
const fileDetailBoard = document.getElementById("fileDetailBoard");
const fileDetailBackBtn = document.getElementById("fileDetailBackBtn");
const fileDetailTitle = document.getElementById("fileDetailTitle");
const fileDetailSubtitle = document.getElementById("fileDetailSubtitle");
const fileDetailMeta = document.getElementById("fileDetailMeta");
const fileDetailBody = document.getElementById("fileDetailBody");
const userBoard = document.getElementById("userBoard");
const memoryTraceBoard = document.getElementById("memoryTraceBoard");
const listSearchRow = document.getElementById("listSearchRow");
const maxAutoReplyLatencyInput = document.getElementById("maxAutoReplyLatencyInput");
const autoIndexIntervalHoursInput = document.getElementById("autoIndexIntervalHoursInput");
const autoDreamIntervalHoursInput = document.getElementById("autoDreamIntervalHoursInput");
const autoDreamMinL1Input = document.getElementById("autoDreamMinL1Input");
const dreamRebuildTimeoutSecondsInput = document.getElementById("dreamRebuildTimeoutSecondsInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const themeToggle = document.getElementById("themeToggle");
const langToggle = document.getElementById("langToggle");
const accentPicker = document.getElementById("accentPicker");
const exportMemoryBtn = document.getElementById("exportMemoryBtn");
const importMemoryBtn = document.getElementById("importMemoryBtn");
const clearMemoryBtn = document.getElementById("clearMemoryBtn");
const importMemoryInput = document.getElementById("importMemoryInput");
const navToggleBtn = document.getElementById("navToggleBtn");
const navCloseBtn = document.getElementById("navCloseBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalConfirm = document.getElementById("modalConfirm");
const modalCancel = document.getElementById("modalCancel");

const state = {
  locale: localStorage.getItem(STORAGE.locale) || "zh",
  theme: localStorage.getItem(STORAGE.theme) || "light",
  accent: localStorage.getItem(STORAGE.accent) || "blue",
  mainView: "project-list",
  overview: {},
  settings: { ...DEFAULT_SETTINGS },
  queries: {
    project_list: "",
    project_detail: "",
    memory_trace: "",
  },
  projectGroups: [],
  projectGroupsLoaded: false,
  userSummary: null,
  userSummaryLoaded: false,
  recordCache: new Map(),
  cases: [],
  caseRequestLoaded: false,
  caseDetailCache: new Map(),
  selectedCaseId: "",
  activeTraceStepId: "",
  selectedProjectId: "",
  selectedFileId: "",
  selectedFileType: "",
  settingsPopoverOpen: false,
  traceSelectorOpen: false,
  modalResolver: null,
};

/* ── utils ─────────────────────────────────────────────── */

function t(key, ...args) {
  const dict = LOCALES[state.locale] || LOCALES.zh;
  const fallback = LOCALES.en[key] || LOCALES.zh[key] || key;
  return String(dict[key] ?? fallback).replace(/\{(\d+)\}/g, (_, index) => {
    const value = args[Number(index)];
    return value == null ? "" : String(value);
  });
}

function setActivity(message, ...args) {
  if (!activityText) return;
  activityText.textContent = LOCALES[state.locale][message] || LOCALES.en[message]
    ? t(message, ...args)
    : String(message);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function clearNode(node) {
  if (node) node.replaceChildren();
  return node;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  return String(value || "").trim();
}

function escapeQueryValue(value) {
  return encodeURIComponent(String(value || ""));
}

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "0";
  return new Intl.NumberFormat(state.locale === "zh" ? "zh-CN" : "en-US").format(value);
}

function formatDateTime(value) {
  const raw = normalizeText(value);
  if (!raw) return t("common.none");
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat(state.locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDurationMs(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return t("common.none");
  return `${Math.max(0, Math.round(value))} ms`;
}

function readListFromSection(lines) {
  return safeArray(lines)
    .map((line) => normalizeText(line).replace(/^- /, ""))
    .filter(Boolean);
}

function readTextFromSection(lines) {
  return safeArray(lines).map((line) => String(line)).join("\n").trim();
}

function parseSections(content) {
  const sections = new Map();
  let current = "";
  String(content || "").split("\n").forEach((line) => {
    const match = /^##\s+(.+?)\s*$/.exec(line.trim());
    if (match) {
      current = match[1];
      sections.set(current, []);
      return;
    }
    const bucket = sections.get(current) || [];
    bucket.push(line);
    sections.set(current, bucket);
  });
  return sections;
}

function formatRecallMode(mode) {
  if (mode === "llm" || mode === "local_fallback" || mode === "none") return t(`recall.${mode}`);
  return normalizeText(mode) || t("common.none");
}

function formatRecallPath(path) {
  if (path === "auto" || path === "explicit" || path === "shadow") return t(`path.${path}`);
  return normalizeText(path) || t("common.none");
}

function formatEnoughAt(value) {
  if (!value) return t("common.none");
  const key = `enough.${value}`;
  return LOCALES[state.locale][key] || LOCALES.en[key] ? t(key) : String(value);
}

function formatDreamStatus(value) {
  if (!value) return t("dream.status.never");
  const key = `dream.status.${value}`;
  return LOCALES[state.locale][key] || LOCALES.en[key] ? t(key) : String(value);
}

function formatStartupRepair(value) {
  if (!value || value === "idle") return t("startup.idle");
  if (value === "running") return t("startup.running");
  if (value === "failed") return t("startup.failed");
  return String(value);
}

function formatRuntimeHealth(value) {
  return value ? t("runtime.healthy") : t("runtime.unhealthy");
}

function inferProjectStatus(entry, record) {
  const haystack = [
    entry?.description,
    record?.content,
  ].join(" ").toLowerCase();
  if (/(done|completed|已完成|上线|发布完成|closed)/.test(haystack)) return "done";
  if (/(planned|plan|待开始|计划中|todo|backlog)/.test(haystack)) return "planned";
  return "in_progress";
}

function getPrimaryProjectEntry(group) {
  return safeArray(group?.projectEntries)[0] || null;
}

function inferProjectGroupStatus(group) {
  const normalized = normalizeText(group?.status).toLowerCase();
  if (normalized === "done" || normalized === "completed") return "done";
  if (normalized === "planned" || normalized === "plan") return "planned";
  return inferProjectStatus(getPrimaryProjectEntry(group));
}

function getVisibleProjectGroups() {
  const query = normalizeText(state.queries.project_list).toLowerCase();
  const groups = state.projectGroups;
  if (!query) return groups;
  return groups.filter((group) => {
    const haystack = [
      group.projectName,
      group.description,
      ...safeArray(group.aliases),
      ...safeArray(group.projectEntries).flatMap((entry) => [entry.name, entry.description]),
      ...safeArray(group.feedbackEntries).flatMap((entry) => [entry.name, entry.description]),
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function getCurrentLevel() {
  if (state.mainView === "user") return "user";
  if (state.mainView === "memory_trace") return "memory_trace";
  return "project";
}

function getNavPage() {
  if (state.mainView === "user") return "user";
  if (state.mainView === "memory_trace") return "memory_trace";
  return "project";
}

function getCurrentSearchKey() {
  if (state.mainView === "project-list") return "project_list";
  if (state.mainView === "project-detail") return "project_detail";
  if (state.mainView === "memory_trace") return "memory_trace";
  return "";
}

function getMemoryCount(level) {
  if (level === "project") return state.projectGroups.length;
  if (level === "user") return safeArray(state.userSummary?.files).length || Number(state.overview.totalUserMemories || 0);
  if (level === "memory_trace") return state.cases.length;
  return 0;
}

function getViewElement(view) {
  if (view === "project-list") return projectListBoard;
  if (view === "project-detail") return projectDetailBoard;
  if (view === "file-detail") return fileDetailBoard;
  if (view === "user") return userBoard;
  return memoryTraceBoard;
}

function isValidLevel(value) {
  return LEVELS.includes(value);
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    const attr = node.getAttribute("data-i18n-attr");
    if (attr) {
      node.setAttribute(attr, t(key));
      return;
    }
    node.textContent = t(key);
  });
}

/* ── theme, locale, layout state ──────────────────────── */

function applyTheme() {
  const theme = state.theme === "auto"
    ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : state.theme;
  root.dataset.theme = theme;
  root.dataset.accent = state.accent;
  root.lang = state.locale === "zh" ? "zh-CN" : "en";

  if (themeToggle) {
    themeToggle.querySelectorAll("[data-theme-value]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-theme-value") === state.theme);
      btn.setAttribute("title", t(`settings.theme.${btn.getAttribute("data-theme-value")}`));
    });
  }

  if (langToggle) {
    langToggle.querySelectorAll("[data-locale]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-locale") === state.locale);
    });
  }

  if (accentPicker) {
    accentPicker.querySelectorAll("[data-accent]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-accent") === state.accent);
    });
  }
}

function persistUiPrefs() {
  localStorage.setItem(STORAGE.theme, state.theme);
  localStorage.setItem(STORAGE.accent, state.accent);
  localStorage.setItem(STORAGE.locale, state.locale);
}

function updatePanels(panel = "") {
  if (panel) body.dataset.panel = panel;
  else delete body.dataset.panel;
}

function openPanel(panel) {
  updatePanels(panel);
}

function closePanels() {
  updatePanels("");
}

function openNav() {
  body.dataset.nav = "open";
}

function closeNav() {
  delete body.dataset.nav;
}

function toggleSection(toggleEl, bodyEl, open) {
  if (!toggleEl || !bodyEl) return;
  toggleEl.classList.toggle("open", open);
  bodyEl.classList.toggle("open", open);
}

function positionSettingsPopover() {
  if (!settingsPopover || !navMenuTrigger) return;
  const rect = navMenuTrigger.getBoundingClientRect();
  settingsPopover.style.left = `${Math.max(12, rect.left)}px`;
  settingsPopover.style.bottom = `${Math.max(12, window.innerHeight - rect.top + 8)}px`;
}

function setSettingsPopover(open) {
  state.settingsPopoverOpen = open;
  if (!settingsPopover) return;
  settingsPopover.classList.toggle("open", open);
  if (open) positionSettingsPopover();
}

/* ── modal ─────────────────────────────────────────────── */

function confirmAction({ title, body: description, confirmLabel }) {
  if (!modalOverlay || !modalTitle || !modalBody || !modalConfirm || !modalCancel) {
    return Promise.resolve(window.confirm(`${title}\n\n${description}`));
  }
  modalTitle.textContent = title;
  modalBody.textContent = description;
  modalConfirm.textContent = confirmLabel;
  modalCancel.textContent = t("confirm.cancel");
  modalOverlay.classList.add("open");
  return new Promise((resolve) => {
    state.modalResolver = resolve;
  });
}

function closeModal(result) {
  if (modalOverlay) modalOverlay.classList.remove("open");
  const resolver = state.modalResolver;
  state.modalResolver = null;
  if (resolver) resolver(Boolean(result));
}

/* ── api ───────────────────────────────────────────────── */

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

async function postJson(url, body = undefined) {
  const response = await fetch(url, {
    method: "POST",
    headers: body == null ? {} : { "content-type": "application/json" },
    ...(body == null ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

function extractDownloadFilename(response, fallback) {
  const disposition = response.headers.get("content-disposition") || "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  return match?.[1] || fallback;
}

/* ── data loading ──────────────────────────────────────── */

function invalidateMemoryCaches() {
  state.projectGroups = [];
  state.projectGroupsLoaded = false;
  state.userSummary = null;
  state.userSummaryLoaded = false;
  state.recordCache.clear();
}

async function loadSnapshot({ silent = false } = {}) {
  if (!silent) setActivity("status.refreshing");
  const snap = await fetchJson("./api/snapshot?limit=24");
  state.overview = snap.overview || {};
  state.settings = { ...DEFAULT_SETTINGS, ...(snap.settings || {}) };
  if (navLastIndexed) {
    navLastIndexed.textContent = state.overview.lastIndexedAt
      ? formatDateTime(state.overview.lastIndexedAt)
      : t("nav.waiting");
  }
  syncSettingsForm();
  renderOverview();
  renderNav();
  renderBrowserHeader();
  if (!silent) setActivity("status.refreshed");
}

async function loadProjectGroups({ force = false } = {}) {
  if (state.projectGroupsLoaded && !force) return state.projectGroups;
  const params = ["limit=100"];
  if (normalizeText(state.queries.project_list)) params.push(`q=${escapeQueryValue(state.queries.project_list)}`);
  state.projectGroups = safeArray(await fetchJson(`./api/projects?${params.join("&")}`));
  state.projectGroupsLoaded = true;
  return state.projectGroups;
}

async function loadUserSummary({ force = false } = {}) {
  if (state.userSummaryLoaded && !force) return state.userSummary;
  state.userSummary = await fetchJson("./api/memory/user-summary");
  state.userSummaryLoaded = true;
  return state.userSummary;
}

async function getMemoryRecord(id, { force = false } = {}) {
  if (!id) return null;
  if (!force && state.recordCache.has(id)) return state.recordCache.get(id);
  const records = await fetchJson(`./api/memory/get?ids=${escapeQueryValue(id)}`);
  const record = safeArray(records)[0] || null;
  if (record) state.recordCache.set(id, record);
  return record;
}

async function getMemoryRecords(ids, { force = false } = {}) {
  const uniqueIds = Array.from(new Set(safeArray(ids).map((id) => normalizeText(id)).filter(Boolean)));
  const missing = force ? uniqueIds : uniqueIds.filter((id) => !state.recordCache.has(id));
  if (missing.length) {
    const records = safeArray(await fetchJson(`./api/memory/get?ids=${escapeQueryValue(missing.join(","))}`));
    records.forEach((record) => {
      if (record?.relativePath) state.recordCache.set(record.relativePath, record);
    });
  }
  return uniqueIds.map((id) => state.recordCache.get(id)).filter(Boolean);
}

async function loadCases({ force = false } = {}) {
  if (state.caseRequestLoaded && !force) return state.cases;
  state.cases = safeArray(await fetchJson("./api/cases?limit=12"));
  state.caseRequestLoaded = true;
  if (!state.selectedCaseId && state.cases[0]) {
    state.selectedCaseId = state.cases[0].caseId;
  }
  if (state.selectedCaseId) {
    await loadCaseDetail(state.selectedCaseId);
  }
  renderNav();
  return state.cases;
}

async function loadCaseDetail(caseId, { force = false } = {}) {
  if (!caseId) return null;
  if (!force && state.caseDetailCache.has(caseId)) return state.caseDetailCache.get(caseId);
  const detail = await fetchJson(`./api/cases/${encodeURIComponent(caseId)}`);
  state.caseDetailCache.set(caseId, detail);
  if (!state.activeTraceStepId) {
    state.activeTraceStepId = safeArray(detail?.retrieval?.trace?.steps)[0]?.stepId || "";
  }
  return detail;
}

async function ensureActiveData({ force = false } = {}) {
  const level = getCurrentLevel();
  if (level === "project") {
    await loadProjectGroups({ force });
    return;
  }
  if (level === "user") {
    await loadUserSummary({ force });
    return;
  }
  if (level === "memory_trace") {
    await loadCases({ force });
  }
}

/* ── rendering helpers ─────────────────────────────────── */

function createEmptyState(message) {
  return el("div", "empty-state", message);
}

function createMetaChip(label, value) {
  const chip = el("div", "meta-chip");
  const labelEl = el("span", "meta-label", `${label}:`);
  const valueEl = el("span", "", value);
  chip.append(labelEl, valueEl);
  return chip;
}

function appendTextSection(container, label, text) {
  const value = normalizeText(text);
  if (!value) return;
  const section = el("section", "detail-section");
  section.append(el("h4", "", label));
  section.append(el("p", "", value));
  container.append(section);
}

function appendListSection(container, label, items) {
  const values = safeArray(items).map((item) => normalizeText(item)).filter(Boolean);
  if (values.length === 0) return;
  const section = el("section", "detail-section");
  section.append(el("h4", "", label));
  const list = el("ul");
  values.forEach((item) => {
    list.append(el("li", "", item));
  });
  section.append(list);
  container.append(section);
}

function createEntryCard({ title, subtitle, badge, meta, active = false, onClick }) {
  const card = el("button", "entry-card");
  card.type = "button";
  if (active) card.classList.add("active");
  const top = el("div", "entry-topline");
  top.append(el("div", "entry-title", title));
  if (badge) top.append(el("span", "entry-badge", badge));
  card.append(top);
  if (subtitle) card.append(el("div", "entry-subtitle", subtitle));
  if (meta) card.append(el("div", "entry-meta", meta));
  if (onClick) card.addEventListener("click", onClick);
  return card;
}

function createBoardGroup(title, count, children) {
  const group = el("section", "board-group");
  const header = el("div", "board-group-header");
  header.append(el("h4", "", title));
  header.append(el("span", "board-group-count", String(count)));
  const grid = el("div", "board-card-grid");
  children.forEach((child) => grid.append(child));
  group.append(header, grid);
  return group;
}

function createBoardCard(entry, { status, active = false, subtitle, meta, onClick }) {
  const card = el("button", "board-card");
  card.type = "button";
  if (status) card.dataset.status = status;
  if (active) card.classList.add("active");
  if (onClick) card.addEventListener("click", onClick);
  card.append(el("div", "board-card-title", entry.name || entry.file || t("common.unknown")));
  if (status) {
    const badge = el("span", "board-card-status", t(`project.${status}`));
    badge.dataset.status = status;
    card.append(badge);
  }
  card.append(el("div", "board-card-body", subtitle || entry.description || t("common.none")));
  const metaParts = normalizeText(meta)
    ? [meta]
    : [formatDateTime(entry.updatedAt), ...(entry.projectId ? [entry.projectId] : [])];
  card.append(el("div", "board-card-meta", metaParts.join(" · ")));
  return card;
}

/* ── overview ──────────────────────────────────────────── */

function createOverviewGroup(title, bodyNode) {
  const group = el("section", "ov-group");
  const head = el("div", "ov-group-head");
  head.append(el("span", "ov-group-icon", "•"));
  head.append(el("span", "ov-group-title", title));
  group.append(head, bodyNode);
  return group;
}

function createHeroRow(cells) {
  const row = el("div", "ov-hero-row");
  cells.forEach((cell) => {
    const item = el("div", "ov-hero-cell");
    item.append(el("div", "ov-hero-value", cell.value));
    item.append(el("div", "ov-hero-label", cell.label));
    if (cell.note) item.append(el("div", "ov-hero-note", cell.note));
    row.append(item);
  });
  return row;
}

function createMetricGrid(cells) {
  const grid = el("div", "ov-metric-grid");
  cells.forEach((cell) => {
    const item = el("div", "ov-metric-cell");
    const left = el("div", "ov-metric-left");
    left.append(el("div", "ov-metric-label", cell.label));
    if (cell.note) left.append(el("div", "ov-metric-note", cell.note));
    const right = el("div", "ov-metric-val", cell.value);
    if (cell.tone) right.dataset.tone = cell.tone;
    item.append(left, right);
    grid.append(item);
  });
  return grid;
}

function renderOverview() {
  if (!overviewCards) return;
  const overview = state.overview || {};
  const memoryGroup = createOverviewGroup(
    t("overview.group.memory"),
    createHeroRow([
      { value: formatNumber(overview.totalMemoryFiles || 0), label: t("overview.totalMemoryFiles") },
      { value: formatNumber(overview.totalProjectMemories || 0), label: t("overview.totalProjectMemories") },
      { value: formatNumber(overview.totalFeedbackMemories || 0), label: t("overview.totalFeedbackMemories") },
      { value: formatNumber(overview.totalUserMemories || 0), label: t("overview.totalUserMemories") },
      { value: formatNumber(overview.pendingL0 || 0), label: t("overview.pendingL0") },
      { value: formatNumber(overview.changedFilesSinceLastDream || 0), label: t("overview.changedFilesSinceLastDream") },
    ]),
  );

  const recallGroup = createOverviewGroup(
    t("overview.group.recall"),
    createMetricGrid([
      { label: t("overview.queued"), value: formatNumber(overview.queuedSessions || 0) },
      { label: t("overview.lastRecallMs"), value: formatDurationMs(overview.lastRecallMs || 0) },
      { label: t("overview.lastRecallMode"), value: formatRecallMode(overview.lastRecallMode || "none") },
      { label: t("overview.lastRecallPath"), value: formatRecallPath(overview.lastRecallPath) },
      { label: t("overview.lastRecallEnough"), value: formatEnoughAt(overview.lastRecallEnoughAt) },
      { label: t("overview.lastDreamAt"), value: formatDateTime(overview.lastDreamAt) },
      { label: t("overview.lastDreamStatus"), value: formatDreamStatus(overview.lastDreamStatus) },
      { label: t("overview.lastDreamSummary"), value: normalizeText(overview.lastDreamSummary) || t("common.none") },
    ]),
  );

  const issueCount = safeArray(overview.runtimeIssues).length;
  const healthGroup = createOverviewGroup(
    t("overview.group.health"),
    createMetricGrid([
      {
        label: t("overview.runtimeHealth"),
        value: formatRuntimeHealth(Boolean(overview.memoryRuntimeHealthy)),
        tone: overview.memoryRuntimeHealthy === false ? "danger" : "success",
      },
      {
        label: t("overview.runtimeIssues"),
        value: issueCount ? String(issueCount) : t("common.none"),
        tone: issueCount ? "warning" : "success",
      },
      { label: t("overview.startupRepair"), value: formatStartupRepair(overview.startupRepairStatus) },
      { label: t("overview.slotOwner"), value: normalizeText(overview.slotOwner) || t("common.none") },
    ]),
  );

  clearNode(overviewCards).append(memoryGroup, recallGroup, healthGroup);
}

/* ── project / file detail pages ──────────────────────── */

function fillRecordDetail(metaNode, bodyNode, record) {
  clearNode(metaNode);
  metaNode.append(
    createMetaChip(t("meta.type"), t(`type.${record.type}`)),
    createMetaChip(t("meta.scope"), t(`scope.${record.scope}`)),
    ...(record.projectId ? [createMetaChip(t("meta.projectId"), record.projectId)] : []),
    createMetaChip(t("meta.updatedAt"), formatDateTime(record.updatedAt)),
    createMetaChip(t("meta.path"), record.relativePath || t("common.none")),
  );
  const sections = parseSections(record.content);
  clearNode(bodyNode);

  if (record.type === "user") {
    appendTextSection(bodyNode, t("detail.summary"), readTextFromSection(sections.get("Summary")) || record.description);
    appendListSection(bodyNode, t("detail.preferences"), readListFromSection(sections.get("Preferences")));
    appendListSection(bodyNode, t("detail.constraints"), readListFromSection(sections.get("Constraints")));
    appendListSection(bodyNode, t("detail.relationships"), readListFromSection(sections.get("Relationships")));
    appendListSection(bodyNode, t("detail.notes"), readListFromSection(sections.get("Notes")));
  } else if (record.type === "feedback") {
    appendTextSection(bodyNode, t("detail.rule"), readTextFromSection(sections.get("Rule")) || record.description);
    appendTextSection(bodyNode, t("detail.why"), readTextFromSection(sections.get("Why")));
    appendTextSection(bodyNode, t("detail.howToApply"), readTextFromSection(sections.get("How to apply")));
    appendListSection(bodyNode, t("detail.notes"), readListFromSection(sections.get("Notes")));
  } else {
    appendTextSection(bodyNode, t("detail.currentStage"), readTextFromSection(sections.get("Current Stage")) || record.description);
    appendListSection(bodyNode, t("detail.decisions"), readListFromSection(sections.get("Decisions")));
    appendListSection(bodyNode, t("detail.constraints"), readListFromSection(sections.get("Constraints")));
    appendListSection(bodyNode, t("detail.nextSteps"), readListFromSection(sections.get("Next Steps")));
    appendListSection(bodyNode, t("detail.blockers"), readListFromSection(sections.get("Blockers")));
    appendListSection(bodyNode, t("detail.timeline"), readListFromSection(sections.get("Timeline")));
    appendListSection(bodyNode, t("detail.notes"), readListFromSection(sections.get("Notes")));
  }
}

function appendMemoryFileListSection(container, label, entries, projectId) {
  if (!safeArray(entries).length) return;
  const section = el("section", "detail-section");
  section.append(el("h4", "", label));
  const list = el("div", "entry-stream detail-file-list");
  safeArray(entries).forEach((entry) => {
    const meta = [formatDateTime(entry.updatedAt)];
    if (entry.relativePath) meta.push(entry.relativePath);
    list.append(createEntryCard({
      title: entry.name || entry.file || t("common.unknown"),
      subtitle: entry.description || t("common.none"),
      badge: t(`type.${entry.type}`),
      meta: meta.join(" · "),
      active: state.selectedFileId === entry.relativePath,
      onClick: () => void openMemoryDetail(entry.relativePath, { projectId }),
    }));
  });
  section.append(list);
  container.append(section);
}

function getSelectedProjectGroup() {
  return safeArray(state.projectGroups).find((item) => item.projectId === state.selectedProjectId) || null;
}

function getVisibleProjectDetailEntries(entries) {
  const query = normalizeText(state.queries.project_detail).toLowerCase();
  if (!query) return safeArray(entries);
  return safeArray(entries).filter((entry) => {
    const haystack = [
      entry.name,
      entry.description,
      entry.relativePath,
      entry.file,
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function renderProjectDetailView(group) {
  if (!projectDetailTitle || !projectDetailMeta || !projectDetailBody || !projectDetailSubtitle) return;
  if (!group) {
    clearNode(projectDetailMeta);
    projectDetailTitle.textContent = t("detail.title");
    projectDetailSubtitle.textContent = "";
    clearNode(projectDetailBody).append(createEmptyState(t("level.project.empty")));
    return;
  }

  projectDetailTitle.textContent = group.projectName || group.projectId || t("detail.title");
  projectDetailSubtitle.textContent = group.description || "";
  clearNode(projectDetailMeta);
  projectDetailMeta.append(
    createMetaChip(t("meta.type"), t("type.project")),
    createMetaChip(t("meta.scope"), t("scope.project")),
    createMetaChip(t("meta.projectId"), group.projectId || t("common.none")),
    createMetaChip(t("meta.updatedAt"), formatDateTime(group.updatedAt)),
    createMetaChip(t("meta.counts"), `${formatNumber(group.projectCount || 0)} / ${formatNumber(group.feedbackCount || 0)}`),
  );

  clearNode(projectDetailBody);
  const visibleProjectEntries = getVisibleProjectDetailEntries(group.projectEntries);
  const visibleFeedbackEntries = getVisibleProjectDetailEntries(group.feedbackEntries);
  appendMemoryFileListSection(
    projectDetailBody,
    t("detail.projectFiles"),
    visibleProjectEntries,
    group.projectId,
  );
  appendMemoryFileListSection(
    projectDetailBody,
    t("detail.feedbackFiles"),
    visibleFeedbackEntries,
    group.projectId,
  );
  if (!visibleProjectEntries.length && !visibleFeedbackEntries.length) {
    projectDetailBody.append(createEmptyState(t("common.none")));
  }
}

function renderFileDetailView(record) {
  if (!fileDetailTitle || !fileDetailSubtitle || !fileDetailMeta || !fileDetailBody) return;
  if (fileDetailBackBtn) fileDetailBackBtn.hidden = !state.selectedProjectId;
  if (!record) {
    fileDetailTitle.textContent = t("detail.title");
    fileDetailSubtitle.textContent = "";
    clearNode(fileDetailMeta);
    clearNode(fileDetailBody).append(createEmptyState(t("detail.empty")));
    return;
  }
  fileDetailTitle.textContent = record.name || record.file || t("detail.title");
  fileDetailSubtitle.textContent = record.description || "";
  fillRecordDetail(fileDetailMeta, fileDetailBody, record);
}

async function renderCurrentMainView({ force = false } = {}) {
  if (state.mainView === "project-detail") {
    renderProjectDetailView(getSelectedProjectGroup());
    return;
  }
  if (state.mainView === "file-detail" && state.selectedFileId) {
    const record = await getMemoryRecord(state.selectedFileId, { force });
    if (record) state.selectedFileType = normalizeText(record.type);
    renderFileDetailView(record);
    return;
  }
}

async function openMemoryDetail(id, { projectId = "" } = {}) {
  const record = await getMemoryRecord(id);
  if (!record) return;
  state.selectedProjectId = projectId || normalizeText(record.projectId);
  state.selectedFileId = id;
  state.selectedFileType = normalizeText(record.type);
  state.mainView = "file-detail";
  renderFileDetailView(record);
  renderActiveView();
}

async function openProjectGroupDetail(projectId) {
  const group = safeArray(state.projectGroups).find((item) => item.projectId === projectId);
  if (!group) return;
  state.selectedProjectId = projectId;
  state.selectedFileId = "";
  state.selectedFileType = "";
  state.mainView = "project-detail";
  renderProjectDetailView(group);
  renderActiveView();
}

/* ── project / user rendering ─────────────────────────── */

function renderProjectListView() {
  const items = getVisibleProjectGroups();
  clearNode(projectListBoard);
  if (!items.length) {
    projectListBoard.append(createEmptyState(t("level.project.empty")));
    return;
  }

  const cards = items.map((group) => createBoardCard({
    name: group.projectName,
    description: group.description,
    updatedAt: group.updatedAt,
    projectId: group.projectId,
  }, {
    status: inferProjectGroupStatus(group),
    active: state.mainView === "project-detail" && state.selectedProjectId === group.projectId,
    subtitle: group.description,
    meta: [
      formatDateTime(group.updatedAt),
      group.projectId,
      t("board.project.memoryCount", group.projectCount || 0),
      t("board.project.feedbackCount", group.feedbackCount || 0),
    ].join(" · "),
    onClick: () => void openProjectGroupDetail(group.projectId),
  }));

  projectListBoard.append(createBoardGroup(t("board.project"), items.length, cards));
}

function renderUserBoard() {
  const summary = state.userSummary;
  clearNode(userBoard);
  if (!summary || (!normalizeText(summary.summary) && !safeArray(summary.files).length)) {
    userBoard.append(createEmptyState(t("board.user.empty")));
    return;
  }

  const card = el("section", "profile-board-card");
  const addSummaryText = (label, text) => {
    const value = normalizeText(text);
    if (!value) return;
    card.append(el("div", "profile-section-title", label));
    value.split(/\n+/).forEach((line) => {
      if (!normalizeText(line)) return;
      card.append(el("p", "profile-para", normalizeText(line)));
    });
  };
  const addSummaryList = (label, items) => {
    const values = safeArray(items).map((item) => normalizeText(item)).filter(Boolean);
    if (!values.length) return;
    card.append(el("div", "profile-section-title", label));
    const list = el("div", "profile-topic-list");
    values.forEach((item) => {
      list.append(el("span", "profile-topic-chip", item));
    });
    card.append(list);
  };

  addSummaryText(t("detail.summary"), summary.summary);
  addSummaryList(t("detail.preferences"), summary.preferences);
  addSummaryList(t("detail.constraints"), summary.constraints);
  addSummaryList(t("detail.relationships"), summary.relationships);
  addSummaryList(t("detail.notes"), summary.notes);

  const files = safeArray(summary.files);
  if (files.length) {
    card.append(el("div", "profile-section-title", t("board.user.sources")));
    const list = el("div", "profile-topic-list");
    files.forEach((entry) => {
      const chip = el("button", "profile-topic-chip", entry.name || entry.file);
      chip.type = "button";
      chip.addEventListener("click", () => void openMemoryDetail(entry.relativePath));
      list.append(chip);
    });
    card.append(list);
  }

  userBoard.append(card);
}

/* ── memory trace rendering ────────────────────────────── */

function getVisibleCases() {
  const query = normalizeText(state.queries.memory_trace).toLowerCase();
  if (!query) return state.cases;
  return state.cases.filter((item) => {
    const haystack = [
      item.query,
      item.sessionKey,
      item.assistantReply,
      item.retrieval?.pathSummary,
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function getSelectedCase() {
  const visibleCases = getVisibleCases();
  const selected = state.caseDetailCache.get(state.selectedCaseId)
    || visibleCases.find((item) => item.caseId === state.selectedCaseId)
    || visibleCases[0]
    || null;
  if (selected && state.selectedCaseId !== selected.caseId) {
    state.selectedCaseId = selected.caseId;
  }
  return selected;
}

function createTraceDetailBlock(detail) {
  const block = el("div", `memory-trace-detail-block${detail.kind === "note" ? " is-note" : ""}`);
  block.append(el("div", "memory-trace-debug-title", detail.label));

  if (detail.kind === "text" || detail.kind === "note") {
    block.append(el("pre", "memory-trace-code", detail.text || t("common.none")));
    return block;
  }

  if (detail.kind === "list") {
    const list = el("ul", "memory-trace-detail-list");
    safeArray(detail.items).forEach((item) => list.append(el("li", "", item)));
    block.append(list);
    return block;
  }

  if (detail.kind === "kv") {
    const grid = el("div", "memory-trace-kv-grid");
    safeArray(detail.entries).forEach((entry) => {
      const row = el("div", "memory-trace-kv-row");
      row.append(el("span", "memory-trace-kv-key", entry.label));
      row.append(el("span", "memory-trace-kv-value", String(entry.value ?? "")));
      grid.append(row);
    });
    block.append(grid);
    return block;
  }

  block.append(el("pre", "memory-trace-code", safeJson(detail.json)));
  return block;
}

function renderPromptDebug(container, promptDebug) {
  if (!promptDebug) return;
  const wrapper = el("details", "memory-trace-debug-block");
  wrapper.append(el("summary", "", t("board.memoryTrace.promptDebug")));
  const body = el("div");
  body.append(el("div", "memory-trace-debug-title", t("board.memoryTrace.systemPrompt")));
  body.append(el("pre", "memory-trace-code", promptDebug.systemPrompt || t("common.none")));
  body.append(el("div", "memory-trace-debug-title", t("board.memoryTrace.userPrompt")));
  body.append(el("pre", "memory-trace-code", promptDebug.userPrompt || t("common.none")));
  body.append(el("div", "memory-trace-debug-title", t("board.memoryTrace.rawOutput")));
  body.append(el("pre", "memory-trace-code", promptDebug.rawResponse || t("common.none")));
  if (promptDebug.parsedResult !== undefined) {
    body.append(el("div", "memory-trace-debug-title", t("board.memoryTrace.parsedResult")));
    body.append(el("pre", "memory-trace-code", safeJson(promptDebug.parsedResult)));
  }
  wrapper.append(body);
  container.append(wrapper);
}

function createTraceMetaChip(label, value) {
  const chip = el("div", "memory-trace-meta-chip");
  chip.append(el("div", "memory-trace-meta-label", label));
  chip.append(el("div", "memory-trace-meta-value", value));
  return chip;
}

function createTraceSummaryCard(title, bodyText, klass = "") {
  const card = el("section", `memory-trace-summary-card${klass ? ` ${klass}` : ""}`);
  card.append(el("h4", "", title));
  card.append(el("pre", "memory-trace-note", bodyText || t("common.none")));
  return card;
}

function traceStepLabel(step) {
  const key = `trace.step.${step?.kind || "unknown"}`;
  const hasTranslation = Boolean(LOCALES[state.locale][key] || LOCALES.en[key]);
  return hasTranslation ? t(key) : (step?.title || t("trace.step.unknown"));
}

function renderMemoryTrace(host) {
  const cases = getVisibleCases();
  clearNode(host);
  if (!cases.length) {
    host.append(createEmptyState(t("level.memory_trace.empty")));
    return;
  }

  const selected = getSelectedCase();
  if (!selected) {
    host.append(createEmptyState(t("board.memoryTrace.empty")));
    return;
  }

  const page = el("div", "memory-trace-page");
  const hero = el("section", "memory-trace-hero");
  const header = el("div", "memory-trace-section-head");
  header.append(el("h4", "", t("board.memoryTrace.selectCase")));

  const selector = el("div", "memory-trace-selector");
  const trigger = el("button", "memory-trace-selector-trigger");
  trigger.type = "button";
  trigger.append(el("span", "memory-trace-selector-title", selected.query || selected.caseId));
  trigger.append(el("span", "memory-trace-selector-chevron", state.traceSelectorOpen ? "▴" : "▾"));
  trigger.addEventListener("click", () => {
    state.traceSelectorOpen = !state.traceSelectorOpen;
    renderActiveView();
  });
  selector.append(trigger);

  if (state.traceSelectorOpen) {
    const list = el("div", "memory-trace-selector-list");
    cases.forEach((item) => {
      const option = el("button", `memory-trace-selector-option${item.caseId === selected.caseId ? " active" : ""}`);
      option.type = "button";
      option.append(el("div", "memory-trace-selector-option-title", item.query || item.caseId));
      option.append(el("div", "memory-trace-selector-option-meta", `${item.sessionKey} · ${formatDateTime(item.startedAt)}`));
      option.addEventListener("click", async () => {
        state.selectedCaseId = item.caseId;
        state.traceSelectorOpen = false;
        await loadCaseDetail(item.caseId);
        renderActiveView();
      });
      list.append(option);
    });
    selector.append(list);
  }

  header.append(selector);
  hero.append(header);

  const retrieval = selected.retrieval || {};
  const trace = retrieval.trace || { steps: [] };
  const metaGrid = el("div", "memory-trace-meta-grid");
  metaGrid.append(
    createTraceMetaChip(t("board.memoryTrace.query"), selected.query || t("common.none")),
    createTraceMetaChip(t("board.memoryTrace.session"), selected.sessionKey || t("common.none")),
    createTraceMetaChip(t("board.memoryTrace.mode"), trace.mode || t("common.none")),
    createTraceMetaChip(t("board.memoryTrace.status"), selected.status || t("common.none")),
    createTraceMetaChip(t("board.memoryTrace.injected"), retrieval.injected ? t("common.yes") : t("common.no")),
    createTraceMetaChip(t("board.memoryTrace.enoughAt"), formatEnoughAt(retrieval.enoughAt)),
    createTraceMetaChip(t("board.memoryTrace.started"), formatDateTime(selected.startedAt)),
    createTraceMetaChip(t("board.memoryTrace.finished"), formatDateTime(selected.finishedAt)),
  );
  hero.append(metaGrid);

  const summaryGrid = el("div", "memory-trace-summary-grid");
  summaryGrid.append(
    createTraceSummaryCard(t("board.memoryTrace.path"), retrieval.pathSummary || t("common.none"), "memory-trace-summary-card--path"),
    createTraceSummaryCard(t("board.memoryTrace.finalNote"), retrieval.evidenceNotePreview || t("common.none")),
    createTraceSummaryCard(t("board.memoryTrace.context"), retrieval.contextPreview || t("common.none"), "memory-trace-summary-card--artifact"),
    createTraceSummaryCard(
      t("board.memoryTrace.tools"),
      safeArray(selected.toolEvents).map((event) => `${event.toolName} · ${event.summary}`).join("\n") || t("common.none"),
      "memory-trace-summary-card--artifact",
    ),
    createTraceSummaryCard(t("board.memoryTrace.answer"), selected.assistantReply || t("common.none"), "memory-trace-summary-card--artifact"),
  );
  hero.append(summaryGrid);
  page.append(hero);

  const flow = el("section", "memory-trace-flow");
  const flowHeader = el("div", "memory-trace-section-head");
  flowHeader.append(el("h4", "", t("board.memoryTrace.flow")));
  flow.append(flowHeader);
  const steps = safeArray(trace.steps);
  if (!steps.length) {
    flow.append(createEmptyState(t("board.memoryTrace.noTrace")));
    page.append(flow);
    host.append(page);
    return;
  }

  if (!state.activeTraceStepId || !steps.some((step) => step.stepId === state.activeTraceStepId)) {
    state.activeTraceStepId = steps[0]?.stepId || "";
  }

  const list = el("div", "memory-trace-flow-list");
  steps.forEach((step, index) => {
    const item = el("div", `memory-trace-step-item${step.stepId === state.activeTraceStepId ? " active" : ""}`);
    const toggle = el("button", "memory-trace-step-toggle");
    toggle.type = "button";
    toggle.addEventListener("click", () => {
      state.activeTraceStepId = state.activeTraceStepId === step.stepId ? "" : step.stepId;
      renderActiveView();
    });

    toggle.append(el("span", "memory-trace-step-marker", String(index + 1)));
    const summary = el("div", "memory-trace-step-summary");
    const head = el("div", "memory-trace-step-head");
    head.append(el("strong", "", traceStepLabel(step)));
    head.append(el("span", "memory-trace-kind-badge", step.kind));
    summary.append(head);
    summary.append(el("div", "memory-trace-step-line", step.inputSummary || t("common.none")));
    summary.append(el("div", "memory-trace-step-line is-output", step.outputSummary || t("common.none")));
    toggle.append(summary);
    item.append(toggle);

    if (step.stepId === state.activeTraceStepId) {
      const expanded = el("div", "memory-trace-step-expanded");
      const meta = el("div", "memory-trace-expanded-meta");
      meta.append(
        createTraceMetaChip("status", step.status || t("common.none")),
        createTraceMetaChip("kind", step.kind || t("common.none")),
      );
      expanded.append(meta);

      const details = safeArray(step.details);
      if (details.length) {
        details.forEach((detail) => expanded.append(createTraceDetailBlock(detail)));
      } else {
        expanded.append(createEmptyState(t("board.memoryTrace.noStep")));
      }

      renderPromptDebug(expanded, step.promptDebug);
      item.append(expanded);
    }

    list.append(item);
  });
  flow.append(list);
  page.append(flow);
  host.append(page);
}

/* ── chrome rendering ──────────────────────────────────── */

function renderBrowserHeader() {
  const level = getCurrentLevel();
  const searchKey = getCurrentSearchKey();
  const selectedProject = getSelectedProjectGroup();
  if (browserTitle) {
    if (state.mainView === "project-detail") browserTitle.textContent = selectedProject?.projectName || t("level.project.label");
    else if (state.mainView === "file-detail") browserTitle.textContent = state.selectedFileType ? t(`type.${state.selectedFileType}`) : t("detail.title");
    else browserTitle.textContent = t(`level.${level}.label`);
  }
  if (listQueryInput) listQueryInput.value = searchKey ? state.queries[searchKey] || "" : "";
  if (listClearBtn) listClearBtn.style.display = searchKey && normalizeText(state.queries[searchKey]) ? "" : "none";
  if (listSearchRow) {
    const hidden = state.mainView === "user" || state.mainView === "file-detail";
    listSearchRow.style.display = hidden ? "none" : "";
  }
  if (browserMeta) {
    if (state.mainView === "project-detail" && selectedProject) {
      browserMeta.textContent = t(
        "stream.items",
        formatNumber(Number(selectedProject.projectCount || 0) + Number(selectedProject.feedbackCount || 0)),
      );
    } else if (state.mainView === "file-detail") {
      browserMeta.textContent = state.selectedFileType ? t(`type.${state.selectedFileType}`) : t("common.none");
    } else {
      browserMeta.textContent = t("stream.items", formatNumber(getMemoryCount(level)));
    }
  }
}

function renderNav() {
  if (boardNavTabs) {
    boardNavTabs.querySelectorAll("[data-page]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-page") === getNavPage());
    });
    boardNavTabs.querySelectorAll("[data-count-for]").forEach((node) => {
      const level = node.getAttribute("data-count-for");
      node.textContent = isValidLevel(level) ? String(getMemoryCount(level)) : "0";
    });
  }
}

function renderActiveView() {
  renderNav();
  renderBrowserHeader();
  ["project-list", "project-detail", "file-detail", "user", "memory_trace"].forEach((view) => {
    const node = getViewElement(view);
    if (node) node.classList.toggle("board-active", view === state.mainView);
  });
  if (state.mainView === "project-list") renderProjectListView();
  else if (state.mainView === "project-detail") renderProjectDetailView(getSelectedProjectGroup());
  else if (state.mainView === "file-detail") renderFileDetailView(state.selectedFileId ? state.recordCache.get(state.selectedFileId) || null : null);
  else if (state.mainView === "user") renderUserBoard();
  else renderMemoryTrace(memoryTraceBoard);
}

/* ── actions ───────────────────────────────────────────── */

async function saveSettings() {
  const recallTopK = Math.max(1, Math.min(50, Number(maxAutoReplyLatencyInput?.value || state.settings.recallTopK || 5)));
  const autoIndexIntervalMinutes = Math.max(0, Number(autoIndexIntervalHoursInput?.value || 0) * 60);
  const autoDreamIntervalMinutes = Math.max(0, Number(autoDreamIntervalHoursInput?.value || 0) * 60);
  const autoDreamMinNewL1 = Math.max(0, Number(autoDreamMinL1Input?.value || state.settings.autoDreamMinNewL1 || 0));
  const dreamProjectRebuildTimeoutMs = Math.max(0, Number(dreamRebuildTimeoutSecondsInput?.value || 0) * 1000);

  const saved = await postJson("./api/settings", {
    recallTopK,
    autoIndexIntervalMinutes,
    autoDreamIntervalMinutes,
    autoDreamMinNewL1,
    dreamProjectRebuildTimeoutMs,
  });
  state.settings = { ...DEFAULT_SETTINGS, ...(saved || {}) };
  syncSettingsForm();
  setActivity("status.settingsSaved", `${recallTopK}`);
}

function syncSettingsForm() {
  if (maxAutoReplyLatencyInput) maxAutoReplyLatencyInput.value = String(state.settings.recallTopK || 5);
  if (autoIndexIntervalHoursInput) autoIndexIntervalHoursInput.value = String((state.settings.autoIndexIntervalMinutes || 0) / 60);
  if (autoDreamIntervalHoursInput) autoDreamIntervalHoursInput.value = String((state.settings.autoDreamIntervalMinutes || 0) / 60);
  if (autoDreamMinL1Input) autoDreamMinL1Input.value = String(state.settings.autoDreamMinNewL1 || 0);
  if (dreamRebuildTimeoutSecondsInput) dreamRebuildTimeoutSecondsInput.value = String((state.settings.dreamProjectRebuildTimeoutMs || 0) / 1000);
}

function diffOverview(before, after) {
  return {
    memory: Math.max(0, Number(after.totalMemoryFiles || 0) - Number(before.totalMemoryFiles || 0)),
    project: Math.max(0, Number(after.totalProjectMemories || 0) - Number(before.totalProjectMemories || 0)),
    feedback: Math.max(0, Number(after.totalFeedbackMemories || 0) - Number(before.totalFeedbackMemories || 0)),
    user: Math.max(0, Number(after.totalUserMemories || 0) - Number(before.totalUserMemories || 0)),
  };
}

async function runIndexNow() {
  const ok = await confirmAction({
    title: t("confirm.sync.title"),
    body: t("confirm.sync.body"),
    confirmLabel: t("confirm.sync.ok"),
  });
  if (!ok) return;
  setActivity("status.building");
  const before = { ...state.overview };
  const stats = await postJson("./api/index/run");
  invalidateMemoryCaches();
  await loadSnapshot({ silent: true });
  await ensureActiveData({ force: true });
  await renderCurrentMainView({ force: true });
  const diff = diffOverview(before, state.overview);
  setActivity(
    "status.built",
    formatNumber(stats.l0Captured || 0),
    formatNumber(diff.memory),
    formatNumber(diff.project),
    formatNumber(diff.feedback),
    formatNumber(diff.user),
  );
  renderActiveView();
}

async function runDreamNow() {
  const ok = await confirmAction({
    title: t("confirm.dream.title"),
    body: t("confirm.dream.body"),
    confirmLabel: t("confirm.dream.ok"),
  });
  if (!ok) return;
  setActivity("status.dreaming");
  try {
    const result = await postJson("./api/dream/run");
    invalidateMemoryCaches();
    await loadSnapshot({ silent: true });
    await ensureActiveData({ force: true });
    await renderCurrentMainView({ force: true });
    setActivity("status.dreamed", result.summary || t("common.none"));
    renderActiveView();
  } catch (error) {
    setActivity("status.dreamFailed", error instanceof Error ? error.message : String(error));
  }
}

async function exportMemory() {
  setActivity("status.exporting");
  try {
    const response = await fetch("./api/export");
    if (!response.ok) throw new Error(await response.text());
    const blob = await response.blob();
    const filename = extractDownloadFilename(response, "clawxmemory-memory.json");
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setActivity("status.exported", filename);
  } catch (error) {
    setActivity("status.exportFailed", error instanceof Error ? error.message : String(error));
  }
}

async function importMemory(file) {
  const ok = await confirmAction({
    title: t("confirm.import.title"),
    body: t("confirm.import.body"),
    confirmLabel: t("confirm.import.ok"),
  });
  if (!ok) return;
  setActivity("status.importing");
  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    await postJson("./api/import", parsed);
    invalidateMemoryCaches();
    await loadSnapshot({ silent: true });
    await ensureActiveData({ force: true });
    await renderCurrentMainView({ force: true });
    setActivity(
      "status.imported",
      formatNumber(state.overview.totalMemoryFiles || 0),
      formatNumber(state.overview.totalProjectMemories || 0),
      formatNumber(state.overview.totalFeedbackMemories || 0),
      formatNumber(state.overview.totalUserMemories || 0),
    );
    renderActiveView();
  } catch (error) {
    if (error instanceof SyntaxError) {
      setActivity("status.importInvalid");
      return;
    }
    setActivity("status.importFailed", error instanceof Error ? error.message : String(error));
  }
}

async function clearMemory() {
  const ok = await confirmAction({
    title: t("confirm.clear.title"),
    body: t("confirm.clear.body"),
    confirmLabel: t("confirm.clear.ok"),
  });
  if (!ok) return;
  setActivity("status.clearing");
  await postJson("./api/clear");
  invalidateMemoryCaches();
  state.cases = [];
  state.caseRequestLoaded = false;
  state.caseDetailCache.clear();
  state.selectedCaseId = "";
  state.activeTraceStepId = "";
  state.mainView = "project-list";
  state.selectedProjectId = "";
  state.selectedFileId = "";
  state.selectedFileType = "";
  await loadSnapshot({ silent: true });
  await ensureActiveData({ force: true });
  renderActiveView();
  setActivity("status.cleared");
}

/* ── interaction ───────────────────────────────────────── */

async function switchPage(page) {
  if (!isValidLevel(page)) return;
  state.mainView = page === "project" ? "project-list" : page;
  if (page === "project") {
    state.selectedProjectId = "";
    state.selectedFileId = "";
    state.selectedFileType = "";
  }
  await ensureActiveData();
  renderActiveView();
}

async function runSearch() {
  const key = getCurrentSearchKey();
  if (!key) return;
  if (listQueryInput) state.queries[key] = normalizeText(listQueryInput.value);
  setActivity("status.searching");
  await ensureActiveData({ force: true });
  await renderCurrentMainView({ force: true });
  renderActiveView();
  setActivity("status.searched");
}

async function clearSearch() {
  const key = getCurrentSearchKey();
  if (!key) return;
  state.queries[key] = "";
  if (listQueryInput) listQueryInput.value = "";
  await ensureActiveData({ force: true });
  await renderCurrentMainView({ force: true });
  renderActiveView();
}

/* ── boot ──────────────────────────────────────────────── */

function wireEvents() {
  if (boardNavTabs) {
    boardNavTabs.addEventListener("click", (event) => {
      const btn = event.target instanceof Element ? event.target.closest("[data-page]") : null;
      const page = btn?.getAttribute("data-page");
      if (page) void switchPage(page);
    });
  }

  refreshBtn?.addEventListener("click", async () => {
    await loadSnapshot();
    await ensureActiveData({ force: true });
    await renderCurrentMainView({ force: true });
    renderActiveView();
  });
  buildNowBtn?.addEventListener("click", () => {
    void runIndexNow();
  });
  dreamRunBtn?.addEventListener("click", () => {
    void runDreamNow();
  });
  saveSettingsBtn?.addEventListener("click", () => {
    void saveSettings();
  });
  overviewToggleBtn?.addEventListener("click", () => openPanel("overview"));
  overviewCloseBtn?.addEventListener("click", closePanels);
  projectDetailBackBtn?.addEventListener("click", () => {
    state.mainView = "project-list";
    state.selectedProjectId = "";
    state.selectedFileId = "";
    state.selectedFileType = "";
    renderActiveView();
  });
  fileDetailBackBtn?.addEventListener("click", () => {
    if (!state.selectedProjectId) {
      state.mainView = "project-list";
      state.selectedFileId = "";
      state.selectedFileType = "";
      renderActiveView();
      return;
    }
    state.mainView = "project-detail";
    state.selectedFileId = "";
    state.selectedFileType = "";
    renderActiveView();
  });
  listSearchBtn?.addEventListener("click", () => {
    void runSearch();
  });
  listClearBtn?.addEventListener("click", () => {
    void clearSearch();
  });
  listQueryInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void runSearch();
    }
  });

  navToggleBtn?.addEventListener("click", openNav);
  navCloseBtn?.addEventListener("click", closeNav);
  appScrim?.addEventListener("click", () => {
    closePanels();
    closeNav();
    setSettingsPopover(false);
  });

  navMenuTrigger?.addEventListener("click", (event) => {
    event.stopPropagation();
    setSettingsPopover(!state.settingsPopoverOpen);
  });
  window.addEventListener("resize", () => {
    if (state.settingsPopoverOpen) positionSettingsPopover();
  });
  window.addEventListener("scroll", () => {
    if (state.settingsPopoverOpen) positionSettingsPopover();
  }, true);

  document.addEventListener("click", (event) => {
    if (!state.settingsPopoverOpen) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (settingsPopover?.contains(target) || navMenuTrigger?.contains(target)) return;
    setSettingsPopover(false);
  });

  advancedSettingsToggle?.addEventListener("click", () => {
    const open = !advancedSettingsBody?.classList.contains("open");
    toggleSection(advancedSettingsToggle, advancedSettingsBody, open);
  });
  dataManagementToggle?.addEventListener("click", () => {
    const open = !dataManagementBody?.classList.contains("open");
    toggleSection(dataManagementToggle, dataManagementBody, open);
  });

  themeToggle?.addEventListener("click", (event) => {
    const btn = event.target instanceof Element ? event.target.closest("[data-theme-value]") : null;
    const theme = btn?.getAttribute("data-theme-value");
    if (!theme) return;
    state.theme = theme;
    persistUiPrefs();
    applyTheme();
    applyTranslations();
    renderOverview();
    renderActiveView();
  });

  langToggle?.addEventListener("click", (event) => {
    const btn = event.target instanceof Element ? event.target.closest("[data-locale]") : null;
    const locale = btn?.getAttribute("data-locale");
    if (!locale || !LOCALES[locale]) return;
    state.locale = locale;
    persistUiPrefs();
    applyTheme();
    applyTranslations();
    renderOverview();
    void renderCurrentMainView().then(() => {
      renderActiveView();
    });
  });

  accentPicker?.addEventListener("click", (event) => {
    const btn = event.target instanceof Element ? event.target.closest("[data-accent]") : null;
    const accent = btn?.getAttribute("data-accent");
    if (!accent) return;
    state.accent = accent;
    persistUiPrefs();
    applyTheme();
  });

  exportMemoryBtn?.addEventListener("click", () => {
    void exportMemory();
  });
  importMemoryBtn?.addEventListener("click", () => importMemoryInput?.click());
  importMemoryInput?.addEventListener("change", (event) => {
    const input = event.target;
    const file = input instanceof HTMLInputElement ? input.files?.[0] : null;
    if (!file) return;
    void importMemory(file).finally(() => {
      if (input instanceof HTMLInputElement) input.value = "";
    });
  });
  clearMemoryBtn?.addEventListener("click", () => {
    void clearMemory();
  });

  modalConfirm?.addEventListener("click", () => closeModal(true));
  modalCancel?.addEventListener("click", () => closeModal(false));
  modalOverlay?.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.modalResolver) {
      closeModal(false);
      return;
    }
    if (state.settingsPopoverOpen) {
      setSettingsPopover(false);
      return;
    }
    if (body.dataset.nav === "open") {
      closeNav();
      return;
    }
    if (body.dataset.panel) {
      closePanels();
    }
  });

  if (window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener?.("change", () => {
      if (state.theme === "auto") applyTheme();
    });
  }
}

async function bootstrap() {
  applyTheme();
  applyTranslations();
  toggleSection(advancedSettingsToggle, advancedSettingsBody, true);
  toggleSection(dataManagementToggle, dataManagementBody, false);
  wireEvents();
  renderFileDetailView(null);
  try {
    setActivity("status.loading");
    await loadSnapshot({ silent: true });
    await ensureActiveData({ force: true });
    await renderCurrentMainView();
    renderActiveView();
    setActivity("status.ready");
  } catch (error) {
    setActivity("status.loadFail", error instanceof Error ? error.message : String(error));
    renderActiveView();
  }
}

void bootstrap();
