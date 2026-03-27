/* ── i18n ────────────────────────────────────────────────── */

const LOCALES = {
  zh: {
    "nav.l1": "记忆片段（L1）",
    "nav.l2_project": "项目记忆（L2）",
    "nav.l2_time": "时间记忆（L2）",
    "nav.l0": "原始对话（L0）",
    "nav.profile": "个人画像",
    "nav.lastIndexed": "最近索引",
    "nav.waiting": "等待索引",
    "topbar.title": "ClawXMemory",
    "topbar.idle": "等待操作",
    "topbar.refresh": "刷新",
    "topbar.build": "索引同步",
    "topbar.overview": "仪表盘",
    "topbar.settings": "设置",
    "topbar.retrieve": "检索",
    "topbar.detail": "详情",
    "overview.title": "运行概览",
    "stream.searchPlaceholder": "搜索当前层级",
    "stream.search": "搜索",
    "stream.clear": "清空",
    "stream.items": "{0} 条",
    "stream.prevPage": "上一页",
    "stream.nextPage": "下一页",
    "stream.pageInfo": "第 {0} / {1} 页",
    "detail.title": "记录详情",
    "detail.empty": "选择左侧记录查看详情",
    "settings.title": "设置",
    "settings.mode": "推理模式",
    "settings.mode.help": "效率优先遵守最大可接受时延；准确优先不受时延限制。",
    "settings.mode.answer_first": "效率优先",
    "settings.mode.accuracy_first": "准确优先",
    "settings.maxLatency": "最大可接受时延（毫秒）",
    "settings.save": "保存设置",
    "settings.theme": "主题",
    "settings.theme.light": "浅色",
    "settings.theme.dark": "深色",
    "settings.theme.auto": "跟随系统",
    "settings.language": "语言",
    "settings.accentColor": "主题色",
    "settings.export": "导出记忆",
    "settings.import": "导入记忆",
    "settings.clear": "清除记忆",
    "settings.dangerZone": "危险操作",
    "retrieve.title": "检索调试",
    "retrieve.placeholder": "输入问题，例如：这个项目最近进展到哪一步了？",
    "retrieve.run": "开始检索",
    "retrieve.notYet": "尚未检索",
    "retrieve.context": "上下文",
    "status.refreshing": "刷新中…",
    "status.refreshed": "已刷新",
    "confirm.sync.title": "索引同步",
    "confirm.sync.body": "将扫描最近对话并更新记忆索引，这可能需要一些时间。",
    "confirm.sync.ok": "开始同步",
    "confirm.clear.title": "清除记忆",
    "confirm.clear.body": "此操作将删除所有已索引的记忆数据，且不可撤销。确定继续吗？",
    "confirm.clear.ok": "确认清除",
    "confirm.import.title": "导入记忆",
    "confirm.import.body": "这会用导入文件中的记忆覆盖当前设备上的全部记忆数据，当前设备记忆将被替换。确定继续吗？",
    "confirm.import.ok": "确认导入",
    "confirm.cancel": "取消",
    "status.building": "同步中…",
    "status.built": "已构建 · L0 {0} / L1 {1} / L2T {2} / L2P {3} / 画像 {4}",
    "status.clearing": "清空中…",
    "status.cleared": "已清空本地记忆",
    "status.exporting": "导出中…",
    "status.exported": "已导出记忆 · {0}",
    "status.importing": "导入中…",
    "status.imported": "已导入 · L0 {0} / L1 {1} / L2T {2} / L2P {3} / 画像 {4} / 链接 {5}",
    "status.importInvalid": "导入文件不是有效的记忆包",
    "status.importFailed": "导入失败：{0}",
    "status.exportFailed": "导出失败：{0}",
    "status.searching": "搜索中…",
    "status.searched": "搜索完成",
    "status.retrieving": "检索中…",
    "status.retrieved": "检索完成",
    "status.loading": "加载中…",
    "status.ready": "已就绪",
    "status.startupRepairRunning": "正在加载已有记忆，后台校验中…",
    "status.startupRepairPillRunning": "后台校验中",
    "status.startupRepairFailed": "启动校验失败，暂时显示上次记忆快照",
    "status.startupRepairFailedWithDetail": "启动校验失败，暂时显示上次记忆快照：{0}",
    "status.startupRepairPillFailed": "启动校验失败",
    "status.loadFail": "加载失败：{0}",
    "status.queryRequired": "请输入检索问题",
    "status.settingsSaved": "设置已保存 · {0}",
    "status.pending": "待索引 {0} · 开放 {1}",
    "level.l1.label": "记忆片段（L1）",
    "level.l2_project.label": "项目记忆（L2）",
    "level.l2_time.label": "时间记忆（L2）",
    "level.l0.label": "原始对话（L0）",
    "level.profile.label": "个人画像",
    "level.l1.empty": "暂无 L1 记录",
    "level.l2_project.empty": "暂无 L2 项目索引",
    "level.l2_time.empty": "暂无 L2 时间索引",
    "level.l0.empty": "暂无 L0 会话",
    "level.profile.empty": "暂无个人画像",
    "detail.summary": "摘要",
    "detail.situation": "时间情景",
    "detail.projects": "项目",
    "detail.facts": "事实",
    "detail.sourceL0": "来源 L0",
    "detail.sourceWindows": "来源窗口",
    "detail.progress": "最近进展",
    "detail.messages": "消息流",
    "detail.profileSummary": "画像摘要",
    "detail.noSummary": "暂无摘要",
    "detail.noSituation": "暂无情景摘要",
    "detail.noProjects": "暂无项目",
    "detail.noFacts": "暂无事实",
    "detail.noProgress": "暂无进展",
    "detail.noProfile": "暂无画像摘要",
    "detail.noMessages": "暂无用户消息",
    "entry.unnamed.time": "未命名时间桶",
    "entry.unnamed.project": "未命名项目",
    "entry.unnamed.window": "未命名窗口",
    "entry.unnamed.session": "未命名会话",
    "entry.globalProfile": "个人画像",
    "project.planned": "计划中",
    "project.in_progress": "进行中",
    "project.done": "已完成",
    "project.statusLabel": "状态：{0}",
    "meta.date": "日期",
    "meta.source": "来源",
    "meta.update": "更新",
    "meta.projectKey": "项目键",
    "meta.status": "状态",
    "meta.session": "Session",
    "meta.start": "开始",
    "meta.end": "结束",
    "meta.time": "时间",
    "meta.messages": "消息",
    "meta.l1Count": "{0} 条 L1",
    "meta.sourceCount": "来源 {0}",
    "meta.l0Count": "L0 {0}",
    "meta.projectCount": "项目 {0}",
    "meta.msgCount": "{0} 条",
    "retrieve.noResult": "无结果",
    "overview.queued": "排队 Session",
    "overview.recallMs": "最近召回",
    "overview.recallMode": "召回模式",
    "overview.reasoningMode": "推理模式",
    "overview.recallPath": "回答路径",
    "overview.budgetStop": "预算截停",
    "overview.shadowDeep": "后台备案",
    "overview.recallTimeouts": "召回超时",
    "overview.recallInjected": "已注入记忆",
    "overview.recallEnough": "命中层级",
    "overview.slotOwner": "Memory Slot",
    "overview.dynamicRuntime": "动态记忆运行时",
    "overview.workspaceBootstrap": "Workspace Bootstrap",
    "overview.runtimeIssues": "运行时问题",
    "overview.group.memory": "记忆概况",
    "overview.group.recall": "最近召回",
    "overview.group.reasoning": "推理与预算",
    "overview.group.health": "系统健康",
    "overview.pending": "待索引",
    "recall.llm": "LLM 快选",
    "recall.local_fallback": "本地降级",
    "recall.none": "无注入",
    "recall.path.auto": "自动回答",
    "recall.path.explicit": "显式深检索",
    "recall.path.shadow": "后台备案命中",
    "reasoning.answer_first": "效率优先",
    "reasoning.accuracy_first": "准确优先",
    "boundary.healthy": "正常",
    "boundary.conflicted": "未就绪",
    "boundary.present": "已存在",
    "boundary.absent": "未检测",
    "boundary.injected": "是",
    "boundary.notInjected": "否",
    "boundary.cacheHit": "缓存命中",
    "boundary.cacheMiss": "实时计算",
    "boundary.budgetStopped": "已截停",
    "boundary.budgetNotStopped": "未截停",
    "boundary.shadowQueued": "已排队",
    "boundary.shadowNotQueued": "未排队",
    "boundary.ownerMissing": "未绑定",
    "boundary.noConflict": "无问题",
    "boundary.runtimeClawXMemory": "ClawXMemory",
    "boundary.runtimeMisconfigured": "配置异常",
    "boundary.workspaceBootstrap": "这是 OpenClaw 宿主注入的静态 Project Context，不是插件冲突",
    "boundary.conflictMemoryCore": "memory-core 还没完全关闭",
    "boundary.conflictSessionHook": "session-memory hook 还没完全关闭",
    "boundary.conflictMemorySearch": "OpenClaw 原生 memorySearch 还没关闭",
    "boundary.conflictMemoryFlush": "OpenClaw 原生 memoryFlush 还没关闭",
    "boundary.conflictPromptInjection": "插件 prompt 注入被宿主配置禁用了",
    "boundary.conflictRecallDisabled": "插件 recallEnabled 被关闭了",
    "status.conflictsDetected": "检测到动态记忆运行时问题 {0} 项",
    "enough.l2": "L2",
    "enough.l1": "L1",
    "enough.l0": "L0",
    "enough.profile": "画像",
    "enough.none": "无",
    "topbar.commandCenter": "画布视图",
    "topbar.listView": "列表视图",
    "board.project": "项目记忆",
    "board.timeline": "记忆时间线",
    "board.profile": "个人画像",
    "board.profile.empty": "暂无画像数据",
    "board.profile.topics": "关联话题",
    "board.profile.viewConn": "查看记忆连线",
    "board.stats.activeProjects": "活跃项目",
    "board.stats.timeRecords": "时间记录",
    "board.stats.topicWindows": "话题窗口",
    "board.stats.sessions": "会话数",
    "connection.title": "记忆连线",
    "connection.l2": "L2 索引",
    "connection.l1": "L1 窗口",
    "connection.l0": "L0 会话",
    "connection.noData": "暂无关联数据",
    "connection.notLoaded": "未加载",
  },
  en: {
    "nav.l1": "Memory Snippets (L1)",
    "nav.l2_project": "Project Memory (L2)",
    "nav.l2_time": "Time Memory (L2)",
    "nav.l0": "Raw Dialogues (L0)",
    "nav.profile": "Personal Profile",
    "nav.lastIndexed": "Last indexed",
    "nav.waiting": "Waiting",
    "topbar.title": "ClawXMemory",
    "topbar.idle": "Idle",
    "topbar.refresh": "Refresh",
    "topbar.build": "Sync Index",
    "topbar.overview": "Dashboard",
    "topbar.settings": "Settings",
    "topbar.retrieve": "Retrieve",
    "topbar.detail": "Detail",
    "overview.title": "Runtime Overview",
    "stream.searchPlaceholder": "Search current level",
    "stream.search": "Search",
    "stream.clear": "Clear",
    "stream.items": "{0} items",
    "stream.prevPage": "Prev",
    "stream.nextPage": "Next",
    "stream.pageInfo": "Page {0} / {1}",
    "detail.title": "Detail",
    "detail.empty": "Select a record to view details",
    "settings.title": "Settings",
    "settings.mode": "Reasoning mode",
    "settings.mode.help": "Speed first obeys the max acceptable latency; accuracy first ignores that latency cap.",
    "settings.mode.answer_first": "Speed first",
    "settings.mode.accuracy_first": "Accuracy first",
    "settings.maxLatency": "Max acceptable latency (ms)",
    "settings.save": "Save",
    "settings.theme": "Theme",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
    "settings.theme.auto": "System",
    "settings.language": "Language",
    "settings.accentColor": "Accent color",
    "settings.export": "Export Memory",
    "settings.import": "Import Memory",
    "settings.clear": "Clear Memory",
    "settings.dangerZone": "Danger Zone",
    "retrieve.title": "Retrieve Debug",
    "retrieve.placeholder": "Enter a question, e.g. What's the latest progress?",
    "retrieve.run": "Run",
    "retrieve.notYet": "Not yet retrieved",
    "retrieve.context": "Context",
    "status.refreshing": "Refreshing…",
    "status.refreshed": "Refreshed",
    "confirm.sync.title": "Sync Index",
    "confirm.sync.body": "This will scan recent conversations and update the memory index. It may take a moment.",
    "confirm.sync.ok": "Start Sync",
    "confirm.clear.title": "Clear Memory",
    "confirm.clear.body": "This will permanently delete all indexed memory data. This action cannot be undone. Continue?",
    "confirm.clear.ok": "Confirm Clear",
    "confirm.import.title": "Import Memory",
    "confirm.import.body": "This will replace all memory on this device with the imported memory bundle. Current device memory will be overwritten. Continue?",
    "confirm.import.ok": "Confirm Import",
    "confirm.cancel": "Cancel",
    "status.building": "Syncing…",
    "status.built": "Built · L0 {0} / L1 {1} / L2T {2} / L2P {3} / Profile {4}",
    "status.clearing": "Clearing…",
    "status.cleared": "Local memory cleared",
    "status.exporting": "Exporting…",
    "status.exported": "Memory exported · {0}",
    "status.importing": "Importing…",
    "status.imported": "Imported · L0 {0} / L1 {1} / L2T {2} / L2P {3} / Profile {4} / Links {5}",
    "status.importInvalid": "The selected file is not a valid memory bundle",
    "status.importFailed": "Import failed: {0}",
    "status.exportFailed": "Export failed: {0}",
    "status.searching": "Searching…",
    "status.searched": "Search complete",
    "status.retrieving": "Retrieving…",
    "status.retrieved": "Retrieval complete",
    "status.loading": "Loading…",
    "status.ready": "Ready",
    "status.startupRepairRunning": "Loading existing memory while startup validation runs…",
    "status.startupRepairPillRunning": "Startup validation",
    "status.startupRepairFailed": "Startup validation failed; showing the last memory snapshot",
    "status.startupRepairFailedWithDetail": "Startup validation failed; showing the last memory snapshot: {0}",
    "status.startupRepairPillFailed": "Startup failed",
    "status.loadFail": "Load failed: {0}",
    "status.queryRequired": "Please enter a query",
    "status.settingsSaved": "Saved · {0}",
    "status.pending": "Pending {0} · Open {1}",
    "level.l1.label": "Memory Snippets (L1)",
    "level.l2_project.label": "Project Memory (L2)",
    "level.l2_time.label": "Time Memory (L2)",
    "level.l0.label": "Raw Dialogues (L0)",
    "level.profile.label": "Personal Profile",
    "level.l1.empty": "No L1 records",
    "level.l2_project.empty": "No L2 project indexes",
    "level.l2_time.empty": "No L2 time indexes",
    "level.l0.empty": "No L0 sessions",
    "level.profile.empty": "No profile data",
    "detail.summary": "Summary",
    "detail.situation": "Situation",
    "detail.projects": "Projects",
    "detail.facts": "Facts",
    "detail.sourceL0": "Source L0",
    "detail.sourceWindows": "Source Windows",
    "detail.progress": "Latest Progress",
    "detail.messages": "Messages",
    "detail.profileSummary": "Profile Summary",
    "detail.noSummary": "No summary",
    "detail.noSituation": "No situation info",
    "detail.noProjects": "No projects",
    "detail.noFacts": "No facts",
    "detail.noProgress": "No progress",
    "detail.noProfile": "No profile summary",
    "detail.noMessages": "No user messages",
    "entry.unnamed.time": "Unnamed time bucket",
    "entry.unnamed.project": "Unnamed project",
    "entry.unnamed.window": "Unnamed window",
    "entry.unnamed.session": "Unnamed session",
    "entry.globalProfile": "Personal Profile",
    "project.planned": "Planned",
    "project.in_progress": "In Progress",
    "project.done": "Done",
    "project.statusLabel": "Status: {0}",
    "meta.date": "Date",
    "meta.source": "Source",
    "meta.update": "Updated",
    "meta.projectKey": "Project Key",
    "meta.status": "Status",
    "meta.session": "Session",
    "meta.start": "Start",
    "meta.end": "End",
    "meta.time": "Time",
    "meta.messages": "Messages",
    "meta.l1Count": "{0} L1",
    "meta.sourceCount": "Source {0}",
    "meta.l0Count": "L0 {0}",
    "meta.projectCount": "Projects {0}",
    "meta.msgCount": "{0} msgs",
    "retrieve.noResult": "No results",
    "overview.queued": "Queued Sessions",
    "overview.recallMs": "Last Recall",
    "overview.recallMode": "Recall Mode",
    "overview.reasoningMode": "Reasoning Mode",
    "overview.recallPath": "Reply Path",
    "overview.budgetStop": "Budget Stop",
    "overview.shadowDeep": "Shadow Deep",
    "overview.recallTimeouts": "Recall Timeouts",
    "overview.recallInjected": "Memory Injected",
    "overview.recallEnough": "Enough At",
    "overview.slotOwner": "Memory Slot",
    "overview.dynamicRuntime": "Dynamic Memory Runtime",
    "overview.workspaceBootstrap": "Workspace Bootstrap",
    "overview.runtimeIssues": "Runtime Issues",
    "overview.group.memory": "Memory Stats",
    "overview.group.recall": "Last Recall",
    "overview.group.reasoning": "Reasoning & Budget",
    "overview.group.health": "System Health",
    "overview.pending": "Pending",
    "recall.llm": "LLM Fast Path",
    "recall.local_fallback": "Local Fallback",
    "recall.none": "No Memory",
    "recall.path.auto": "Auto reply",
    "recall.path.explicit": "Explicit deep recall",
    "recall.path.shadow": "Shadow cache hit",
    "reasoning.answer_first": "Speed first",
    "reasoning.accuracy_first": "Accuracy first",
    "boundary.healthy": "Healthy",
    "boundary.conflicted": "Misconfigured",
    "boundary.present": "Present",
    "boundary.absent": "Absent",
    "boundary.injected": "Yes",
    "boundary.notInjected": "No",
    "boundary.cacheHit": "Cache hit",
    "boundary.cacheMiss": "Live",
    "boundary.budgetStopped": "Stopped",
    "boundary.budgetNotStopped": "Not stopped",
    "boundary.shadowQueued": "Queued",
    "boundary.shadowNotQueued": "Not queued",
    "boundary.ownerMissing": "Unbound",
    "boundary.noConflict": "No issues",
    "boundary.runtimeClawXMemory": "ClawXMemory",
    "boundary.runtimeMisconfigured": "Misconfigured",
    "boundary.workspaceBootstrap": "This is OpenClaw host Project Context, not a plugin conflict",
    "boundary.conflictMemoryCore": "memory-core is still enabled somewhere",
    "boundary.conflictSessionHook": "session-memory hook is still enabled somewhere",
    "boundary.conflictMemorySearch": "Native memorySearch is still enabled somewhere",
    "boundary.conflictMemoryFlush": "Native memoryFlush is still enabled somewhere",
    "boundary.conflictPromptInjection": "Prompt injection is disabled for the plugin",
    "boundary.conflictRecallDisabled": "Plugin recallEnabled is disabled",
    "status.conflictsDetected": "Detected {0} dynamic-memory runtime issues",
    "enough.l2": "L2",
    "enough.l1": "L1",
    "enough.l0": "L0",
    "enough.profile": "Profile",
    "enough.none": "None",
    "topbar.commandCenter": "Canvas View",
    "topbar.listView": "List View",
    "board.project": "Project Memory",
    "board.timeline": "Memory Timeline",
    "board.profile": "Personal Profile",
    "board.profile.empty": "No profile data yet",
    "board.profile.topics": "Related Topics",
    "board.profile.viewConn": "View Memory Connections",
    "board.stats.activeProjects": "Active Projects",
    "board.stats.timeRecords": "Time Records",
    "board.stats.topicWindows": "Topic Windows",
    "board.stats.sessions": "Sessions",
    "connection.title": "Memory Connections",
    "connection.l2": "L2 Index",
    "connection.l1": "L1 Windows",
    "connection.l0": "L0 Sessions",
    "connection.noData": "No linked data",
    "connection.notLoaded": "Not loaded",
  },
};

let currentLocale = localStorage.getItem("ym-locale") || "zh";

function t(key, ...args) {
  const dict = LOCALES[currentLocale] || LOCALES.zh;
  let str = dict[key] ?? LOCALES.zh[key] ?? key;
  for (let i = 0; i < args.length; i++) {
    str = str.replace(`{${i}}`, args[i]);
  }
  return str;
}

function translatePage() {
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const attr = el.getAttribute("data-i18n-attr");
    if (attr) {
      el[attr] = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  syncLangButtons();
}

function syncLangButtons() {
  if (langToggle) {
    langToggle.querySelectorAll(".popover-seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.locale === currentLocale);
    });
  }
}

function setLocale(locale) {
  currentLocale = locale;
  localStorage.setItem("ym-locale", locale);
  translatePage();
  refreshRenderedContent();
}

/* ── Theme ───────────────────────────────────────────────── */

function getEffectiveTheme(pref) {
  if (pref === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

function applyTheme(pref) {
  localStorage.setItem("ym-theme", pref);
  const effective = getEffectiveTheme(pref);
  document.documentElement.dataset.theme = effective;
  document.querySelectorAll("#themeToggle .popover-seg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeValue === pref);
  });
}

function applyAccent(accent) {
  localStorage.setItem("ym-accent", accent);
  if (accent === "blue") {
    delete document.documentElement.dataset.accent;
  } else {
    document.documentElement.dataset.accent = accent;
  }
  document.querySelectorAll("#accentPicker .accent-dot").forEach((dot) => {
    dot.classList.toggle("active", dot.dataset.accent === accent);
  });
}

function initTheme() {
  const pref = localStorage.getItem("ym-theme") || "light";
  applyTheme(pref);
  const accent = localStorage.getItem("ym-accent") || "blue";
  applyAccent(accent);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    const current = localStorage.getItem("ym-theme") || "light";
    if (current === "auto") applyTheme("auto");
  });
}

/* ── DOM refs ────────────────────────────────────────────── */

const $ = (sel) => document.querySelector(sel);

const appScrim = $("#appScrim");
const navRail = $("#navRail");
const navToggleBtn = $("#navToggleBtn");
const navCloseBtn = $("#navCloseBtn");
const levelTabs = $("#levelTabs");
const navLastIndexed = $("#navLastIndexed");

const statusPill = document.getElementById("statusPill");
const activityText = $("#activityText");
const overviewToggleBtn = $("#overviewToggleBtn");
const overviewCloseBtn = $("#overviewCloseBtn");
const overviewCards = $("#overviewCards");
const overviewScroll = $("#overviewScroll");
const browserTitle = $("#browserTitle");
const browserMeta = $("#browserMeta");
const listQueryInput = $("#listQueryInput");
const listSearchBtn = $("#listSearchBtn");
const entryList = $("#entryList");

const refreshBtn = $("#refreshBtn");
const buildNowBtn = $("#buildNowBtn");
const settingsToggleBtn = document.getElementById("settingsToggleBtn");
const retrieveToggleBtn = document.getElementById("retrieveToggleBtn");
const detailToggleBtn = document.getElementById("detailToggleBtn");

const detailPanel = $("#detailPanel");
const detailCloseBtn = $("#detailCloseBtn");
const detailTitle = $("#detailTitle");
const detailMeta = $("#detailMeta");
const detailBody = $("#detailBody");

const settingsPanel = document.getElementById("settingsPanel");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const saveSettingsBtn = $("#saveSettingsBtn");
const exportMemoryBtn = $("#exportMemoryBtn");
const importMemoryBtn = $("#importMemoryBtn");
const clearMemoryBtn = $("#clearMemoryBtn");
const importMemoryInput = $("#importMemoryInput");
const reasoningModeToggle = document.getElementById("reasoningModeToggle");
const maxAutoReplyLatencyInput = $("#maxAutoReplyLatencyInput");
const latencyFieldWrap = $("#latencyFieldWrap");
const langToggle = document.getElementById("langToggle");

const retrievePanel = $("#retrievePanel");
const retrieveCloseBtn = $("#retrieveCloseBtn");
const queryInput = $("#queryInput");
const retrieveBtn = $("#retrieveBtn");
const retrieveSummary = $("#retrieveSummary");
const retrieveTimeline = $("#retrieveTimeline");
const retrieveResult = $("#retrieveResult");

const themeToggle = $("#themeToggle");
const langDropdown = $("#langDropdown");
const langTrigger = $("#langTrigger");
const langCurrentLabel = $("#langCurrentLabel");
const langMenu = $("#langMenu");

const commandCenter = $("#commandCenter");
const boardNavTabs = $("#boardNavTabs");
const boardTabs = document.getElementById("boardTabs");
const boardScroll = $("#boardScroll");
const projectBoard = $("#projectBoard");
const timelineBoard = $("#timelineBoard");
const connectionPanel = $("#connectionPanel");
const connectionGraph = $("#connectionGraph");
const connectionSvg = $("#connectionSvg");
const connectionColumns = $("#connectionColumns");
const connectionBackBtn = $("#connectionBackBtn");
const viewToggleBtn = $("#viewToggleBtn");

/* ── Level config ────────────────────────────────────────── */

const LEVEL_KEYS = ["profile", "l2_project", "l2_time", "l1", "l0"];

function getLevelConfig(level) {
  const endpoints = {
    l1: "./api/l1",
    l2_project: "./api/l2/project",
    l2_time: "./api/l2/time",
    l0: "./api/l0",
    profile: "./api/profile",
  };
  return {
    label: t(`level.${level}.label`),
    endpoint: endpoints[level],
    emptyText: t(`level.${level}.empty`),
  };
}

const OVERVIEW_KEYS = {
  l1: "totalL1",
  l2_project: "totalL2Project",
  l2_time: "totalL2Time",
  l0: "totalL0",
  profile: "totalProfiles",
};

function formatStatus(value) {
  const normalized = value === "done" || value === "completed" || value === "complete"
    ? "done"
    : value === "blocked" || value === "on_hold" || value === "in_progress" || value === "in progress"
      ? "in_progress"
      : "planned";
  return t(`project.${normalized}`) || normalized || "-";
}

/* ── State ───────────────────────────────────────────────── */

const state = {
  activeLevel: "l1",
  activePanel: null,
  overview: {},
  settings: {
    reasoningMode: "answer_first",
    maxAutoReplyLatencyMs: 1800,
  },
  globalProfile: { recordId: "global_profile_record", profileText: "", sourceL1Ids: [], createdAt: "", updatedAt: "" },
  baseRaw: { l2_time: [], l2_project: [], l1: [], l0: [], profile: [] },
  baseItems: { l2_time: [], l2_project: [], l1: [], l0: [], profile: [] },
  visibleItems: [],
  selectedIndex: -1,
  viewMode: "command_center",
  activeBoard: "project",
  connectionTarget: null,
  connectionType: null,
  l1ById: {},
  l0ById: {},
  listPage: 0,
  listPageSize: 20,
  isSearching: false,
  searchTotal: 0,
  connPageSize: 10,
  connL1Page: 0,
  connL0Page: 0,
  connActiveL1: null,
  connL1Ids: [],
  connL0Map: {},
};

/* ── Helpers ──────────────────────────────────────────────── */

function shortText(value, max = 140) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function formatTime(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  const locale = currentLocale === "en" ? "en-US" : "zh-CN";
  return parsed.toLocaleString(locale, { hour12: false });
}

function getOverviewCount(level) {
  return Number(state.overview?.[OVERVIEW_KEYS[level]] ?? 0);
}

/* ── Panel / nav state ───────────────────────────────────── */

function setPanel(name) {
  state.activePanel = name || null;
  if (state.activePanel) {
    document.body.dataset.panel = state.activePanel;
  } else {
    delete document.body.dataset.panel;
  }
}

function togglePanel(name) {
  setPanel(state.activePanel === name ? null : name);
}

function setNavOpen(open) {
  if (open) document.body.dataset.nav = "open";
  else delete document.body.dataset.nav;
}

function isNavDrawerLayout() {
  return window.matchMedia("(max-width: 960px)").matches;
}

function closeTransientUi() {
  setPanel(null);
  setNavOpen(false);
}

function setActivity(key, tone = "idle", ...args) {
  activityText.textContent = t(key, ...args);
  activityText.dataset.tone = tone;
}

/* ── Status pill ─────────────────────────────────────────── */

function updateStatusPill(overview = {}) {
  const pending = Number(overview.pendingL0 ?? 0);
  const openTopics = Number(overview.openTopics ?? 0);
  const lastIndexed = overview.lastIndexedAt ? formatTime(overview.lastIndexedAt) : t("nav.waiting");
  const conflictCount = Array.isArray(overview.runtimeIssues) ? overview.runtimeIssues.length : 0;
  const startupRepairStatus = String(overview.startupRepairStatus || "idle");
  if (statusPill) {
  if (conflictCount > 0) {
    statusPill.textContent = t("status.conflictsDetected", conflictCount);
    statusPill.dataset.tone = "warning";
    } else if (startupRepairStatus === "running") {
      statusPill.textContent = t("status.startupRepairPillRunning");
      statusPill.dataset.tone = "pending";
    } else if (startupRepairStatus === "failed") {
      statusPill.textContent = t("status.startupRepairPillFailed");
      statusPill.dataset.tone = "warning";
    } else if (pending > 0) {
      statusPill.textContent = t("status.pending", pending, openTopics);
      statusPill.dataset.tone = "pending";
  } else {
      statusPill.textContent = t("status.ready");
      statusPill.dataset.tone = "ready";
    }
  }
  navLastIndexed.textContent = lastIndexed;
}

function updateActivityFromOverview(overview = state.overview) {
  const runtimeIssues = Array.isArray(overview.runtimeIssues) ? overview.runtimeIssues : [];
  const startupRepairStatus = String(overview.startupRepairStatus || "idle");
  const startupRepairMessage = String(overview.startupRepairMessage || "").trim();
  if (runtimeIssues.length > 0) {
    setActivity("status.conflictsDetected", "warning", runtimeIssues.length);
    return;
  }
  if (startupRepairStatus === "running") {
    setActivity("status.startupRepairRunning", "warning");
    return;
  }
  if (startupRepairStatus === "failed") {
    if (startupRepairMessage) {
      setActivity("status.startupRepairFailedWithDetail", "warning", startupRepairMessage);
    } else {
      setActivity("status.startupRepairFailed", "warning");
    }
    return;
  }
  setActivity("status.ready", "success");
}

function formatConflictSummary(conflict) {
  const text = String(conflict || "");
  if (!text) return t("boundary.noConflict");
  if (text.includes("allowPromptInjection")) return t("boundary.conflictPromptInjection");
  if (text.includes("recallEnabled=false")) return t("boundary.conflictRecallDisabled");
  if (text.includes("plugins.entries.memory-core.enabled")) return t("boundary.conflictMemoryCore");
  if (text.includes("session-memory")) return t("boundary.conflictSessionHook");
  if (text.includes("memorySearch")) return t("boundary.conflictMemorySearch");
  if (text.includes("memoryFlush")) return t("boundary.conflictMemoryFlush");
  return text;
}

/* ── Overview ────────────────────────────────────────────── */

const OV_ICONS = {
  memory: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  recall: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  reasoning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  health: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
};

function createOvGroup(titleKey, iconKey, content) {
  const group = document.createElement("div");
  group.className = "ov-group";

  const head = document.createElement("div");
  head.className = "ov-group-head";
  const iconSpan = document.createElement("span");
  iconSpan.className = "ov-group-icon";
  iconSpan.innerHTML = OV_ICONS[iconKey] || "";
  const titleSpan = document.createElement("span");
  titleSpan.className = "ov-group-title";
  titleSpan.textContent = t(titleKey);
  head.append(iconSpan, titleSpan);

  group.append(head, content);
  return group;
}

function createHeroCell(value, label, note) {
  const cell = document.createElement("div");
  cell.className = "ov-hero-cell";
  const v = document.createElement("div");
  v.className = "ov-hero-value";
  v.textContent = String(value ?? 0);
  const l = document.createElement("div");
  l.className = "ov-hero-label";
  l.textContent = label;
  cell.append(v, l);
  if (note) {
    const n = document.createElement("div");
    n.className = "ov-hero-note";
    n.textContent = note;
    cell.append(n);
  }
  return cell;
}

function createMetricCell(label, value, tone, note) {
  const cell = document.createElement("div");
  cell.className = "ov-metric-cell";

  const left = document.createElement("div");
  left.className = "ov-metric-left";
  const lbl = document.createElement("div");
  lbl.className = "ov-metric-label";
  lbl.textContent = label;
  left.append(lbl);
  if (note) {
    const nt = document.createElement("div");
    nt.className = "ov-metric-note";
    nt.textContent = note;
    left.append(nt);
  }

  const val = document.createElement("div");
  val.className = "ov-metric-val";
  if (tone && tone !== "default") val.dataset.tone = tone;

  if (tone === "success" || tone === "danger" || tone === "warning") {
    const dot = document.createElement("span");
    dot.className = "ov-status-dot";
    dot.dataset.tone = tone;
    val.append(dot);
  }
  val.append(document.createTextNode(String(value ?? "")));

  cell.append(left, val);
  return cell;
}

function renderOverview(overview = {}) {
  state.overview = overview || {};
  updateStatusPill(state.overview);
  overviewCards.innerHTML = "";

  const runtimeIssues = Array.isArray(overview.runtimeIssues)
    ? overview.runtimeIssues.filter(Boolean)
    : [];
  const memoryRuntimeHealthy = Boolean(overview.memoryRuntimeHealthy);
  const slotOwner = String(overview.slotOwner || "").trim();
  const dynamicMemoryRuntime = String(overview.dynamicMemoryRuntime || "").trim();
  const workspaceBootstrapPresent = Boolean(overview.workspaceBootstrapPresent);
  const lastRecallInjected = Boolean(overview.lastRecallInjected);
  const lastRecallEnoughAt = overview.lastRecallEnoughAt || "none";
  const lastRecallCacheHit = Boolean(overview.lastRecallCacheHit);
  const lastRecallPath = overview.lastRecallPath || "explicit";
  const currentReasoningMode = overview.currentReasoningMode || state.settings.reasoningMode || "answer_first";
  const lastRecallBudgetLimited = Boolean(overview.lastRecallBudgetLimited);
  const lastShadowDeepQueued = Boolean(overview.lastShadowDeepQueued);
  const primaryConflict = formatConflictSummary(runtimeIssues[0]);

  const heroRow = document.createElement("div");
  heroRow.className = "ov-hero-row";
  heroRow.append(
    createHeroCell(overview.totalL0 ?? 0, t("nav.l0")),
    createHeroCell(overview.totalL1 ?? 0, t("nav.l1")),
    createHeroCell(overview.totalL2Project ?? 0, t("nav.l2_project")),
    createHeroCell(overview.totalL2Time ?? 0, t("nav.l2_time")),
    createHeroCell(overview.totalProfiles ?? 0, t("nav.profile"), overview.lastIndexedAt ? "✓" : "–"),
    createHeroCell(overview.pendingL0 ?? 0, t("overview.pending")),
  );
  const g1 = createOvGroup("overview.group.memory", "memory", heroRow);

  const recallGrid = document.createElement("div");
  recallGrid.className = "ov-metric-grid";
  recallGrid.append(
    createMetricCell(t("overview.recallMs"), `${overview.lastRecallMs ?? 0} ms`, "default"),
    createMetricCell(t("overview.recallMode"), t(`recall.${overview.lastRecallMode || "none"}`), "default"),
    createMetricCell(t("overview.recallPath"), t(`recall.path.${lastRecallPath}`), "default"),
    createMetricCell(
      t("overview.recallInjected"),
      lastRecallInjected ? t("boundary.injected") : t("boundary.notInjected"),
      lastRecallInjected ? "success" : "default",
      lastRecallCacheHit ? t("boundary.cacheHit") : t("boundary.cacheMiss"),
    ),
    createMetricCell(t("overview.recallEnough"), t(`enough.${lastRecallEnoughAt}`), "default"),
    createMetricCell(t("overview.recallTimeouts"), overview.recallTimeouts ?? 0, "default"),
  );
  const g2 = createOvGroup("overview.group.recall", "recall", recallGrid);

  const reasonGrid = document.createElement("div");
  reasonGrid.className = "ov-metric-grid";
  reasonGrid.append(
    createMetricCell(t("overview.reasoningMode"), t(`reasoning.${currentReasoningMode}`), "default"),
    createMetricCell(t("overview.queued"), overview.queuedSessions ?? 0, "default"),
    createMetricCell(
      t("overview.budgetStop"),
      lastRecallBudgetLimited ? t("boundary.budgetStopped") : t("boundary.budgetNotStopped"),
      lastRecallBudgetLimited ? "warning" : "default",
    ),
    createMetricCell(
      t("overview.shadowDeep"),
      lastShadowDeepQueued ? t("boundary.shadowQueued") : t("boundary.shadowNotQueued"),
      lastShadowDeepQueued ? "warning" : "default",
    ),
  );
  const g3 = createOvGroup("overview.group.reasoning", "reasoning", reasonGrid);

  const healthGrid = document.createElement("div");
  healthGrid.className = "ov-metric-grid";
  healthGrid.append(
    createMetricCell(
      t("overview.slotOwner"),
      slotOwner || t("boundary.ownerMissing"),
      memoryRuntimeHealthy ? "success" : "danger",
      memoryRuntimeHealthy ? t("boundary.healthy") : t("boundary.conflicted"),
    ),
    createMetricCell(
      t("overview.dynamicRuntime"),
      dynamicMemoryRuntime || t("boundary.runtimeMisconfigured"),
      memoryRuntimeHealthy ? "success" : "danger",
      memoryRuntimeHealthy ? t("boundary.runtimeClawXMemory") : primaryConflict,
    ),
    createMetricCell(
      t("overview.workspaceBootstrap"),
      workspaceBootstrapPresent ? t("boundary.present") : t("boundary.absent"),
      "default",
      workspaceBootstrapPresent ? t("boundary.workspaceBootstrap") : "",
    ),
    createMetricCell(
      t("overview.runtimeIssues"),
      runtimeIssues.length,
      runtimeIssues.length > 0 ? "danger" : "default",
      primaryConflict,
    ),
  );
  const g4 = createOvGroup("overview.group.health", "health", healthGrid);

  overviewCards.append(g1, g2, g3, g4);
  if (overviewScroll) overviewScroll.scrollTop = 0;
  renderNavCounts();
}

/* ── Settings ────────────────────────────────────────────── */

function applySettings(settings = {}) {
  state.settings = {
    reasoningMode: "answer_first",
    maxAutoReplyLatencyMs: 1800,
    ...(settings || {}),
  };
  const activeMode = state.settings.reasoningMode || "answer_first";
  if (reasoningModeToggle) {
    reasoningModeToggle.querySelectorAll(".popover-seg-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === activeMode);
    });
  }
  maxAutoReplyLatencyInput.value = String(state.settings.maxAutoReplyLatencyMs ?? 1800);
  updateSettingsVisibility();
}

function readSettingsForm() {
  const parsedLatency = Number.parseInt(String(maxAutoReplyLatencyInput.value || "").trim(), 10);
  const activeBtn = reasoningModeToggle?.querySelector(".popover-seg-btn.active");
  const reasoningMode = activeBtn?.dataset.mode === "accuracy_first" ? "accuracy_first" : "answer_first";
  const next = { reasoningMode };
  if (reasoningMode === "answer_first") {
    next.maxAutoReplyLatencyMs = Number.isFinite(parsedLatency)
      ? Math.max(300, parsedLatency)
      : state.settings.maxAutoReplyLatencyMs;
  }
  return next;
}

function updateSettingsVisibility() {
  const activeBtn = reasoningModeToggle?.querySelector(".popover-seg-btn.active");
  const answerFirst = (activeBtn?.dataset.mode || state.settings.reasoningMode) === "answer_first";
  if (latencyFieldWrap) {
    latencyFieldWrap.hidden = !answerFirst;
    latencyFieldWrap.style.display = answerFirst ? "" : "none";
    latencyFieldWrap.setAttribute("aria-hidden", answerFirst ? "false" : "true");
  }
  if (maxAutoReplyLatencyInput) {
    maxAutoReplyLatencyInput.disabled = !answerFirst;
  }
}

/* ── Nav counts ──────────────────────────────────────────── */

function renderNavCounts() {
  levelTabs.querySelectorAll("[data-count-for]").forEach((node) => {
    const level = node.getAttribute("data-count-for");
    if (level) node.textContent = String(getOverviewCount(level));
  });
}

/* ── Entry normalization ─────────────────────────────────── */

function unwrapRaw(level, raw) {
  if (!raw) return raw;
  if ((level === "l2_time" || level === "l2_project") && raw.item) return raw.item;
  return raw;
}

function getRawId(level, raw) {
  if (!raw) return "";
  if (level === "l2_time") return raw.l2IndexId || raw.dateKey || "";
  if (level === "l2_project") return raw.l2IndexId || raw.projectKey || raw.projectName || "";
  if (level === "l1") return raw.l1IndexId || raw.timePeriod || "";
  if (level === "l0") return raw.l0IndexId || raw.sessionKey || "";
  if (level === "profile") return raw.recordId || "global_profile_record";
  return "";
}

function normalizeEntry(level, rawInput) {
  const raw = unwrapRaw(level, rawInput);
  if (!raw) return null;

  if (level === "l2_time") {
    return {
      level, id: getRawId(level, raw), badge: "time",
      title: raw.dateKey || t("entry.unnamed.time"),
      subtitle: raw.summary || t("detail.noSummary"),
      meta: `L1 ${raw.l1Source?.length ?? 0} · ${formatTime(raw.updatedAt)}`,
      raw,
    };
  }

  if (level === "l2_project") {
    return {
      level, id: getRawId(level, raw), badge: formatStatus(raw.currentStatus),
      title: raw.projectName || t("entry.unnamed.project"),
      subtitle: raw.latestProgress || raw.summary || t("detail.noProgress"),
      meta: `${t("meta.sourceCount", raw.l1Source?.length ?? 0)} · ${formatTime(raw.updatedAt)}`,
      raw,
    };
  }

  if (level === "l1") {
    return {
      level, id: getRawId(level, raw), badge: "topic",
      title: raw.timePeriod || t("entry.unnamed.window"),
      subtitle: raw.summary || t("detail.noSummary"),
      meta: `${t("meta.l0Count", raw.l0Source?.length ?? 0)} · ${t("meta.projectCount", raw.projectDetails?.length ?? 0)}`,
      raw,
    };
  }

  if (level === "l0") {
    const msgs = raw.messages || [];
    const userMsgs = msgs.filter((m) => m.role === "user").map((m) => m.content);
    const asstMsgs = msgs.filter((m) => m.role === "assistant").map((m) => m.content);
    return {
      level, id: getRawId(level, raw), badge: "raw",
      title: shortText(userMsgs[userMsgs.length - 1] || t("entry.unnamed.session"), 80),
      subtitle: shortText(asstMsgs[asstMsgs.length - 1] || t("detail.noMessages"), 180),
      meta: formatTime(raw.timestamp),
      raw,
    };
  }

  if (level === "profile") {
    return {
      level, id: getRawId(level, raw), badge: "profile",
      title: t("entry.globalProfile"),
      subtitle: raw.profileText || t("detail.noProfile"),
      meta: `L1 ${raw.sourceL1Ids?.length ?? 0} · ${formatTime(raw.updatedAt)}`,
      raw,
    };
  }

  return null;
}

function normalizeEntryList(level, raws = []) {
  return (raws || []).map((r) => normalizeEntry(level, r)).filter(Boolean);
}

/* ── Empty state ─────────────────────────────────────────── */

function createEmptyState(text) {
  const el = document.createElement("div");
  el.className = "empty-state";
  el.textContent = text;
  return el;
}

/* ── Entry list render ───────────────────────────────────── */

function renderEntryList() {
  entryList.innerHTML = "";
  const config = getLevelConfig(state.activeLevel);
  if (state.visibleItems.length === 0) {
    entryList.append(createEmptyState(config.emptyText));
    state.selectedIndex = -1;
    renderDetail();
    browserMeta.textContent = "0";
    return;
  }

  browserMeta.textContent = t("stream.items", state.visibleItems.length);
  if (state.selectedIndex < 0 || state.selectedIndex >= state.visibleItems.length) {
    state.selectedIndex = 0;
  }

  state.visibleItems.forEach((item, idx) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "entry-card";
    if (idx === state.selectedIndex) btn.classList.add("active");

    const topline = document.createElement("div");
    topline.className = "entry-topline";

    const title = document.createElement("div");
    title.className = "entry-title";
    title.textContent = item.title;

    const badge = document.createElement("span");
    badge.className = "entry-badge";
    badge.textContent = item.badge;

    topline.append(title, badge);

    const subtitle = document.createElement("div");
    subtitle.className = "entry-subtitle";
    subtitle.textContent = shortText(item.subtitle, 200);

    const meta = document.createElement("div");
    meta.className = "entry-meta";
    meta.textContent = item.meta;

    btn.append(topline, subtitle, meta);
    btn.addEventListener("click", () => {
      state.selectedIndex = idx;
      renderEntryList();
      renderDetail();
      setPanel("detail");
      if (isNavDrawerLayout()) setNavOpen(false);
    });
    li.append(btn);
    entryList.append(li);
  });

  renderPagination();
  renderDetail();
}

function renderPagination() {
  let pager = document.getElementById("listPagination");
  if (!pager) {
    pager = document.createElement("div");
    pager.id = "listPagination";
    pager.className = "list-pagination";
    entryList.parentElement.appendChild(pager);
  }
  pager.innerHTML = "";

  if (state.isSearching) {
    pager.style.display = "none";
    return;
  }
  const overviewKey = OVERVIEW_KEYS[state.activeLevel];
  const total = (overviewKey && state.overview[overviewKey]) || 0;
  const totalPages = Math.max(1, Math.ceil(total / state.listPageSize));

  if (totalPages <= 1 && state.listPage === 0) {
    pager.style.display = "none";
    return;
  }
  pager.style.display = "";

  const prevBtn = document.createElement("button");
  prevBtn.className = "page-btn";
  prevBtn.textContent = t("stream.prevPage");
  prevBtn.disabled = state.listPage <= 0;
  prevBtn.addEventListener("click", () => {
    if (state.listPage > 0) {
      state.listPage--;
      state.selectedIndex = 0;
      loadLevel(state.activeLevel, listQueryInput.value || "");
    }
  });

  const info = document.createElement("span");
  info.className = "page-info";
  info.textContent = t("stream.pageInfo", state.listPage + 1, totalPages);

  const nextBtn = document.createElement("button");
  nextBtn.className = "page-btn";
  nextBtn.textContent = t("stream.nextPage");
  nextBtn.disabled = state.listPage >= totalPages - 1;
  nextBtn.addEventListener("click", () => {
    if (state.listPage < totalPages - 1) {
      state.listPage++;
      state.selectedIndex = 0;
      loadLevel(state.activeLevel, listQueryInput.value || "");
    }
  });

  pager.append(prevBtn, info, nextBtn);
}

/* ── Detail render helpers ───────────────────────────────── */

function createMetaChip(label, value) {
  const chip = document.createElement("span");
  chip.className = "meta-chip";
  const lbl = document.createElement("span");
  lbl.className = "meta-label";
  lbl.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value;
  chip.append(lbl, strong);
  return chip;
}

function createDetailSection(title, body) {
  const section = document.createElement("section");
  section.className = "detail-section";
  const h = document.createElement("h4");
  h.textContent = title;
  section.append(h);
  if (typeof body === "string") {
    const p = document.createElement("p");
    p.textContent = body;
    section.append(p);
  } else if (body) {
    section.append(body);
  }
  return section;
}

function createTagList(items = []) {
  const wrap = document.createElement("div");
  wrap.className = "tag-list";
  (items || []).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = String(item);
    wrap.append(tag);
  });
  return wrap;
}

function createClickableTagList(ids = [], level) {
  const wrap = document.createElement("div");
  wrap.className = "tag-list";
  (ids || []).forEach((id) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag tag-clickable";
    btn.textContent = String(id);
    btn.addEventListener("click", () => navigateToRecord(id, level));
    wrap.append(btn);
  });
  return wrap;
}

async function navigateToRecord(id, level) {
  const lookupMap = level === "l1" ? state.l1ById : state.l0ById;
  let raw = lookupMap[id];
  if (!raw) {
    try {
      const endpoint = level === "l1" ? "./api/l1/byIds" : "./api/l0/byIds";
      const data = await fetchJson(`${endpoint}?ids=${encodeURIComponent(id)}`);
      if (data && data.length > 0) {
        raw = data[0];
        lookupMap[id] = raw;
      }
    } catch (e) { console.warn("Failed to fetch record:", e); }
  }
  if (!raw) return;
  const entry = normalizeEntry(level, raw);
  if (!entry) return;

  if (state.viewMode === "command_center") switchView("list");
  state.activeLevel = level;
  state.listPage = 0;
  state.visibleItems = [entry];
  state.selectedIndex = 0;
  renderActiveNav();
  renderEntryList();
  renderDetail();
  setPanel("detail");
}

function createProjectStack(projects = []) {
  const stack = document.createElement("div");
  stack.className = "project-stack";
  projects.forEach((proj) => {
    const card = document.createElement("div");
    card.className = "project-card";
    const title = document.createElement("strong");
    title.textContent = proj.name || t("entry.unnamed.project");
    const status = document.createElement("p");
    status.textContent = t("project.statusLabel", formatStatus(proj.status));
    const summary = document.createElement("p");
    summary.textContent = proj.summary || t("detail.noSummary");
    card.append(title, status, summary);
    if (proj.latestProgress) {
      const progress = document.createElement("p");
      progress.textContent = proj.latestProgress;
      card.append(progress);
    }
    stack.append(card);
  });
  return stack;
}

function createMessageList(messages = []) {
  const list = document.createElement("div");
  list.className = "message-list";
  messages.forEach((msg) => {
    const item = document.createElement("div");
    const roleClass = msg.role === "user" ? " is-user" : msg.role === "assistant" ? " is-assistant" : "";
    item.className = `message-item${roleClass}`;
    const role = document.createElement("div");
    role.className = "message-role";
    role.textContent = msg.role;
    const content = document.createElement("p");
    content.className = "message-content";
    content.textContent = msg.content || "";
    item.append(role, content);
    list.append(item);
  });
  return list;
}

/* ── Detail render ───────────────────────────────────────── */

function renderDetail() {
  detailMeta.innerHTML = "";
  detailBody.innerHTML = "";

  const entry = state.visibleItems[state.selectedIndex];
  if (!entry) {
    detailTitle.textContent = t("detail.title");
    detailBody.append(createEmptyState(t("detail.empty")));
    return;
  }

  const { level, raw } = entry;
  detailTitle.textContent = entry.title;

  if (level === "l2_time") {
    detailMeta.append(
      createMetaChip(t("meta.date"), raw.dateKey || "-"),
      createMetaChip(t("meta.source"), t("meta.l1Count", raw.l1Source?.length ?? 0)),
      createMetaChip(t("meta.update"), formatTime(raw.updatedAt)),
    );
    detailBody.append(
      createDetailSection(t("detail.summary"), raw.summary || t("detail.noSummary")),
      createDetailSection(t("detail.sourceWindows"), createClickableTagList(raw.l1Source || [], "l1")),
    );
    return;
  }

  if (level === "l2_project") {
    detailMeta.append(
      createMetaChip(t("meta.projectKey"), raw.projectKey || "-"),
      createMetaChip(t("meta.status"), formatStatus(raw.currentStatus)),
      createMetaChip(t("meta.update"), formatTime(raw.updatedAt)),
    );
    detailBody.append(
      createDetailSection(t("detail.summary"), raw.summary || t("detail.noSummary")),
      createDetailSection(t("detail.progress"), raw.latestProgress || t("detail.noProgress")),
      createDetailSection(t("detail.sourceWindows"), createClickableTagList(raw.l1Source || [], "l1")),
    );
    return;
  }

  if (level === "l1") {
    detailMeta.append(
      createMetaChip(t("meta.session"), raw.sessionKey || "-"),
      createMetaChip(t("meta.start"), formatTime(raw.startedAt)),
      createMetaChip(t("meta.end"), formatTime(raw.endedAt)),
    );
    detailBody.append(
      createDetailSection(t("detail.summary"), raw.summary || t("detail.noSummary")),
      createDetailSection(t("detail.situation"), raw.situationTimeInfo || t("detail.noSituation")),
      createDetailSection(t("detail.projects"), raw.projectDetails?.length ? createProjectStack(raw.projectDetails) : t("detail.noProjects")),
      createDetailSection(
        t("detail.facts"),
        raw.facts?.length ? createTagList(raw.facts.map((f) => `${f.factKey}: ${f.factValue}`)) : t("detail.noFacts"),
      ),
      createDetailSection(t("detail.sourceL0"), createClickableTagList(raw.l0Source || [], "l0")),
    );
    return;
  }

  if (level === "l0") {
    detailMeta.append(
      createMetaChip(t("meta.session"), raw.sessionKey || "-"),
      createMetaChip(t("meta.time"), formatTime(raw.timestamp)),
      createMetaChip(t("meta.messages"), t("meta.msgCount", raw.messages?.length ?? 0)),
    );
    detailBody.append(
      createDetailSection(t("detail.messages"), createMessageList(raw.messages || [])),
    );
    return;
  }

  if (level === "profile") {
    detailMeta.append(
      createMetaChip(t("meta.source"), t("meta.l1Count", raw.sourceL1Ids?.length ?? 0)),
      createMetaChip(t("meta.update"), formatTime(raw.updatedAt)),
    );
    detailBody.append(
      createDetailSection(t("detail.profileSummary"), raw.profileText || t("detail.noProfile")),
      createDetailSection(t("detail.sourceWindows"), createClickableTagList(raw.sourceL1Ids || [], "l1")),
    );
  }
}

/* ── Command Center ──────────────────────────────────────── */

function buildDataIndexes() {
  state.l1ById = {};
  state.l0ById = {};
  (state.baseRaw.l1 || []).forEach((raw) => {
    if (raw.l1IndexId) state.l1ById[raw.l1IndexId] = raw;
  });
  (state.baseRaw.l0 || []).forEach((raw) => {
    if (raw.l0IndexId) state.l0ById[raw.l0IndexId] = raw;
  });
}

function switchView(mode) {
  state.viewMode = mode;
  const workspace = $(".workspace");
  const shell = $(".app-shell");
  workspace.dataset.view = mode;
  shell.dataset.view = mode;
  const isCmd = mode === "command_center";

  viewToggleBtn.setAttribute("aria-checked", String(isCmd));
  const labels = document.querySelectorAll(".view-toggle-label");
  if (labels.length >= 2) {
    labels[0].classList.toggle("active", isCmd);
    labels[1].classList.toggle("active", !isCmd);
  }

  const h2 = $(".topbar h2");
  if (isCmd) {
    h2.dataset.i18n = "topbar.commandCenter";
    h2.textContent = t("topbar.commandCenter");
    renderCommandCenter();
  } else {
    h2.dataset.i18n = "topbar.listView";
    h2.textContent = t("topbar.listView");
    state.listPage = 0;
    loadLevel(state.activeLevel, listQueryInput.value || "");
  }
}

function switchBoard(board) {
  state.activeBoard = board;
  boardNavTabs.querySelectorAll("[data-board]").forEach((b) => {
    b.classList.toggle("active", b.dataset.board === board);
  });
  projectBoard.classList.toggle("board-active", board === "project");
  timelineBoard.classList.toggle("board-active", board === "timeline");
  const pb = document.getElementById("profileBoard");
  if (pb) pb.classList.toggle("board-active", board === "profile");
  if (board === "project") renderProjectBoard();
  else if (board === "timeline") renderTimelineBoard();
  else if (board === "profile") renderProfileBoard();
  closeConnection();
}

function renderCommandCenter() {
  if (state.activeBoard === "project") renderProjectBoard();
  else if (state.activeBoard === "timeline") renderTimelineBoard();
  else if (state.activeBoard === "profile") renderProfileBoard();
}

/* ── Project Board ───────────────────────────────────────── */

function renderProjectBoard() {
  projectBoard.innerHTML = "";
  const projects = (state.baseRaw.l2_project || []).map((p) => unwrapRaw("l2_project", p));
  if (projects.length === 0) {
    projectBoard.append(createEmptyState(t("level.l2_project.empty")));
    return;
  }
  const groups = {};
  const statusOrder = ["in_progress", "planned", "done"];
  projects.forEach((p) => {
    const s = p.currentStatus || "planned";
    if (!groups[s]) groups[s] = [];
    groups[s].push(p);
  });
  const allStatuses = statusOrder;
  allStatuses.forEach((status) => {
    const items = groups[status];
    if (!items || items.length === 0) return;
    const group = document.createElement("div");
    group.className = "board-group";
    const header = document.createElement("div");
    header.className = "board-group-header";
    const title = document.createElement("h4");
    title.textContent = formatStatus(status);
    const count = document.createElement("span");
    count.className = "board-group-count";
    count.textContent = String(items.length);
    header.append(title, count);
    group.append(header);
    const grid = document.createElement("div");
    grid.className = "board-card-grid";
    items.forEach((p) => grid.append(createProjectCard(p)));
    group.append(grid);
    projectBoard.append(group);
  });
}

function createProjectCard(project) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "board-card";
  const status = project.currentStatus || "planned";
  card.dataset.status = status;
  const id = project.l2IndexId || project.projectKey || project.projectName || "";
  card.dataset.id = id;
  const connId = state.connectionTarget
    ? (state.connectionTarget.l2IndexId || state.connectionTarget.projectKey || "")
    : "";
  if (connId && connId === id) card.classList.add("active");

  const title = document.createElement("div");
  title.className = "board-card-title";
  title.textContent = project.projectName || t("entry.unnamed.project");

  const badge = document.createElement("span");
  badge.className = "board-card-status";
  badge.dataset.status = status;
  badge.textContent = formatStatus(status);

  const body = document.createElement("div");
  body.className = "board-card-body";
  body.textContent = shortText(project.summary || project.latestProgress || "", 140);

  const meta = document.createElement("div");
  meta.className = "board-card-meta";
  meta.textContent = `${t("meta.sourceCount", project.l1Source?.length ?? 0)} · ${formatTime(project.updatedAt)}`;

  card.append(title, badge, body, meta);
  card.addEventListener("click", () => openConnection(project, "l2_project"));
  return card;
}

/* ── Timeline Board ──────────────────────────────────────── */

function renderTimelineBoard() {
  timelineBoard.innerHTML = "";
  const records = (state.baseRaw.l2_time || []).map((r) => unwrapRaw("l2_time", r));
  if (records.length === 0) {
    timelineBoard.append(createEmptyState(t("level.l2_time.empty")));
    return;
  }
  const track = document.createElement("div");
  track.className = "timeline-track";
  records.forEach((record) => {
    const node = document.createElement("div");
    node.className = "timeline-node";
    const recId = record.l2IndexId || record.dateKey || "";
    const connId = state.connectionTarget
      ? (state.connectionTarget.l2IndexId || state.connectionTarget.dateKey || "")
      : "";
    if (connId && connId === recId) node.classList.add("active");

    const marker = document.createElement("div");
    marker.className = "timeline-marker";

    const card = document.createElement("button");
    card.type = "button";
    card.className = "timeline-card";
    card.dataset.id = recId;

    const date = document.createElement("div");
    date.className = "timeline-date";
    date.textContent = record.dateKey || t("entry.unnamed.time");

    const summary = document.createElement("div");
    summary.className = "timeline-summary";
    summary.textContent = shortText(record.summary || "", 180);

    const meta = document.createElement("div");
    meta.className = "timeline-meta";
    meta.textContent = t("meta.l1Count", record.l1Source?.length ?? 0);

    card.append(date, summary, meta);
    card.addEventListener("click", () => openConnection(record, "l2_time"));
    node.append(marker, card);
    track.append(node);
  });
  timelineBoard.append(track);
}

/* ── Profile Board ───────────────────────────────────────── */

async function showL1Detail(id) {
  let raw = state.l1ById[id];
  if (!raw) {
    try {
      const data = await fetchJson(`./api/l1/byIds?ids=${encodeURIComponent(id)}`);
      if (data && data.length > 0) { raw = data[0]; state.l1ById[id] = raw; }
    } catch (e) { console.warn("Failed to fetch L1:", e); }
  }
  if (!raw) return;
  const entry = normalizeEntry("l1", raw);
  if (!entry) return;
  let idx = state.visibleItems.findIndex((i) => i.id === entry.id);
  if (idx < 0) { state.visibleItems.push(entry); idx = state.visibleItems.length - 1; }
  state.selectedIndex = idx;
  renderDetail();
  setPanel("detail");
}

async function renderProfileBoard() {
  const pb = document.getElementById("profileBoard");
  if (!pb) return;
  pb.innerHTML = "";
  const gp = state.globalProfile;
  if (!gp || !gp.profileText) {
    pb.append(createEmptyState(t("board.profile.empty")));
    return;
  }

  const l1Ids = gp.sourceL1Ids || [];
  const missingL1 = l1Ids.filter((id) => !state.l1ById[id]);
  if (missingL1.length > 0) {
    try {
      const data = await fetchJson(`./api/l1/byIds?ids=${missingL1.join(",")}`);
      (data || []).forEach((r) => { if (r.l1IndexId) state.l1ById[r.l1IndexId] = r; });
    } catch (e) { console.warn("Failed to fetch L1 for profile:", e); }
  }

  const card = document.createElement("div");
  card.className = "profile-board-card";

  const paragraphs = (gp.profileText || "").split(/\n+/).filter(Boolean);
  paragraphs.forEach((p) => {
    const para = document.createElement("p");
    para.className = "profile-para";
    para.textContent = p;
    card.append(para);
  });

  if (l1Ids.length > 0) {
    const topicHead = document.createElement("div");
    topicHead.className = "profile-section-title";
    topicHead.textContent = t("board.profile.topics");
    card.append(topicHead);

    const topicList = document.createElement("div");
    topicList.className = "profile-topic-list";
    l1Ids.forEach((id) => {
      const l1 = state.l1ById[id];
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "profile-topic-chip";
      chip.textContent = shortText(l1?.summary || l1?.mergedSummary || id, 80);
      chip.addEventListener("click", () => void showL1Detail(id));
      topicList.append(chip);
    });
    card.append(topicList);
  }

  const connBtn = document.createElement("button");
  connBtn.type = "button";
  connBtn.className = "profile-conn-btn";
  connBtn.textContent = t("board.profile.viewConn");
  connBtn.addEventListener("click", () => openConnection(gp, "profile"));
  card.append(connBtn);

  pb.append(card);
}

/* ── Connection Panel ────────────────────────────────────── */

function getRecordId(record) {
  return record.l2IndexId || record.recordId || record.dateKey || record.projectKey || record.projectName || "";
}

async function openConnection(l2Record, type) {
  const currentId = getRecordId(l2Record);
  if (state.connectionTarget && getRecordId(state.connectionTarget) === currentId) {
    closeConnection();
    return;
  }
  state.connectionTarget = l2Record;
  state.connectionType = type;
  state.connL1Page = 0;
  state.connL0Page = 0;
  state.connActiveL1 = null;
  state.connL1Ids = [];
  state.connL0Map = {};
  boardScroll.style.display = "none";
  connectionPanel.classList.add("conn-open");

  const l1SourceIds = l2Record.l1Source || l2Record.sourceL1Ids || [];
  const missingL1 = l1SourceIds.filter(id => !state.l1ById[id]);
  if (missingL1.length > 0) {
    try {
      const l1Data = await fetchJson(`./api/l1/byIds?ids=${missingL1.join(",")}`);
      (l1Data || []).forEach(r => { if (r.l1IndexId) state.l1ById[r.l1IndexId] = r; });
    } catch (e) { console.warn("Failed to fetch missing L1:", e); }
  }

  const allL0Ids = new Set();
  l1SourceIds.forEach(l1Id => {
    const l1 = state.l1ById[l1Id];
    if (l1 && l1.l0Source) l1.l0Source.forEach(id => allL0Ids.add(id));
  });
  const missingL0 = [...allL0Ids].filter(id => !state.l0ById[id]);
  if (missingL0.length > 0) {
    try {
      const l0Data = await fetchJson(`./api/l0/byIds?ids=${missingL0.join(",")}`);
      (l0Data || []).forEach(r => { if (r.l0IndexId) state.l0ById[r.l0IndexId] = r; });
    } catch (e) { console.warn("Failed to fetch missing L0:", e); }
  }

  renderConnectionGraph(l2Record, type);
}

function closeConnection() {
  state.connectionTarget = null;
  state.connectionType = null;
  connectionPanel.classList.remove("conn-open");
  connectionSvg.innerHTML = "";
  connectionColumns.innerHTML = "";
  boardScroll.style.display = "";
}

function renderConnectionGraph(l2Record, type) {
  connectionColumns.innerHTML = "";
  connectionSvg.innerHTML = "";

  const allL1Ids = [...(l2Record.l1Source || l2Record.sourceL1Ids || [])].reverse();
  state.connL1Ids = allL1Ids;

  const l0Map = {};
  allL1Ids.forEach((id) => {
    const l1 = state.l1ById[id];
    l0Map[id] = l1 ? [...(l1.l0Source || [])].reverse() : [];
  });
  state.connL0Map = l0Map;

  if (!state.connActiveL1 && allL1Ids.length > 0) {
    const firstPageIds = allL1Ids.slice(0, state.connPageSize);
    state.connActiveL1 = firstPageIds[0];
  }

  const colL2 = document.createElement("div");
  colL2.className = "conn-col";
  const l2Header = type === "profile" ? t("entry.globalProfile") : t("connection.l2");
  colL2.innerHTML = `<div class="conn-col-header">${l2Header}</div>`;
  colL2.append(createConnNode("l2", l2Record, type));

  const colL1 = document.createElement("div");
  colL1.className = "conn-col";
  colL1.dataset.role = "l1";

  const colL0 = document.createElement("div");
  colL0.className = "conn-col";
  colL0.dataset.role = "l0";

  connectionColumns.append(colL2, colL1, colL0);
  fillConnColumns();
}

function fillConnColumns() {
  const colL1 = connectionColumns.querySelector('[data-role="l1"]');
  const colL0 = connectionColumns.querySelector('[data-role="l0"]');
  if (!colL1 || !colL0) return;

  colL1.innerHTML = "";
  colL0.innerHTML = "";

  connectionSvg.innerHTML = "";
  clearHighlight();

  const ps = state.connPageSize;
  const allL1 = state.connL1Ids;
  const l1TotalPages = Math.max(1, Math.ceil(allL1.length / ps));
  state.connL1Page = Math.min(state.connL1Page, l1TotalPages - 1);
  const l1Slice = allL1.slice(state.connL1Page * ps, (state.connL1Page + 1) * ps);

  const l1Header = document.createElement("div");
  l1Header.className = "conn-col-header";
  l1Header.innerHTML = `<span>${t("connection.l1")}</span>`;
  if (l1TotalPages > 1) {
    l1Header.append(createConnPager(state.connL1Page, l1TotalPages,
      () => { state.connL1Page--; state.connActiveL1 = null; state.connL0Page = 0; fillConnColumns(); },
      () => { state.connL1Page++; state.connActiveL1 = null; state.connL0Page = 0; fillConnColumns(); },
    ));
  }
  colL1.append(l1Header);

  if (!state.connActiveL1 && l1Slice.length > 0) {
    state.connActiveL1 = l1Slice[0];
  }

  let nodeDelay = 0;
  l1Slice.forEach((id) => {
    const l1 = state.l1ById[id];
    nodeDelay += 60;
    if (l1) {
      const node = createConnNode("l1", l1, "l1");
      node.style.animationDelay = `${nodeDelay}ms`;
      if (id === state.connActiveL1) node.classList.add("conn-hl");
      colL1.append(node);
    } else {
      const ph = createConnNodePlaceholder("l1", id);
      ph.style.animationDelay = `${nodeDelay}ms`;
      colL1.append(ph);
    }
  });
  if (allL1.length === 0) {
    colL1.append(createConnEmpty());
  }

  const activeL0Ids = state.connL0Map[state.connActiveL1] || [];
  const l0TotalPages = Math.max(1, Math.ceil(activeL0Ids.length / ps));
  state.connL0Page = Math.min(state.connL0Page, l0TotalPages - 1);
  const l0Slice = activeL0Ids.slice(state.connL0Page * ps, (state.connL0Page + 1) * ps);

  const l0Header = document.createElement("div");
  l0Header.className = "conn-col-header";
  l0Header.innerHTML = `<span>${t("connection.l0")}</span>`;
  if (l0TotalPages > 1) {
    l0Header.append(createConnPager(state.connL0Page, l0TotalPages,
      () => { state.connL0Page--; fillConnColumns(); },
      () => { state.connL0Page++; fillConnColumns(); },
    ));
  }
  colL0.append(l0Header);

  l0Slice.forEach((l0Id) => {
    nodeDelay += 50;
    const l0 = state.l0ById[l0Id];
    if (l0) {
      const node = createConnNode("l0", l0, "l0");
      node.dataset.parent = state.connActiveL1;
      node.style.animationDelay = `${nodeDelay}ms`;
      colL0.append(node);
    } else {
      const ph = createConnNodePlaceholder("l0", l0Id);
      ph.dataset.parent = state.connActiveL1;
      ph.style.animationDelay = `${nodeDelay}ms`;
      colL0.append(ph);
    }
  });
  if (activeL0Ids.length === 0) {
    colL0.append(createConnEmpty());
  }

  requestAnimationFrame(() => requestAnimationFrame(() => drawConnectionLines()));
}

function createConnNode(level, record, type) {
  const node = document.createElement("div");
  node.className = `conn-node conn-node-${level}`;
  if (level === "l2") {
    node.dataset.id = getRecordId(record);
    const title = document.createElement("div");
    title.className = "conn-node-title";
    title.textContent = type === "l2_project"
      ? (record.projectName || t("entry.unnamed.project"))
      : type === "profile"
        ? t("entry.globalProfile")
        : (record.dateKey || t("entry.unnamed.time"));
    const sub = document.createElement("div");
    sub.className = "conn-node-sub";
    sub.textContent = record.summary || record.latestProgress || record.profileText || "";
    node.append(title, sub);
  } else if (level === "l1") {
    node.dataset.id = record.l1IndexId || "";
    const title = document.createElement("div");
    title.className = "conn-node-title";
    title.textContent = record.timePeriod || t("entry.unnamed.window");
    const sub = document.createElement("div");
    sub.className = "conn-node-sub";
    sub.textContent = shortText(record.summary || "", 90);
    node.append(title, sub);
  } else if (level === "l0") {
    node.dataset.id = record.l0IndexId || record.sessionKey || "";
    const msgs = record.messages || [];
    const userMsgs = msgs.filter((m) => m.role === "user");
    const asstMsgs = msgs.filter((m) => m.role === "assistant");
    const title = document.createElement("div");
    title.className = "conn-node-title";
    title.textContent = shortText(userMsgs[userMsgs.length - 1]?.content || t("entry.unnamed.session"), 50);
    const sub = document.createElement("div");
    sub.className = "conn-node-sub";
    sub.textContent = shortText(asstMsgs[asstMsgs.length - 1]?.content || "", 70);
    node.append(title, sub);
  }

  node.addEventListener("click", () => {
    const normLevel = level === "l2" ? type : level;
    const normalized = normalizeEntry(normLevel, record);
    if (!normalized) return;
    let idx = state.visibleItems.findIndex((i) => i.id === normalized.id);
    if (idx < 0) {
      state.visibleItems.push(normalized);
      idx = state.visibleItems.length - 1;
    }
    state.selectedIndex = idx;
    renderDetail();
    setPanel("detail");
  });
  return node;
}

function createConnNodePlaceholder(level, id) {
  const node = document.createElement("div");
  node.className = `conn-node conn-node-${level} conn-node-placeholder`;
  node.dataset.id = id;
  const title = document.createElement("div");
  title.className = "conn-node-title";
  title.textContent = shortText(id, 24);
  const sub = document.createElement("div");
  sub.className = "conn-node-sub";
  sub.textContent = t("connection.notLoaded");
  node.append(title, sub);
  return node;
}

function createConnPager(page, totalPages, onPrev, onNext) {
  const wrap = document.createElement("div");
  wrap.className = "conn-pager";
  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "conn-pager-btn";
  prev.textContent = "\u2039";
  prev.disabled = page <= 0;
  prev.addEventListener("click", (e) => { e.stopPropagation(); onPrev(); });
  const info = document.createElement("span");
  info.className = "conn-pager-info";
  info.textContent = `${page + 1} / ${totalPages}`;
  const next = document.createElement("button");
  next.type = "button";
  next.className = "conn-pager-btn";
  next.textContent = "\u203A";
  next.disabled = page >= totalPages - 1;
  next.addEventListener("click", (e) => { e.stopPropagation(); onNext(); });
  wrap.append(prev, info, next);
  return wrap;
}

function createConnEmpty() {
  const el = document.createElement("div");
  el.className = "empty-state";
  el.style.padding = "8px";
  el.textContent = t("connection.noData");
  return el;
}

function drawConnectionLines() {
  connectionSvg.innerHTML = "";
  if (!connectionGraph || !connectionPanel.classList.contains("conn-open")) return;

  const graphRect = connectionGraph.getBoundingClientRect();
  if (graphRect.width === 0 || graphRect.height === 0) return;

  connectionSvg.setAttribute("width", String(graphRect.width));
  connectionSvg.setAttribute("height", String(graphRect.height));
  connectionSvg.setAttribute("viewBox", `0 0 ${graphRect.width} ${graphRect.height}`);

  const l2Nodes = connectionGraph.querySelectorAll(".conn-node-l2");
  const l1Nodes = connectionGraph.querySelectorAll(".conn-node-l1");
  const l0Nodes = connectionGraph.querySelectorAll(".conn-node-l0");
  let delay = 100;

  const activeId = state.connActiveL1;
  l2Nodes.forEach((l2El) => {
    const l2R = l2El.getBoundingClientRect();
    const x1 = l2R.right - graphRect.left;
    const y1 = l2R.top + l2R.height / 2 - graphRect.top;
    l1Nodes.forEach((l1El) => {
      const l1Id = l1El.dataset.id;
      const l1R = l1El.getBoundingClientRect();
      const x2 = l1R.left - graphRect.left;
      const y2 = l1R.top + l1R.height / 2 - graphRect.top;
      const path = createSvgBezier(x1, y1, x2, y2, delay);
      path.dataset.l1 = l1Id;
      if (activeId && l1Id !== activeId) path.classList.add("conn-line-dim");
      connectionSvg.append(path);
      delay += 80;
    });
  });

  l1Nodes.forEach((l1El) => {
    const l1Id = l1El.dataset.id;
    const l1R = l1El.getBoundingClientRect();
    const x1 = l1R.right - graphRect.left;
    const y1 = l1R.top + l1R.height / 2 - graphRect.top;
    l0Nodes.forEach((l0El) => {
      if (l0El.dataset.parent !== l1Id) return;
      const l0R = l0El.getBoundingClientRect();
      const x2 = l0R.left - graphRect.left;
      const y2 = l0R.top + l0R.height / 2 - graphRect.top;
      const path = createSvgBezier(x1, y1, x2, y2, delay);
      path.classList.add("conn-line-l1-l0");
      path.dataset.l1 = l1Id;
      connectionSvg.append(path);
      delay += 60;
    });
  });

  l1Nodes.forEach((l1El) => {
    if (!l1El.dataset.hlBound) {
      l1El.dataset.hlBound = "1";
      l1El.addEventListener("click", (e) => {
        e.stopPropagation();
        const clickedId = l1El.dataset.id;
        if (state.connActiveL1 !== clickedId) {
          state.connActiveL1 = clickedId;
          state.connL0Page = 0;
          fillConnColumns();
        }
      });
    }
  });
}

function clearHighlight() {
  const graph = connectionGraph;
  if (!graph) return;
  delete graph.dataset.highlight;
  graph.querySelectorAll(".conn-node").forEach((n) => n.classList.remove("conn-dim", "conn-hl"));
  connectionSvg.querySelectorAll(".conn-line").forEach((p) => p.classList.remove("conn-line-dim", "conn-line-hl"));
}

function highlightL1(l1Id) {
  const graph = connectionGraph;
  if (!graph) return;
  const isAlready = graph.dataset.highlight === l1Id;
  clearHighlight();
  if (isAlready) return;

  graph.dataset.highlight = l1Id;
  graph.querySelectorAll(".conn-node").forEach((n) => n.classList.add("conn-dim"));
  graph.querySelectorAll(`.conn-node-l1[data-id="${l1Id}"]`).forEach((n) => { n.classList.remove("conn-dim"); n.classList.add("conn-hl"); });
  graph.querySelectorAll(`.conn-node-l0[data-parent="${l1Id}"]`).forEach((n) => { n.classList.remove("conn-dim"); n.classList.add("conn-hl"); });
  graph.querySelectorAll(".conn-node-l2").forEach((n) => { n.classList.remove("conn-dim"); });
  connectionSvg.querySelectorAll(".conn-line").forEach((p) => {
    if (p.dataset.l1 === l1Id) { p.classList.remove("conn-line-dim"); p.classList.add("conn-line-hl"); }
    else { p.classList.add("conn-line-dim"); p.classList.remove("conn-line-hl"); }
  });
}

function createSvgBezier(x1, y1, x2, y2, delay = 0) {
  const ns = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(ns, "path");
  const midX = (x1 + x2) / 2;
  path.setAttribute("d", `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`);
  path.classList.add("conn-line");
  path.style.animationDelay = `${delay}ms`;
  return path;
}

/* ── Nav ─────────────────────────────────────────────────── */

function renderActiveNav() {
  levelTabs.querySelectorAll("[data-level]").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-level") === state.activeLevel);
  });
}

/* ── API ─────────────────────────────────────────────────── */

async function readErrorMessage(res) {
  try {
    const payload = await res.json();
    if (payload && typeof payload.error === "string" && payload.error.trim()) {
      return payload.error.trim();
    }
  } catch {}
  return `${res.status} ${res.statusText}`;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
  return res.json();
}

function parseDownloadFilename(headerValue) {
  const value = String(headerValue || "");
  const match = value.match(/filename="([^"]+)"/i);
  return match?.[1] || "clawxmemory-memory-export.json";
}

/* ── Data loading ────────────────────────────────────────── */

function syncBaseItems() {
  for (const level of Object.keys(state.baseRaw)) {
    state.baseItems[level] = normalizeEntryList(level, state.baseRaw[level]);
  }
}

async function loadSnapshot() {
  const snap = await fetchJson("./api/snapshot?limit=24");
  renderOverview(snap.overview || {});
  applySettings(snap.settings || {});
  state.globalProfile = snap.globalProfile || state.globalProfile;
  state.baseRaw.l2_time = snap.recentTimeIndexes || [];
  state.baseRaw.l2_project = snap.recentProjectIndexes || [];
  state.baseRaw.l1 = snap.recentL1Windows || [];
  state.baseRaw.l0 = snap.recentSessions || [];
  state.baseRaw.profile = state.globalProfile.profileText ? [state.globalProfile] : [];
  syncBaseItems();
  buildDataIndexes();
}

async function loadLevel(level, query = "") {
  const config = getLevelConfig(level);
  browserTitle.textContent = config.label;
  renderActiveNav();

  state.isSearching = !!query.trim();
  if (state.isSearching) {
    state.listPage = 0;
    const data = await fetchJson(`${config.endpoint}?q=${encodeURIComponent(query)}&limit=100`);
    state.visibleItems = normalizeEntryList(level, data || []);
    state.searchTotal = state.visibleItems.length;
  } else {
    const offset = state.listPage * state.listPageSize;
    const data = await fetchJson(`${config.endpoint}?limit=${state.listPageSize}&offset=${offset}`);
    state.visibleItems = normalizeEntryList(level, data || []);
  }
  renderEntryList();
}

async function refreshDashboard(msgKey = "status.refreshed", tone = "success", ...args) {
  setActivity("status.refreshing");
  await loadSnapshot();
  await loadLevel(state.activeLevel, listQueryInput.value || "");
  if (state.overview.startupRepairStatus === "running" || state.overview.startupRepairStatus === "failed") {
    updateActivityFromOverview();
    return;
  }
  setActivity(msgKey, tone, ...args);
}

function refreshRenderedContent() {
  renderOverview(state.overview);
  syncBaseItems();
  buildDataIndexes();
  if (state.viewMode === "command_center") {
    renderCommandCenter();
  } else {
    loadLevel(state.activeLevel, listQueryInput.value || "");
  }
}

/* ── Retrieve ────────────────────────────────────────────── */

function renderRetrieveBlock(title, count, items) {
  const block = document.createElement("section");
  block.className = "retrieval-block";
  const head = document.createElement("div");
  head.className = "retrieval-head";
  const strong = document.createElement("strong");
  strong.textContent = title;
  const countEl = document.createElement("span");
  countEl.className = "retrieval-count";
  countEl.textContent = count;
  head.append(strong, countEl);
  block.append(head);
  if (!items.length) {
    block.append(createEmptyState(t("retrieve.noResult")));
    return block;
  }
  const list = document.createElement("ul");
  list.className = "mini-list";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    list.append(li);
  });
  block.append(list);
  return block;
}

function renderRetrieveResult(data) {
  retrieveTimeline.innerHTML = "";
  const debugBits = data.debug
    ? ` · mode=${data.debug.mode} · path=${data.debug.path || "explicit"} · ${data.debug.elapsedMs}ms${data.debug.cacheHit ? " · cache" : ""}${data.debug.budgetLimited ? " · budget" : ""}`
    : "";
  retrieveSummary.textContent = `intent=${data.intent || "general"} · enoughAt=${data.enoughAt || "none"}${debugBits}`;
  retrieveResult.textContent = data.context || "";

  if (data.profile?.profileText) {
    retrieveTimeline.append(
      renderRetrieveBlock(t("nav.profile"), 1, [shortText(data.profile.profileText, 180)]),
    );
  }

  retrieveTimeline.append(
    renderRetrieveBlock("L2", data.l2Results?.length ?? 0,
      (data.l2Results || []).map((r) =>
        r.level === "l2_time"
          ? `${r.item.dateKey} · ${shortText(r.item.summary, 120)}`
          : `${r.item.projectName} · ${shortText(r.item.latestProgress || r.item.summary, 120)}`)),
    renderRetrieveBlock("L1", data.l1Results?.length ?? 0,
      (data.l1Results || []).map((r) => `${r.item.timePeriod} · ${shortText(r.item.summary, 120)}`)),
    renderRetrieveBlock("L0", data.l0Results?.length ?? 0,
      (data.l0Results || []).map((r) => {
        const users = (r.item.messages || []).filter((m) => m.role === "user").map((m) => m.content);
        return `${formatTime(r.item.timestamp)} · ${shortText(users[users.length - 1] || "", 120)}`;
      })),
  );
}

/* ── Actions ─────────────────────────────────────────────── */

async function runRetrieve() {
  const query = String(queryInput.value || "").trim();
  if (!query) { setActivity("status.queryRequired", "warning"); return; }
  setActivity("status.retrieving");
  retrieveSummary.textContent = "…";
  retrieveTimeline.innerHTML = "";
  retrieveResult.textContent = "";
  const data = await fetchJson(`./api/retrieve?q=${encodeURIComponent(query)}&limit=6`);
  renderRetrieveResult(data);
  setActivity("status.retrieved", "success");
}

async function saveSettings() {
  const payload = readSettingsForm();
  const settings = await postJson("./api/settings", payload);
  applySettings(settings);
  const modeLabel = t(`reasoning.${settings.reasoningMode || "answer_first"}`);
  const summary = settings.reasoningMode === "answer_first"
    ? `${modeLabel} · ${settings.maxAutoReplyLatencyMs}ms`
    : modeLabel;
  setActivity("status.settingsSaved", "success", summary);
}

function showModal({ icon, iconClass, title, body, confirmText, cancelText, confirmClass }) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modalOverlay");
    const iconEl = document.getElementById("modalIcon");
    const titleEl = document.getElementById("modalTitle");
    const bodyEl = document.getElementById("modalBody");
    const confirmBtn = document.getElementById("modalConfirm");
    const cancelBtn = document.getElementById("modalCancel");

    iconEl.textContent = icon;
    iconEl.className = "modal-icon " + (iconClass || "");
    titleEl.textContent = title;
    bodyEl.textContent = body;
    confirmBtn.textContent = confirmText;
    confirmBtn.className = "modal-btn modal-confirm " + (confirmClass || "");
    cancelBtn.textContent = cancelText || t("confirm.cancel");

    overlay.classList.add("open");

    function cleanup(result) {
      overlay.classList.remove("open");
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onBackdrop);
      resolve(result);
    }
    function onConfirm() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onBackdrop(e) { if (e.target === overlay) cleanup(false); }

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click", onBackdrop);
  });
}

async function buildNow() {
  const ok = await showModal({
    icon: "⟳", iconClass: "icon-sync",
    title: t("confirm.sync.title"),
    body: t("confirm.sync.body"),
    confirmText: t("confirm.sync.ok"),
  });
  if (!ok) return;
  setActivity("status.building");
  const s = await postJson("./api/index/run");
  await refreshDashboard("status.built", "success", s.l0Captured ?? 0, s.l1Created ?? 0, s.l2TimeUpdated ?? 0, s.l2ProjectUpdated ?? 0, s.profileUpdated ?? 0);
}

async function clearMemory() {
  const ok = await showModal({
    icon: "⚠", iconClass: "icon-danger",
    title: t("confirm.clear.title"),
    body: t("confirm.clear.body"),
    confirmText: t("confirm.clear.ok"),
    confirmClass: "danger",
  });
  if (!ok) return;
  setActivity("status.clearing", "warning");
  await postJson("./api/clear");
  await refreshDashboard("status.cleared", "warning");
}

async function exportMemory() {
  closePopover();
  setActivity("status.exporting");
  try {
    const res = await fetch("./api/export", { cache: "no-store" });
    if (!res.ok) throw new Error(await readErrorMessage(res));
    const blob = await res.blob();
    const filename = parseDownloadFilename(res.headers.get("content-disposition"));
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    setActivity("status.exported", "success", filename);
  } catch (error) {
    setActivity("status.exportFailed", "danger", error instanceof Error ? error.message : String(error));
  }
}

async function importMemoryBundle(bundle) {
  const ok = await showModal({
    icon: "⇪", iconClass: "icon-danger",
    title: t("confirm.import.title"),
    body: t("confirm.import.body"),
    confirmText: t("confirm.import.ok"),
    confirmClass: "danger",
  });
  if (!ok) return;
  setActivity("status.importing", "warning");
  const result = await postJson("./api/import", bundle);
  const counts = result?.imported || {};
  await refreshDashboard(
    "status.imported",
    "success",
    counts.l0 ?? 0,
    counts.l1 ?? 0,
    counts.l2Time ?? 0,
    counts.l2Project ?? 0,
    counts.profile ?? 0,
    counts.links ?? 0,
  );
}

async function handleImportFile(file) {
  if (!file) return;
  closePopover();
  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.l0Sessions) || !Array.isArray(parsed.l1Windows)) {
      setActivity("status.importInvalid", "danger");
      return;
    }
    await importMemoryBundle(parsed);
  } catch (error) {
    setActivity("status.importFailed", "danger", error instanceof Error ? error.message : String(error));
  } finally {
    if (importMemoryInput) importMemoryInput.value = "";
  }
}

async function searchCurrentLevel() {
  setActivity("status.searching");
  await loadLevel(state.activeLevel, listQueryInput.value || "");
  const clrBtn = document.getElementById("listClearBtn");
  if (clrBtn) clrBtn.style.display = listQueryInput.value.trim() ? "" : "none";
  setActivity("status.searched", "success");
}

/* ── Event listeners ─────────────────────────────────────── */

levelTabs.addEventListener("click", async (e) => {
  const btn = e.target instanceof Element ? e.target.closest("[data-level]") : null;
  if (!btn) return;
  const level = btn.getAttribute("data-level");
  if (!level || !LEVEL_KEYS.includes(level)) return;
  state.activeLevel = level;
  state.listPage = 0;
  if (isNavDrawerLayout()) setNavOpen(false);
  if (state.viewMode !== "list") switchView("list");
  await loadLevel(level, listQueryInput.value || "");
});

refreshBtn.addEventListener("click", () => void refreshDashboard());
buildNowBtn.addEventListener("click", () => void buildNow());
overviewToggleBtn.addEventListener("click", () => togglePanel("overview"));
saveSettingsBtn.addEventListener("click", () => void saveSettings());
if (exportMemoryBtn) exportMemoryBtn.addEventListener("click", () => void exportMemory());
if (importMemoryBtn) importMemoryBtn.addEventListener("click", () => importMemoryInput?.click());
if (importMemoryInput) {
  importMemoryInput.addEventListener("change", (event) => {
    const input = event.target;
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    void handleImportFile(file || null);
  });
}
clearMemoryBtn.addEventListener("click", () => void clearMemory());
const listClearBtn = document.getElementById("listClearBtn");
listSearchBtn.addEventListener("click", () => void searchCurrentLevel());
listQueryInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); void searchCurrentLevel(); } });
if (listClearBtn) listClearBtn.addEventListener("click", () => {
  listQueryInput.value = "";
  state.isSearching = false;
  state.listPage = 0;
  if (listClearBtn) listClearBtn.style.display = "none";
  void loadLevel(state.activeLevel, "");
});
retrieveBtn.addEventListener("click", () => void runRetrieve());
queryInput.addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); void runRetrieve(); } });

const settingsPopover = document.getElementById("settingsPopover");
const navMenuTrigger = document.getElementById("navMenuTrigger");

function closePopover() { settingsPopover?.classList.remove("open"); }

function positionPopover() {
  if (!navMenuTrigger || !settingsPopover) return;
  const rect = navMenuTrigger.getBoundingClientRect();
  settingsPopover.style.left = rect.left + "px";
  settingsPopover.style.bottom = (window.innerHeight - rect.top + 6) + "px";
}

navMenuTrigger?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!settingsPopover.classList.contains("open")) {
    positionPopover();
  }
  settingsPopover?.classList.toggle("open");
});

settingsPopover?.addEventListener("click", (e) => {
  const item = e.target instanceof Element ? e.target.closest(".popover-item") : null;
  if (item && (item.id === "overviewToggleBtn" || item.id === "exportMemoryBtn" || item.id === "importMemoryBtn")) {
    closePopover();
  }
});

document.addEventListener("click", (e) => {
  if (settingsPopover?.classList.contains("open") &&
      !settingsPopover.contains(e.target) &&
      !navMenuTrigger?.contains(e.target)) {
    closePopover();
  }
});

if (retrieveToggleBtn) retrieveToggleBtn.addEventListener("click", () => togglePanel("retrieve"));
if (detailToggleBtn) detailToggleBtn.addEventListener("click", () => togglePanel("detail"));
if (reasoningModeToggle) reasoningModeToggle.addEventListener("click", (e) => {
  const btn = e.target instanceof Element ? e.target.closest("[data-mode]") : null;
  if (!btn) return;
  reasoningModeToggle.querySelectorAll(".popover-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  updateSettingsVisibility();
});
overviewCloseBtn.addEventListener("click", () => setPanel(null));
if (settingsCloseBtn) settingsCloseBtn.addEventListener("click", () => setPanel(null));
retrieveCloseBtn.addEventListener("click", () => setPanel(null));
detailCloseBtn.addEventListener("click", () => setPanel(null));
navToggleBtn.addEventListener("click", () => setNavOpen(true));
navCloseBtn.addEventListener("click", () => setNavOpen(false));
appScrim.addEventListener("click", () => closeTransientUi());
window.addEventListener("resize", () => { if (!isNavDrawerLayout()) setNavOpen(false); });

themeToggle.addEventListener("click", (e) => {
  const btn = e.target instanceof Element ? e.target.closest("[data-theme-value]") : null;
  if (!btn) return;
  themeToggle.querySelectorAll(".popover-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  applyTheme(btn.dataset.themeValue);
});

const accentPicker = document.getElementById("accentPicker");
if (accentPicker) accentPicker.addEventListener("click", (e) => {
  const dot = e.target instanceof Element ? e.target.closest("[data-accent]") : null;
  if (!dot) return;
  applyAccent(dot.dataset.accent);
});

if (langToggle) langToggle.addEventListener("click", (e) => {
  const btn = e.target instanceof Element ? e.target.closest("[data-locale]") : null;
  if (!btn) return;
  langToggle.querySelectorAll(".popover-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  setLocale(btn.dataset.locale);
});

viewToggleBtn.addEventListener("click", () => {
  switchView(state.viewMode === "command_center" ? "list" : "command_center");
});

boardNavTabs.addEventListener("click", (e) => {
  const btn = e.target instanceof Element ? e.target.closest("[data-board]") : null;
  if (!btn) return;
  const board = btn.dataset.board;
  if (board && (board === "project" || board === "timeline" || board === "profile")) switchBoard(board);
});

connectionBackBtn.addEventListener("click", () => closeConnection());

window.addEventListener("resize", () => {
  if (state.connectionTarget && connectionPanel.classList.contains("conn-open")) {
    drawConnectionLines();
  }
});

/* ── Bootstrap ───────────────────────────────────────────── */

async function bootstrap() {
  initTheme();
  translatePage();
  setActivity("status.loading");
  await loadSnapshot();

  const shell = $(".app-shell");
  shell.dataset.view = state.viewMode;
  const isCmd = state.viewMode === "command_center";
  viewToggleBtn.setAttribute("aria-checked", String(isCmd));
  const bootLabels = document.querySelectorAll(".view-toggle-label");
  if (bootLabels.length >= 2) {
    bootLabels[0].classList.toggle("active", isCmd);
    bootLabels[1].classList.toggle("active", !isCmd);
  }
  if (isCmd) {
    const h2 = $(".topbar h2");
    h2.dataset.i18n = "topbar.commandCenter";
    h2.textContent = t("topbar.commandCenter");
    renderCommandCenter();
  } else {
  await loadLevel(state.activeLevel);
  }
  renderDetail();
  updateActivityFromOverview();
}

bootstrap().catch((err) => {
  console.error(err);
  setActivity("status.loadFail", "danger", String(err));
});
