/* ── i18n ────────────────────────────────────────────────── */

const LOCALES = {
  zh: {
    "nav.project": "项目记忆",
    "nav.tmp": "Tmp 暂存",
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
    "detail.profile": "Profile",
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
    "overview.tmpTotalFiles": "Tmp Files",
    "overview.tmpProjectMemories": "Tmp Project",
    "overview.tmpFeedbackMemories": "Tmp Feedback",
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
    "overview.boundaryStatus": "边界状态",
    "overview.managedFiles": "托管文件",
    "overview.lastBoundaryAction": "最近边界动作",
    "overview.startupRepair": "启动修复",
    "overview.slotOwner": "Memory Slot",
    "confirm.sync.title": "索引同步",
    "confirm.sync.body": "将扫描最近对话并把可归类内容写入文件式 memory。",
    "confirm.sync.ok": "开始同步",
    "confirm.dream.title": "记忆 Dream",
    "confirm.dream.body": "Dream 会整理、重写、合并并删除冗余的已索引项目记忆，不会额外生成项目摘要层。",
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
    "level.tmp.label": "Tmp 暂存",
    "level.feedback.label": "协作反馈",
    "level.user.label": "用户画像",
    "level.memory_trace.label": "记忆追踪",
    "level.project.empty": "暂无项目记忆",
    "level.tmp.empty": "暂无 Tmp 暂存记忆",
    "level.feedback.empty": "暂无协作反馈",
    "level.user.empty": "暂无用户画像记忆",
    "level.memory_trace.empty": "暂无记忆追踪案例",
    "board.project": "项目记忆",
    "board.tmp": "Tmp 暂存",
    "board.feedback": "协作反馈",
    "board.tmp.manifest": "_tmp 索引",
    "board.tmp.projectFiles": "待整理项目文件",
    "board.tmp.feedbackFiles": "待整理协作反馈",
    "board.user": "用户画像",
    "board.memoryTrace": "记忆追踪",
    "board.user.empty": "暂无可展示的用户画像",
    "board.user.sources": "来源文件",
    "board.memoryTrace.empty": "暂无真实对话案例",
    "board.memoryTrace.emptyIndex": "暂无索引追溯记录",
    "board.memoryTrace.emptyDream": "暂无 Dream 追溯记录",
    "board.memoryTrace.selectCase": "选择案例",
    "board.memoryTrace.selectIndexTrace": "选择索引批次",
    "board.memoryTrace.selectDreamTrace": "选择 Dream 运行",
    "board.memoryTrace.modeRecall": "Recall",
    "board.memoryTrace.modeIndex": "Index",
    "board.memoryTrace.modeDream": "Dream",
    "board.memoryTrace.filterAll": "全部触发",
    "board.memoryTrace.filterManual": "手动触发",
    "board.memoryTrace.filterExplicitRemember": "显式记住",
    "board.memoryTrace.filterManualSync": "手动同步",
    "board.memoryTrace.filterScheduled": "自动定时",
    "board.memoryTrace.query": "问题",
    "board.memoryTrace.session": "Session",
    "board.memoryTrace.mode": "模式",
    "board.memoryTrace.trigger": "触发来源",
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
    "board.memoryTrace.batchWindow": "批次时间范围",
    "board.memoryTrace.snapshot": "Dream 前快照",
    "board.memoryTrace.mutations": "实际写入/删除",
    "board.memoryTrace.rewrittenProjects": "重写项目",
    "board.memoryTrace.deletedProjects": "删除项目",
    "board.memoryTrace.deletedFiles": "删除文件",
    "board.memoryTrace.storedResults": "最终写入",
    "board.memoryTrace.focusTurns": "Focus User Turns",
    "board.memoryTrace.segmentCount": "Segments",
    "board.memoryTrace.l0Count": "L0 数量",
    "board.memoryTrace.noTrace": "该案例没有可展示的 recall trace。",
    "board.memoryTrace.noStep": "该步骤没有可展示的结构化细节。",
    "board.memoryTrace.noPromptDebug": "该步骤没有模型 Prompt 调试数据，通常表示它是本地代码判断步骤。",
    "board.memoryTrace.promptHint": "完整 Prompt 调试可在下方展开。",
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
    "meta.capturedAt": "Captured",
    "meta.sessionKey": "Session",
    "meta.dreamAttempts": "Dream Attempts",
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
    "boundary.ready": "正常",
    "boundary.isolated": "已隔离",
    "boundary.conflict": "冲突",
    "boundary.warning": "告警",
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
    "trace.step.index_start": "Index Start",
    "trace.step.batch_loaded": "Batch Loaded",
    "trace.step.focus_turns_selected": "Focus Turns Selected",
    "trace.step.turn_classified": "Turn Classified",
    "trace.step.candidate_validated": "Candidate Validated",
    "trace.step.candidate_grouped": "Candidate Grouped",
    "trace.step.candidate_persisted": "Candidate Persisted",
    "trace.step.user_profile_rewritten": "User Profile Rewritten",
    "trace.step.index_finished": "Index Finished",
    "trace.step.unknown": "Trace Step",
    "trigger.manual": "手动触发",
    "trigger.explicit_remember": "显式记住",
    "trigger.manual_sync": "手动同步",
    "trigger.scheduled": "自动定时",
  },
  en: {
    "nav.project": "Project",
    "nav.tmp": "Tmp",
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
    "detail.profile": "Profile",
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
    "overview.tmpTotalFiles": "Tmp Files",
    "overview.tmpProjectMemories": "Tmp Project",
    "overview.tmpFeedbackMemories": "Tmp Feedback",
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
    "overview.boundaryStatus": "Boundary Status",
    "overview.managedFiles": "Managed Files",
    "overview.lastBoundaryAction": "Last Boundary Action",
    "overview.startupRepair": "Startup Repair",
    "overview.slotOwner": "Memory Slot",
    "confirm.sync.title": "Index Sync",
    "confirm.sync.body": "This scans recent chats and writes classified items into file-based memory.",
    "confirm.sync.ok": "Start Sync",
    "confirm.dream.title": "Dream",
    "confirm.dream.body": "Dream will organize, rewrite, merge, and delete redundant indexed project memory without creating an extra project summary layer.",
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
    "level.tmp.label": "Tmp Staging",
    "level.feedback.label": "Feedback Rules",
    "level.user.label": "User Portrait",
    "level.memory_trace.label": "Memory Trace",
    "level.project.empty": "No project memories yet",
    "level.tmp.empty": "No tmp staged memory",
    "level.feedback.empty": "No feedback memories yet",
    "level.user.empty": "No user memories yet",
    "level.memory_trace.empty": "No traced conversations yet",
    "board.project": "Project Memory",
    "board.tmp": "Tmp Staging",
    "board.feedback": "Feedback Rules",
    "board.tmp.manifest": "_tmp Manifest",
    "board.tmp.projectFiles": "Tmp Project Files",
    "board.tmp.feedbackFiles": "Tmp Feedback Files",
    "board.user": "User Portrait",
    "board.memoryTrace": "Memory Trace",
    "board.user.empty": "No user portrait is available yet",
    "board.user.sources": "Source Files",
    "board.memoryTrace.empty": "No real traced conversations yet",
    "board.memoryTrace.emptyIndex": "No index trace records yet",
    "board.memoryTrace.emptyDream": "No Dream trace records yet",
    "board.memoryTrace.selectCase": "Select Case",
    "board.memoryTrace.selectIndexTrace": "Select Index Batch",
    "board.memoryTrace.selectDreamTrace": "Select Dream Run",
    "board.memoryTrace.modeRecall": "Recall",
    "board.memoryTrace.modeIndex": "Index",
    "board.memoryTrace.modeDream": "Dream",
    "board.memoryTrace.filterAll": "All Triggers",
    "board.memoryTrace.filterManual": "Manual",
    "board.memoryTrace.filterExplicitRemember": "Explicit Remember",
    "board.memoryTrace.filterManualSync": "Manual Sync",
    "board.memoryTrace.filterScheduled": "Scheduled",
    "board.memoryTrace.query": "Query",
    "board.memoryTrace.session": "Session",
    "board.memoryTrace.mode": "Mode",
    "board.memoryTrace.trigger": "Trigger",
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
    "board.memoryTrace.batchWindow": "Batch Window",
    "board.memoryTrace.snapshot": "Dream Snapshot",
    "board.memoryTrace.mutations": "Applied Mutations",
    "board.memoryTrace.rewrittenProjects": "Rewritten Projects",
    "board.memoryTrace.deletedProjects": "Deleted Projects",
    "board.memoryTrace.deletedFiles": "Deleted Files",
    "board.memoryTrace.storedResults": "Stored Results",
    "board.memoryTrace.focusTurns": "Focus User Turns",
    "board.memoryTrace.segmentCount": "Segments",
    "board.memoryTrace.l0Count": "L0 Count",
    "board.memoryTrace.noTrace": "This case does not contain a retrieval trace.",
    "board.memoryTrace.noStep": "This step does not contain structured details.",
    "board.memoryTrace.noPromptDebug": "This step has no model prompt debug data, usually because it is a local code decision.",
    "board.memoryTrace.promptHint": "Prompt debug is available below.",
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
    "meta.capturedAt": "Captured",
    "meta.sessionKey": "Session",
    "meta.dreamAttempts": "Dream Attempts",
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
    "boundary.ready": "Ready",
    "boundary.isolated": "Isolated",
    "boundary.conflict": "Conflict",
    "boundary.warning": "Warning",
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
    "trace.step.index_start": "Index Start",
    "trace.step.batch_loaded": "Batch Loaded",
    "trace.step.focus_turns_selected": "Focus Turns Selected",
    "trace.step.turn_classified": "Turn Classified",
    "trace.step.candidate_validated": "Candidate Validated",
    "trace.step.candidate_grouped": "Candidate Grouped",
    "trace.step.candidate_persisted": "Candidate Persisted",
    "trace.step.user_profile_rewritten": "User Profile Rewritten",
    "trace.step.index_finished": "Index Finished",
    "trace.step.unknown": "Trace Step",
    "trigger.manual": "Manual",
    "trigger.explicit_remember": "Explicit Remember",
    "trigger.manual_sync": "Manual Sync",
    "trigger.scheduled": "Scheduled",
  },
};

/* ── constants & state ─────────────────────────────────── */

const STORAGE = {
  theme: "clawxmemory.ui.theme",
  accent: "clawxmemory.ui.accent",
  locale: "clawxmemory.ui.locale",
};

const LEVELS = ["project", "tmp", "user", "memory_trace"];
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
const tmpBoard = document.getElementById("tmpBoard");
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
    tmp: "",
    memory_trace: "",
  },
  projectGroups: [],
  projectGroupsLoaded: false,
  tmpSnapshot: null,
  tmpLoaded: false,
  userSummary: null,
  userSummaryLoaded: false,
  recordCache: new Map(),
  cases: [],
  caseRequestLoaded: false,
  caseDetailCache: new Map(),
  selectedCaseId: "",
  activeTraceStepId: "",
  indexTraces: [],
  indexTraceRequestLoaded: false,
  indexTraceDetailCache: new Map(),
  selectedIndexTraceId: "",
  activeIndexTraceStepId: "",
  dreamTraces: [],
  dreamTraceRequestLoaded: false,
  dreamTraceDetailCache: new Map(),
  selectedDreamTraceId: "",
  activeDreamTraceStepId: "",
  traceMode: "recall",
  indexTraceFilterTrigger: "all",
  dreamTraceFilterTrigger: "all",
  selectedProjectId: "",
  selectedFileId: "",
  selectedFileType: "",
  fileReturnView: "project-list",
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

function decodeEscapedTraceText(value) {
  const raw = String(value ?? "");
  if (!raw.includes("\\")) return raw;
  const hasEscapes = /\\u[0-9a-fA-F]{4}|\\[nrt"\\]/.test(raw);
  if (!hasEscapes) return raw;
  return raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, "\"")
    .replace(/\\\\/g, "\\");
}

function decodeEscapedTraceValue(value) {
  if (typeof value === "string") return decodeEscapedTraceText(value);
  if (Array.isArray(value)) return value.map((item) => decodeEscapedTraceValue(item));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, decodeEscapedTraceValue(item)]),
  );
}

function safeJson(value) {
  try {
    return JSON.stringify(decodeEscapedTraceValue(value), null, 2);
  } catch {
    return decodeEscapedTraceText(String(value));
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

function formatBoundaryStatus(value) {
  if (!value) return t("common.none");
  const key = `boundary.${value}`;
  return LOCALES[state.locale][key] || LOCALES.en[key] ? t(key) : String(value);
}

function formatManagedWorkspaceFiles(files) {
  const items = safeArray(files)
    .map((file) => {
      const name = normalizeText(file?.name);
      const status = normalizeText(file?.status);
      if (!name) return "";
      if (!status) return name;
      return `${name} (${formatBoundaryStatus(status)})`;
    })
    .filter(Boolean);
  return items.length ? items.join(", ") : t("common.none");
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
  if (state.mainView === "file-detail" && state.fileReturnView === "tmp") return "tmp";
  if (state.mainView === "file-detail" && state.fileReturnView === "user") return "user";
  if (state.mainView === "tmp") return "tmp";
  if (state.mainView === "user") return "user";
  if (state.mainView === "memory_trace") return "memory_trace";
  return "project";
}

function getNavPage() {
  if (state.mainView === "file-detail" && state.fileReturnView === "tmp") return "tmp";
  if (state.mainView === "file-detail" && state.fileReturnView === "user") return "user";
  if (state.mainView === "tmp") return "tmp";
  if (state.mainView === "user") return "user";
  if (state.mainView === "memory_trace") return "memory_trace";
  return "project";
}

function getCurrentSearchKey() {
  if (state.mainView === "project-list") return "project_list";
  if (state.mainView === "project-detail") return "project_detail";
  if (state.mainView === "tmp") return "tmp";
  if (state.mainView === "memory_trace") return "memory_trace";
  return "";
}

function getMemoryCount(level) {
  if (level === "project") return state.projectGroups.length;
  if (level === "tmp") return Number(state.tmpSnapshot?.totalFiles || state.overview.tmpTotalFiles || 0);
  if (level === "user") return safeArray(state.userSummary?.files).length || Number(state.overview.totalUserMemories || 0);
  if (level === "memory_trace") {
    if (state.traceMode === "index") return state.indexTraces.length;
    if (state.traceMode === "dream") return state.dreamTraces.length;
    return state.cases.length;
  }
  return 0;
}

function getViewElement(view) {
  if (view === "project-list") return projectListBoard;
  if (view === "project-detail") return projectDetailBoard;
  if (view === "file-detail") return fileDetailBoard;
  if (view === "tmp") return tmpBoard;
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
  state.tmpSnapshot = null;
  state.tmpLoaded = false;
  state.userSummary = null;
  state.userSummaryLoaded = false;
  state.recordCache.clear();
}

function invalidateTraceCaches() {
  state.cases = [];
  state.caseRequestLoaded = false;
  state.caseDetailCache.clear();
  state.selectedCaseId = "";
  state.activeTraceStepId = "";
  state.indexTraces = [];
  state.indexTraceRequestLoaded = false;
  state.indexTraceDetailCache.clear();
  state.selectedIndexTraceId = "";
  state.activeIndexTraceStepId = "";
  state.dreamTraces = [];
  state.dreamTraceRequestLoaded = false;
  state.dreamTraceDetailCache.clear();
  state.selectedDreamTraceId = "";
  state.activeDreamTraceStepId = "";
  state.traceSelectorOpen = false;
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

async function loadTmpSnapshot({ force = false } = {}) {
  if (state.tmpLoaded && !force) return state.tmpSnapshot;
  const params = ["limit=200"];
  if (normalizeText(state.queries.tmp)) params.push(`q=${escapeQueryValue(state.queries.tmp)}`);
  state.tmpSnapshot = await fetchJson(`./api/tmp?${params.join("&")}`);
  state.tmpLoaded = true;
  return state.tmpSnapshot;
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

async function loadIndexTraces({ force = false } = {}) {
  if (state.indexTraceRequestLoaded && !force) return state.indexTraces;
  state.indexTraces = safeArray(await fetchJson("./api/index-traces?limit=30"));
  state.indexTraceRequestLoaded = true;
  if (!state.selectedIndexTraceId && state.indexTraces[0]) {
    state.selectedIndexTraceId = state.indexTraces[0].indexTraceId;
  }
  if (state.selectedIndexTraceId) {
    await loadIndexTraceDetail(state.selectedIndexTraceId);
  }
  renderNav();
  return state.indexTraces;
}

async function loadIndexTraceDetail(indexTraceId, { force = false } = {}) {
  if (!indexTraceId) return null;
  if (!force && state.indexTraceDetailCache.has(indexTraceId)) return state.indexTraceDetailCache.get(indexTraceId);
  const detail = await fetchJson(`./api/index-traces/${encodeURIComponent(indexTraceId)}`);
  state.indexTraceDetailCache.set(indexTraceId, detail);
  if (!state.activeIndexTraceStepId) {
    state.activeIndexTraceStepId = safeArray(detail?.steps)[0]?.stepId || "";
  }
  return detail;
}

async function loadDreamTraces({ force = false } = {}) {
  if (state.dreamTraceRequestLoaded && !force) return state.dreamTraces;
  state.dreamTraces = safeArray(await fetchJson("./api/dream-traces?limit=30"));
  state.dreamTraceRequestLoaded = true;
  if (!state.selectedDreamTraceId && state.dreamTraces[0]) {
    state.selectedDreamTraceId = state.dreamTraces[0].dreamTraceId;
  }
  if (state.selectedDreamTraceId) {
    await loadDreamTraceDetail(state.selectedDreamTraceId);
  }
  renderNav();
  return state.dreamTraces;
}

async function loadDreamTraceDetail(dreamTraceId, { force = false } = {}) {
  if (!dreamTraceId) return null;
  if (!force && state.dreamTraceDetailCache.has(dreamTraceId)) return state.dreamTraceDetailCache.get(dreamTraceId);
  const detail = await fetchJson(`./api/dream-traces/${encodeURIComponent(dreamTraceId)}`);
  state.dreamTraceDetailCache.set(dreamTraceId, detail);
  if (!state.activeDreamTraceStepId) {
    state.activeDreamTraceStepId = safeArray(detail?.steps)[0]?.stepId || "";
  }
  return detail;
}

async function ensureActiveData({ force = false } = {}) {
  const level = getCurrentLevel();
  if (level === "project") {
    await loadProjectGroups({ force });
    return;
  }
  if (level === "tmp") {
    await loadTmpSnapshot({ force });
    return;
  }
  if (level === "user") {
    await loadUserSummary({ force });
    return;
  }
  if (level === "memory_trace") {
    if (state.traceMode === "index") {
      await loadIndexTraces({ force });
    } else if (state.traceMode === "dream") {
      await loadDreamTraces({ force });
    } else {
      await loadCases({ force });
    }
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

function appendTextSection(container, label, text, options = {}) {
  const showEmpty = Boolean(options.showEmpty);
  const emptyText = normalizeText(options.emptyText) || t("common.none");
  const value = normalizeText(text);
  if (!value && !showEmpty) return;
  const section = el("section", "detail-section");
  section.append(el("h4", "", label));
  section.append(el("p", "", value || emptyText));
  container.append(section);
}

function appendListSection(container, label, items, options = {}) {
  const showEmpty = Boolean(options.showEmpty);
  const emptyText = normalizeText(options.emptyText) || t("common.none");
  const values = safeArray(items).map((item) => normalizeText(item)).filter(Boolean);
  if (values.length === 0 && !showEmpty) return;
  const section = el("section", "detail-section");
  section.append(el("h4", "", label));
  if (values.length === 0) {
    section.append(el("p", "", emptyText));
  } else {
    const list = el("ul");
    values.forEach((item) => {
      list.append(el("li", "", item));
    });
    section.append(list);
  }
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
  const memoryBody = el("div");
  memoryBody.append(
    createHeroRow([
      { value: formatNumber(overview.totalMemoryFiles || 0), label: t("overview.totalMemoryFiles") },
      { value: formatNumber(overview.totalProjectMemories || 0), label: t("overview.totalProjectMemories") },
      { value: formatNumber(overview.totalFeedbackMemories || 0), label: t("overview.totalFeedbackMemories") },
      { value: formatNumber(overview.totalUserMemories || 0), label: t("overview.totalUserMemories") },
      { value: formatNumber(overview.pendingL0 || 0), label: t("overview.pendingL0") },
      { value: formatNumber(overview.changedFilesSinceLastDream || 0), label: t("overview.changedFilesSinceLastDream") },
    ]),
  );
  memoryBody.append(
    createMetricGrid([
      { label: t("overview.tmpTotalFiles"), value: formatNumber(overview.tmpTotalFiles || 0) },
      { label: t("overview.tmpProjectMemories"), value: formatNumber(overview.tmpProjectMemories || 0) },
      { label: t("overview.tmpFeedbackMemories"), value: formatNumber(overview.tmpFeedbackMemories || 0) },
    ]),
  );
  const memoryGroup = createOverviewGroup(
    t("overview.group.memory"),
    memoryBody,
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
  const managedFiles = safeArray(overview.managedWorkspaceFiles);
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
      {
        label: t("overview.boundaryStatus"),
        value: formatBoundaryStatus(overview.boundaryStatus),
        tone: overview.boundaryStatus === "conflict"
          ? "danger"
          : overview.boundaryStatus === "warning"
            ? "warning"
            : overview.boundaryStatus === "isolated"
              ? "success"
              : "neutral",
      },
      {
        label: t("overview.managedFiles"),
        value: formatManagedWorkspaceFiles(managedFiles),
        tone: managedFiles.length ? "warning" : "neutral",
      },
      {
        label: t("overview.lastBoundaryAction"),
        value: normalizeText(overview.lastBoundaryAction) || t("common.none"),
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
    appendTextSection(
      bodyNode,
      t("detail.profile"),
      readTextFromSection(sections.get("Profile")) || readTextFromSection(sections.get("Summary")) || record.description,
      { showEmpty: true },
    );
    appendListSection(bodyNode, t("detail.preferences"), readListFromSection(sections.get("Preferences")), { showEmpty: true });
    appendListSection(bodyNode, t("detail.constraints"), readListFromSection(sections.get("Constraints")), { showEmpty: true });
    appendListSection(bodyNode, t("detail.relationships"), readListFromSection(sections.get("Relationships")), { showEmpty: true });
  } else if (record.type === "feedback") {
    appendTextSection(bodyNode, t("detail.rule"), readTextFromSection(sections.get("Rule")) || record.description);
    appendTextSection(bodyNode, t("detail.why"), readTextFromSection(sections.get("Why")), { showEmpty: true });
    appendTextSection(bodyNode, t("detail.howToApply"), readTextFromSection(sections.get("How to apply")), { showEmpty: true });
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
      onClick: () => void openMemoryDetail(entry.relativePath, { projectId, originView: "project-detail" }),
    }));
  });
  section.append(list);
  container.append(section);
}

function appendTmpFileListSection(container, label, entries) {
  if (!safeArray(entries).length) return;
  const section = el("section", "detail-section");
  section.append(el("h4", "", label));
  const list = el("div", "entry-stream detail-file-list");
  safeArray(entries).forEach((record) => {
    const meta = [
      formatDateTime(record.updatedAt),
      record.relativePath || t("common.none"),
      `${t("meta.capturedAt")}: ${formatDateTime(record.capturedAt)}`,
      `${t("meta.sessionKey")}: ${normalizeText(record.sourceSessionKey) || t("common.none")}`,
      `${t("meta.dreamAttempts")}: ${formatNumber(Number(record.dreamAttempts || 0))}`,
    ];
    list.append(createEntryCard({
      title: record.name || record.file || t("common.unknown"),
      subtitle: record.description || record.preview || t("common.none"),
      badge: t(`type.${record.type}`),
      meta: meta.join(" · "),
      active: state.selectedFileId === record.relativePath,
      onClick: () => void openMemoryDetail(record.relativePath, { originView: "tmp" }),
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

function renderTmpBoard() {
  if (!tmpBoard) return;
  clearNode(tmpBoard);
  const snapshot = state.tmpSnapshot;
  if (!snapshot || !Number(snapshot.totalFiles || 0)) {
    tmpBoard.append(createEmptyState(t("level.tmp.empty")));
    return;
  }

  const page = el("section", "profile-board-card");
  const manifestSection = el("section", "detail-section");
  manifestSection.append(el("h4", "", t("board.tmp.manifest")));
  manifestSection.append(el("p", "", snapshot.manifestPath || t("common.none")));
  manifestSection.append(el("pre", "memory-trace-code", normalizeText(snapshot.manifestContent) || t("common.none")));
  page.append(manifestSection);

  appendTmpFileListSection(page, t("board.tmp.projectFiles"), snapshot.projectEntries);
  appendTmpFileListSection(page, t("board.tmp.feedbackFiles"), snapshot.feedbackEntries);
  tmpBoard.append(page);
}

function renderFileDetailView(record) {
  if (!fileDetailTitle || !fileDetailSubtitle || !fileDetailMeta || !fileDetailBody) return;
  if (fileDetailBackBtn) fileDetailBackBtn.hidden = !state.fileReturnView;
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

async function openMemoryDetail(id, { projectId = "", originView = "" } = {}) {
  const record = await getMemoryRecord(id);
  if (!record) return;
  state.selectedProjectId = projectId || normalizeText(record.projectId);
  state.selectedFileId = id;
  state.selectedFileType = normalizeText(record.type);
  state.fileReturnView = originView || (state.selectedProjectId ? "project-detail" : state.mainView || "project-list");
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
  state.fileReturnView = "project-list";
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
  if (
    !summary
    || (
      !normalizeText(summary.profile)
      && !safeArray(summary.preferences).length
      && !safeArray(summary.constraints).length
      && !safeArray(summary.relationships).length
      && !safeArray(summary.files).length
    )
  ) {
    userBoard.append(createEmptyState(t("board.user.empty")));
    return;
  }

  const card = el("section", "profile-board-card");
  const addSummaryText = (label, text) => {
    const value = normalizeText(text);
    card.append(el("div", "profile-section-title", label));
    if (!value) {
      card.append(el("p", "profile-para", t("common.none")));
      return;
    }
    value.split(/\n+/).forEach((line) => {
      if (!normalizeText(line)) return;
      card.append(el("p", "profile-para", normalizeText(line)));
    });
  };
  const addSummaryList = (label, items) => {
    const values = safeArray(items).map((item) => normalizeText(item)).filter(Boolean);
    card.append(el("div", "profile-section-title", label));
    if (!values.length) {
      card.append(el("p", "profile-para", t("common.none")));
      return;
    }
    const list = el("div", "profile-topic-list");
    values.forEach((item) => {
      list.append(el("span", "profile-topic-chip", item));
    });
    card.append(list);
  };

  addSummaryText(t("detail.profile"), summary.profile);
  addSummaryList(t("detail.preferences"), summary.preferences);
  addSummaryList(t("detail.constraints"), summary.constraints);
  addSummaryList(t("detail.relationships"), summary.relationships);

  const files = safeArray(summary.files);
  if (files.length) {
    card.append(el("div", "profile-section-title", t("board.user.sources")));
    const list = el("div", "profile-topic-list");
    files.forEach((entry) => {
      const chip = el("button", "profile-topic-chip", entry.name || entry.file);
      chip.type = "button";
      chip.addEventListener("click", () => void openMemoryDetail(entry.relativePath, { originView: "user" }));
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
      decodeEscapedTraceText(item.query),
      item.sessionKey,
      decodeEscapedTraceText(item.assistantReply),
      decodeEscapedTraceText(item.retrieval?.pathSummary),
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

function getVisibleIndexTraces() {
  const query = normalizeText(state.queries.memory_trace).toLowerCase();
  const filteredByTrigger = state.indexTraceFilterTrigger === "all"
    ? state.indexTraces
    : state.indexTraces.filter((item) => item.trigger === state.indexTraceFilterTrigger);
  if (!query) return filteredByTrigger;
  return filteredByTrigger.filter((item) => {
    const haystack = [
      item.sessionKey,
      item.trigger,
      safeArray(item.storedResults).map((result) => [
        decodeEscapedTraceText(result.candidateName),
        result.candidateType,
        result.relativePath,
        result.projectId,
      ].join(" ")).join(" "),
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function getSelectedIndexTrace() {
  const visibleTraces = getVisibleIndexTraces();
  const selected = state.indexTraceDetailCache.get(state.selectedIndexTraceId)
    || visibleTraces.find((item) => item.indexTraceId === state.selectedIndexTraceId)
    || visibleTraces[0]
    || null;
  if (selected && state.selectedIndexTraceId !== selected.indexTraceId) {
    state.selectedIndexTraceId = selected.indexTraceId;
  }
  return selected;
}

function getVisibleDreamTraces() {
  const query = normalizeText(state.queries.memory_trace).toLowerCase();
  const filteredByTrigger = state.dreamTraceFilterTrigger === "all"
    ? state.dreamTraces
    : state.dreamTraces.filter((item) => item.trigger === state.dreamTraceFilterTrigger);
  if (!query) return filteredByTrigger;
  return filteredByTrigger.filter((item) => {
    const haystack = [
      item.trigger,
      normalizeText(item.outcome?.summary),
      safeArray(item.mutations).map((mutation) => [
        mutation.relativePath,
        decodeEscapedTraceText(mutation.projectName),
        decodeEscapedTraceText(mutation.name),
        decodeEscapedTraceText(mutation.preview),
      ].join(" ")).join(" "),
    ].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function getSelectedDreamTrace() {
  const visibleTraces = getVisibleDreamTraces();
  const selected = state.dreamTraceDetailCache.get(state.selectedDreamTraceId)
    || visibleTraces.find((item) => item.dreamTraceId === state.selectedDreamTraceId)
    || visibleTraces[0]
    || null;
  if (selected && state.selectedDreamTraceId !== selected.dreamTraceId) {
    state.selectedDreamTraceId = selected.dreamTraceId;
  }
  return selected;
}

function formatIndexTrigger(trigger) {
  return t(`trigger.${trigger || "manual_sync"}`);
}

function formatDreamTrigger(trigger) {
  return t(`trigger.${trigger || "manual"}`);
}

function renderTraceModeControls(container) {
  const tabs = el("div", "memory-trace-artifact-tabs");
  [
    { id: "recall", label: t("board.memoryTrace.modeRecall") },
    { id: "index", label: t("board.memoryTrace.modeIndex") },
    { id: "dream", label: t("board.memoryTrace.modeDream") },
  ].forEach((item) => {
    const button = el("button", `memory-trace-artifact-tab${state.traceMode === item.id ? " active" : ""}`, item.label);
    button.type = "button";
    button.addEventListener("click", async () => {
      if (state.traceMode === item.id) return;
      state.traceMode = item.id;
      state.traceSelectorOpen = false;
      await ensureActiveData();
      renderActiveView();
    });
    tabs.append(button);
  });
  container.append(tabs);
}

function renderDreamTriggerFilters(container) {
  const tabs = el("div", "memory-trace-artifact-tabs");
  [
    { id: "all", label: t("board.memoryTrace.filterAll") },
    { id: "manual", label: t("board.memoryTrace.filterManual") },
    { id: "scheduled", label: t("board.memoryTrace.filterScheduled") },
  ].forEach((item) => {
    const button = el("button", `memory-trace-artifact-tab${state.dreamTraceFilterTrigger === item.id ? " active" : ""}`, item.label);
    button.type = "button";
    button.addEventListener("click", () => {
      if (state.dreamTraceFilterTrigger === item.id) return;
      state.dreamTraceFilterTrigger = item.id;
      state.traceSelectorOpen = false;
      state.selectedDreamTraceId = "";
      state.activeDreamTraceStepId = "";
      renderActiveView();
    });
    tabs.append(button);
  });
  container.append(tabs);
}

function renderIndexTriggerFilters(container) {
  const tabs = el("div", "memory-trace-artifact-tabs");
  [
    { id: "all", label: t("board.memoryTrace.filterAll") },
    { id: "explicit_remember", label: t("board.memoryTrace.filterExplicitRemember") },
    { id: "manual_sync", label: t("board.memoryTrace.filterManualSync") },
    { id: "scheduled", label: t("board.memoryTrace.filterScheduled") },
  ].forEach((item) => {
    const button = el("button", `memory-trace-artifact-tab${state.indexTraceFilterTrigger === item.id ? " active" : ""}`, item.label);
    button.type = "button";
    button.addEventListener("click", () => {
      if (state.indexTraceFilterTrigger === item.id) return;
      state.indexTraceFilterTrigger = item.id;
      state.traceSelectorOpen = false;
      state.selectedIndexTraceId = "";
      state.activeIndexTraceStepId = "";
      renderActiveView();
    });
    tabs.append(button);
  });
  container.append(tabs);
}

function createTraceDetailBlock(detail) {
  const block = el("div", `memory-trace-detail-block${detail.kind === "note" ? " is-note" : ""}`);
  block.append(el("div", "memory-trace-debug-title", detail.label));

  if (detail.kind === "text" || detail.kind === "note") {
    block.append(el("pre", "memory-trace-code", decodeEscapedTraceText(detail.text || t("common.none"))));
    return block;
  }

  if (detail.kind === "list") {
    const list = el("ul", "memory-trace-detail-list");
    safeArray(detail.items).forEach((item) => list.append(el("li", "", decodeEscapedTraceText(item))));
    block.append(list);
    return block;
  }

  if (detail.kind === "kv") {
    const grid = el("div", "memory-trace-kv-grid");
    safeArray(detail.entries).forEach((entry) => {
      const row = el("div", "memory-trace-kv-row");
      row.append(el("span", "memory-trace-kv-key", entry.label));
      row.append(el("span", "memory-trace-kv-value", decodeEscapedTraceText(String(entry.value ?? ""))));
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
  body.append(el("pre", "memory-trace-code", decodeEscapedTraceText(promptDebug.systemPrompt || t("common.none"))));
  body.append(el("div", "memory-trace-debug-title", t("board.memoryTrace.userPrompt")));
  body.append(el("pre", "memory-trace-code", decodeEscapedTraceText(promptDebug.userPrompt || t("common.none"))));
  body.append(el("div", "memory-trace-debug-title", t("board.memoryTrace.rawOutput")));
  body.append(el("pre", "memory-trace-code", decodeEscapedTraceText(promptDebug.rawResponse || t("common.none"))));
  if (promptDebug.parsedResult !== undefined) {
    body.append(el("div", "memory-trace-debug-title", t("board.memoryTrace.parsedResult")));
    body.append(el("pre", "memory-trace-code", safeJson(promptDebug.parsedResult)));
  }
  wrapper.append(body);
  container.append(wrapper);
}

function pickDefaultTraceStepId(steps) {
  const normalized = safeArray(steps);
  const promptStep = normalized.find((step) => step?.promptDebug);
  if (promptStep?.stepId) return promptStep.stepId;
  const detailStep = normalized.find((step) => safeArray(step?.details).length > 0);
  if (detailStep?.stepId) return detailStep.stepId;
  return normalized[0]?.stepId || "";
}

function renderTraceStepExpandedContent(expanded, step) {
  const details = safeArray(step.details);
  const hasPromptDebug = Boolean(step.promptDebug);

  if (details.length) {
    details.forEach((detail) => expanded.append(createTraceDetailBlock(detail)));
  }

  if (hasPromptDebug) {
    renderPromptDebug(expanded, step.promptDebug);
  }
}

function createTraceMetaChip(label, value) {
  const chip = el("div", "memory-trace-meta-chip");
  chip.append(el("div", "memory-trace-meta-label", label));
  chip.append(el("div", "memory-trace-meta-value", decodeEscapedTraceText(value)));
  return chip;
}

function createTraceSummaryCard(title, bodyText, klass = "") {
  const card = el("section", `memory-trace-summary-card${klass ? ` ${klass}` : ""}`);
  card.append(el("h4", "", title));
  card.append(el("pre", "memory-trace-note", decodeEscapedTraceText(bodyText || t("common.none"))));
  return card;
}

function traceStepLabel(step) {
  const explicitTitle = normalizeText(step?.title);
  if (explicitTitle && explicitTitle !== step?.kind) return explicitTitle;
  const key = `trace.step.${step?.kind || "unknown"}`;
  const hasTranslation = Boolean(LOCALES[state.locale][key] || LOCALES.en[key]);
  return hasTranslation ? t(key) : (step?.title || t("trace.step.unknown"));
}

function renderRecallTrace(host) {
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
  trigger.append(el("span", "memory-trace-selector-title", decodeEscapedTraceText(selected.query || selected.caseId)));
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
      option.append(el("div", "memory-trace-selector-option-title", decodeEscapedTraceText(item.query || item.caseId)));
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
    state.activeTraceStepId = pickDefaultTraceStepId(steps);
  }

  const list = el("div", "memory-trace-flow-list");
  steps.forEach((step, index) => {
    const isActive = step.stepId === state.activeTraceStepId;
    const item = el("div", `memory-trace-step-item${step.stepId === state.activeTraceStepId ? " active" : ""}`);
    const toggle = el("button", "memory-trace-step-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
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
    summary.append(el("div", "memory-trace-step-line", decodeEscapedTraceText(step.inputSummary || t("common.none"))));
    summary.append(el("div", "memory-trace-step-line is-output", decodeEscapedTraceText(step.outputSummary || t("common.none"))));
    toggle.append(summary);
    toggle.append(el("span", "memory-trace-step-chevron", isActive ? "▴" : "▾"));
    item.append(toggle);

    if (isActive) {
      const expanded = el("div", "memory-trace-step-expanded");
      const meta = el("div", "memory-trace-expanded-meta");
      meta.append(
        createTraceMetaChip("status", step.status || t("common.none")),
        createTraceMetaChip("kind", step.kind || t("common.none")),
      );
      expanded.append(meta);
      renderTraceStepExpandedContent(expanded, step);
      item.append(expanded);
    }

    list.append(item);
  });
  flow.append(list);
  page.append(flow);
  host.append(page);
}

function renderIndexTrace(host) {
  const traces = getVisibleIndexTraces();
  clearNode(host);
  if (!traces.length) {
    host.append(createEmptyState(t("board.memoryTrace.emptyIndex")));
    return;
  }

  const selected = getSelectedIndexTrace();
  if (!selected) {
    host.append(createEmptyState(t("board.memoryTrace.emptyIndex")));
    return;
  }

  const page = el("div", "memory-trace-page");
  const hero = el("section", "memory-trace-hero");
  const header = el("div", "memory-trace-section-head");
  header.append(el("h4", "", t("board.memoryTrace.selectIndexTrace")));

  const selector = el("div", "memory-trace-selector");
  const trigger = el("button", "memory-trace-selector-trigger");
  trigger.type = "button";
  trigger.append(el("span", "memory-trace-selector-title", `${formatIndexTrigger(selected.trigger)} · ${selected.sessionKey}`));
  trigger.append(el("span", "memory-trace-selector-chevron", state.traceSelectorOpen ? "▴" : "▾"));
  trigger.addEventListener("click", () => {
    state.traceSelectorOpen = !state.traceSelectorOpen;
    renderActiveView();
  });
  selector.append(trigger);

  if (state.traceSelectorOpen) {
    const list = el("div", "memory-trace-selector-list");
    traces.forEach((item) => {
      const option = el("button", `memory-trace-selector-option${item.indexTraceId === selected.indexTraceId ? " active" : ""}`);
      option.type = "button";
      option.append(el("div", "memory-trace-selector-option-title", `${formatIndexTrigger(item.trigger)} · ${item.sessionKey}`));
      option.append(el(
        "div",
        "memory-trace-selector-option-meta",
        `${formatDateTime(item.startedAt)} · ${item.batchSummary?.segmentCount || 0} seg · ${safeArray(item.storedResults).length} stored`,
      ));
      option.addEventListener("click", async () => {
        state.selectedIndexTraceId = item.indexTraceId;
        state.traceSelectorOpen = false;
        await loadIndexTraceDetail(item.indexTraceId);
        renderActiveView();
      });
      list.append(option);
    });
    selector.append(list);
  }

  header.append(selector);
  hero.append(header);

  const metaGrid = el("div", "memory-trace-meta-grid");
  metaGrid.append(
    createTraceMetaChip(t("board.memoryTrace.trigger"), formatIndexTrigger(selected.trigger)),
    createTraceMetaChip(t("board.memoryTrace.session"), selected.sessionKey || t("common.none")),
    createTraceMetaChip(t("board.memoryTrace.status"), selected.status || t("common.none")),
    createTraceMetaChip(t("board.memoryTrace.started"), formatDateTime(selected.startedAt)),
    createTraceMetaChip(t("board.memoryTrace.finished"), formatDateTime(selected.finishedAt)),
    createTraceMetaChip(t("board.memoryTrace.segmentCount"), String(selected.batchSummary?.segmentCount || 0)),
    createTraceMetaChip(t("board.memoryTrace.focusTurns"), String(selected.batchSummary?.focusUserTurnCount || 0)),
    createTraceMetaChip(t("board.memoryTrace.l0Count"), String(safeArray(selected.batchSummary?.l0Ids).length)),
  );
  hero.append(metaGrid);

  const summaryGrid = el("div", "memory-trace-summary-grid");
  summaryGrid.append(
    createTraceSummaryCard(
      t("board.memoryTrace.batchWindow"),
      `${formatDateTime(selected.batchSummary?.fromTimestamp)} → ${formatDateTime(selected.batchSummary?.toTimestamp)}`,
      "memory-trace-summary-card--path",
    ),
    createTraceSummaryCard(
      t("board.memoryTrace.storedResults"),
      safeArray(selected.storedResults).map((item) => `${item.candidateType}:${item.candidateName} -> ${item.relativePath}`).join("\n") || t("common.none"),
      "memory-trace-summary-card--artifact",
    ),
  );
  hero.append(summaryGrid);
  page.append(hero);

  const flow = el("section", "memory-trace-flow");
  const flowHeader = el("div", "memory-trace-section-head");
  flowHeader.append(el("h4", "", t("board.memoryTrace.flow")));
  flow.append(flowHeader);
  const steps = safeArray(selected.steps);
  if (!steps.length) {
    flow.append(createEmptyState(t("board.memoryTrace.noTrace")));
    page.append(flow);
    host.append(page);
    return;
  }

  if (!state.activeIndexTraceStepId || !steps.some((step) => step.stepId === state.activeIndexTraceStepId)) {
    state.activeIndexTraceStepId = pickDefaultTraceStepId(steps);
  }

  const list = el("div", "memory-trace-flow-list");
  steps.forEach((step, index) => {
    const isActive = step.stepId === state.activeIndexTraceStepId;
    const item = el("div", `memory-trace-step-item${step.stepId === state.activeIndexTraceStepId ? " active" : ""}`);
    const toggle = el("button", "memory-trace-step-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
    toggle.addEventListener("click", () => {
      state.activeIndexTraceStepId = state.activeIndexTraceStepId === step.stepId ? "" : step.stepId;
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
    toggle.append(el("span", "memory-trace-step-chevron", isActive ? "▴" : "▾"));
    item.append(toggle);

    if (isActive) {
      const expanded = el("div", "memory-trace-step-expanded");
      const meta = el("div", "memory-trace-expanded-meta");
      meta.append(
        createTraceMetaChip("status", step.status || t("common.none")),
        createTraceMetaChip("kind", step.kind || t("common.none")),
      );
      expanded.append(meta);
      renderTraceStepExpandedContent(expanded, step);
      item.append(expanded);
    }

    list.append(item);
  });
  flow.append(list);
  page.append(flow);
  host.append(page);
}

function renderDreamTrace(host) {
  const traces = getVisibleDreamTraces();
  clearNode(host);
  if (!traces.length) {
    host.append(createEmptyState(t("board.memoryTrace.emptyDream")));
    return;
  }

  const selected = getSelectedDreamTrace();
  if (!selected) {
    host.append(createEmptyState(t("board.memoryTrace.emptyDream")));
    return;
  }

  const page = el("div", "memory-trace-page");
  const hero = el("section", "memory-trace-hero");
  const header = el("div", "memory-trace-section-head");
  header.append(el("h4", "", t("board.memoryTrace.selectDreamTrace")));

  const selector = el("div", "memory-trace-selector");
  const trigger = el("button", "memory-trace-selector-trigger");
  trigger.type = "button";
  trigger.append(el("span", "memory-trace-selector-title", `${formatDreamTrigger(selected.trigger)} · ${formatDateTime(selected.startedAt)}`));
  trigger.append(el("span", "memory-trace-selector-chevron", state.traceSelectorOpen ? "▴" : "▾"));
  trigger.addEventListener("click", () => {
    state.traceSelectorOpen = !state.traceSelectorOpen;
    renderActiveView();
  });
  selector.append(trigger);

  if (state.traceSelectorOpen) {
    const list = el("div", "memory-trace-selector-list");
    traces.forEach((item) => {
      const option = el("button", `memory-trace-selector-option${item.dreamTraceId === selected.dreamTraceId ? " active" : ""}`);
      option.type = "button";
      option.append(el("div", "memory-trace-selector-option-title", `${formatDreamTrigger(item.trigger)} · ${formatDateTime(item.startedAt)}`));
      option.append(el(
        "div",
        "memory-trace-selector-option-meta",
        `${item.snapshotSummary?.formalProjectCount || 0} formal · ${item.outcome?.rewrittenProjects || 0} rewritten · ${item.outcome?.deletedFiles || 0} deleted`,
      ));
      option.addEventListener("click", async () => {
        state.selectedDreamTraceId = item.dreamTraceId;
        state.traceSelectorOpen = false;
        await loadDreamTraceDetail(item.dreamTraceId);
        renderActiveView();
      });
      list.append(option);
    });
    selector.append(list);
  }

  header.append(selector);
  hero.append(header);

  const metaGrid = el("div", "memory-trace-meta-grid");
  metaGrid.append(
    createTraceMetaChip(t("board.memoryTrace.trigger"), formatDreamTrigger(selected.trigger)),
    createTraceMetaChip(t("board.memoryTrace.status"), selected.status || t("common.none")),
    createTraceMetaChip(t("board.memoryTrace.started"), formatDateTime(selected.startedAt)),
    createTraceMetaChip(t("board.memoryTrace.finished"), formatDateTime(selected.finishedAt)),
    createTraceMetaChip(t("board.memoryTrace.rewrittenProjects"), String(selected.outcome?.rewrittenProjects || 0)),
    createTraceMetaChip(t("board.memoryTrace.deletedProjects"), String(selected.outcome?.deletedProjects || 0)),
    createTraceMetaChip(t("board.memoryTrace.deletedFiles"), String(selected.outcome?.deletedFiles || 0)),
  );
  hero.append(metaGrid);

  const summaryGrid = el("div", "memory-trace-summary-grid");
  summaryGrid.append(
    createTraceSummaryCard(
      t("board.memoryTrace.snapshot"),
      [
        `formal projects: ${selected.snapshotSummary?.formalProjectCount || 0}`,
        `tmp project files: ${selected.snapshotSummary?.tmpProjectCount || 0}`,
        `tmp feedback files: ${selected.snapshotSummary?.tmpFeedbackCount || 0}`,
        `formal project files: ${selected.snapshotSummary?.formalProjectFileCount || 0}`,
        `formal feedback files: ${selected.snapshotSummary?.formalFeedbackFileCount || 0}`,
        `has user profile: ${selected.snapshotSummary?.hasUserProfile ? "yes" : "no"}`,
      ].join("\n"),
      "memory-trace-summary-card--path",
    ),
    createTraceSummaryCard(
      t("board.memoryTrace.mutations"),
      safeArray(selected.mutations).map((item) => `${item.action} · ${item.relativePath || item.projectName || item.projectId || t("common.none")}`).join("\n") || t("common.none"),
      "memory-trace-summary-card--artifact",
    ),
    createTraceSummaryCard(
      t("overview.lastDreamSummary"),
      selected.outcome?.summary || t("common.none"),
      "memory-trace-summary-card--artifact",
    ),
  );
  hero.append(summaryGrid);
  page.append(hero);

  const flow = el("section", "memory-trace-flow");
  const flowHeader = el("div", "memory-trace-section-head");
  flowHeader.append(el("h4", "", t("board.memoryTrace.flow")));
  flow.append(flowHeader);
  const steps = safeArray(selected.steps);
  if (!steps.length) {
    flow.append(createEmptyState(t("board.memoryTrace.noTrace")));
    page.append(flow);
    host.append(page);
    return;
  }

  if (!state.activeDreamTraceStepId || !steps.some((step) => step.stepId === state.activeDreamTraceStepId)) {
    state.activeDreamTraceStepId = pickDefaultTraceStepId(steps);
  }

  const list = el("div", "memory-trace-flow-list");
  steps.forEach((step, index) => {
    const isActive = step.stepId === state.activeDreamTraceStepId;
    const item = el("div", `memory-trace-step-item${step.stepId === state.activeDreamTraceStepId ? " active" : ""}`);
    const toggle = el("button", "memory-trace-step-toggle");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
    toggle.addEventListener("click", () => {
      state.activeDreamTraceStepId = state.activeDreamTraceStepId === step.stepId ? "" : step.stepId;
      renderActiveView();
    });

    toggle.append(el("span", "memory-trace-step-marker", String(index + 1)));
    const summary = el("div", "memory-trace-step-summary");
    const head = el("div", "memory-trace-step-head");
    head.append(el("strong", "", traceStepLabel(step)));
    head.append(el("span", "memory-trace-kind-badge", step.kind));
    summary.append(head);
    summary.append(el("div", "memory-trace-step-line", decodeEscapedTraceText(step.inputSummary || t("common.none"))));
    summary.append(el("div", "memory-trace-step-line is-output", decodeEscapedTraceText(step.outputSummary || t("common.none"))));
    toggle.append(summary);
    toggle.append(el("span", "memory-trace-step-chevron", isActive ? "▴" : "▾"));
    item.append(toggle);

    if (isActive) {
      const expanded = el("div", "memory-trace-step-expanded");
      const meta = el("div", "memory-trace-expanded-meta");
      meta.append(
        createTraceMetaChip("status", step.status || t("common.none")),
        createTraceMetaChip("kind", step.kind || t("common.none")),
      );
      expanded.append(meta);
      renderTraceStepExpandedContent(expanded, step);
      item.append(expanded);
    }

    list.append(item);
  });
  flow.append(list);
  page.append(flow);
  host.append(page);
}

function renderMemoryTrace(host) {
  clearNode(host);
  const page = el("div", "memory-trace-page");
  const controls = el("section", "memory-trace-hero");
  const header = el("div", "memory-trace-section-head");
  header.append(el("h4", "", t("board.memoryTrace")));
  renderTraceModeControls(header);
  controls.append(header);
  if (state.traceMode === "index") {
    renderIndexTriggerFilters(controls);
  } else if (state.traceMode === "dream") {
    renderDreamTriggerFilters(controls);
  }
  page.append(controls);
  host.append(page);

  const content = el("div");
  host.append(content);
  if (state.traceMode === "index") renderIndexTrace(content);
  else if (state.traceMode === "dream") renderDreamTrace(content);
  else renderRecallTrace(content);
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
    } else if (state.mainView === "tmp") {
      browserMeta.textContent = t("stream.items", formatNumber(state.tmpSnapshot?.totalFiles || 0));
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
  ["project-list", "project-detail", "file-detail", "tmp", "user", "memory_trace"].forEach((view) => {
    const node = getViewElement(view);
    if (node) node.classList.toggle("board-active", view === state.mainView);
  });
  if (state.mainView === "project-list") renderProjectListView();
  else if (state.mainView === "project-detail") renderProjectDetailView(getSelectedProjectGroup());
  else if (state.mainView === "file-detail") renderFileDetailView(state.selectedFileId ? state.recordCache.get(state.selectedFileId) || null : null);
  else if (state.mainView === "tmp") renderTmpBoard();
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
  invalidateTraceCaches();
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
    invalidateTraceCaches();
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
    invalidateTraceCaches();
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
  invalidateTraceCaches();
  state.mainView = "project-list";
  state.selectedProjectId = "";
  state.selectedFileId = "";
  state.selectedFileType = "";
  state.fileReturnView = "project-list";
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
    state.fileReturnView = "project-list";
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
    if (state.fileReturnView === "tmp") {
      state.mainView = "tmp";
      state.selectedFileId = "";
      state.selectedFileType = "";
      renderActiveView();
      return;
    }
    if (state.fileReturnView === "user") {
      state.mainView = "user";
      state.selectedFileId = "";
      state.selectedFileType = "";
      renderActiveView();
      return;
    }
    if (!state.selectedProjectId || state.fileReturnView === "project-list") {
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
