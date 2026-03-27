/**
 * 对话消息角色。
 * 例：`user`、`assistant`、`system`。
 */
export type ChatRole = "user" | "assistant" | "system" | string;

/**
 * 原始对话中的单条消息。
 */
export interface MemoryMessage {
  /** 消息 ID，可直接映射上游系统的原始消息。例：`msg_42`。 */
  msgId?: string;
  /** 消息角色。例：`user`。 */
  role: ChatRole;
  /** 消息正文。例：`帮我看看这个项目最近进展`。 */
  content: string;
}

/**
 * L0 原始对话日志层。
 * 一条记录通常对应一次完整 session 的原始消息存档。
 */
export interface L0SessionRecord {
  /** L0 唯一索引 ID。例：`session_5f8a9b2c_raw`。 */
  l0IndexId: string;
  /** 会话键，用于把同一个 session 的多次采集关联起来。例：`session-1741673212`。 */
  sessionKey: string;
  /** 会话触发时间。例：`2026-03-11T16:54:17+09:00`。 */
  timestamp: string;
  /** 原始消息列表。例：`[{ role: "user", content: "我在改记忆系统" }]`。 */
  messages: MemoryMessage[];
  /** 数据来源，便于区分接入方式。例：`openclaw`、`skill`、`import`。 */
  source: string;
  /** 是否已经被 heartbeat 消费并生成上层索引。例：`false`。 */
  indexed: boolean;
  /** 首次落库时间。 */
  createdAt: string;
}

/**
 * 待写入全局画像的事实候选。
 */
export interface FactCandidate {
  /** 事实键，用于幂等更新。例：`project:ultrarag`。 */
  factKey: string;
  /** 事实值。例：`UltraRAG`。 */
  factValue: string;
  /** 抽取置信度，范围 0~1。例：`0.78`。 */
  confidence: number;
}

/**
 * L1 结构化会话窗口。
 */
export interface L1WindowRecord {
  /** L1 唯一索引 ID。例：`l1_g325gsa`。 */
  l1IndexId: string;
  /** 聚合时间窗口。例：`2026-03-11:T16:00-18:00`。 */
  timePeriod: string;
  /** 窗口摘要。例：`用户在调整 OpenClaw 记忆分层设计，并讨论 UI 改版。`。 */
  summary: string;
  /** 该窗口抽取出的事实候选。 */
  facts: FactCandidate[];
  /** 情景时间描述。例：`2026-03-11 16:54 用户正在推进：改造记忆系统。`。 */
  situationTimeInfo: string;
  /** 推测出的项目标签。例：`["OpenClaw", "UltraRAG"]`。 */
  projectTags: string[];
  /** 关联的 L0 索引 ID 列表。 */
  l0Source: string[];
  /** 首次落库时间。 */
  createdAt: string;
}

/**
 * L2 时间维索引。
 */
export interface L2TimeIndexRecord {
  /** L2 唯一索引 ID。例：`time_afs32r2r`。 */
  l2IndexId: string;
  /** 时间维度键。例：`2026-03-11`。 */
  dateKey: string;
  /** 日期聚合摘要。 */
  summary: string;
  /** 组成该日期索引的 L1 ID 列表。 */
  l1Source: string[];
  /** 首次创建时间。 */
  createdAt: string;
  /** 最近更新时间。 */
  updatedAt: string;
}

/**
 * L2 项目维索引。
 */
export interface L2ProjectIndexRecord {
  /** L2 唯一索引 ID。例：`project_afs32r2r`。 */
  l2IndexId: string;
  /** 项目名称。例：`UltraRAG`。 */
  projectName: string;
  /** 项目聚合摘要。 */
  summary: string;
  /** 当前状态。例：`in_progress`。 */
  currentStatus: string;
  /** 最新进展。 */
  latestProgress: string;
  /** 组成该项目索引的 L1 ID 列表。 */
  l1Source: string[];
  /** 首次创建时间。 */
  createdAt: string;
  /** 最近更新时间。 */
  updatedAt: string;
}

/**
 * 全局画像中的单条动态事实。
 */
export interface GlobalFactItem {
  /** 事实键，作为全局画像内的稳定主键。例：`project:ultrarag`。 */
  factKey: string;
  /** 事实值。 */
  factValue: string;
  /** 事实置信度。 */
  confidence: number;
  /** 贡献这条事实的 L1 ID 列表。 */
  sourceL1Ids: string[];
  /** 该事实首次进入全局画像的时间。 */
  createdAt: string;
  /** 最近一次被更新的时间。 */
  updatedAt: string;
}

/**
 * 全局动态画像单例。
 */
export interface GlobalFactRecord {
  /** 固定单例 ID。始终为 `global_fact_record`。 */
  recordId: "global_fact_record";
  /** 当前全局画像中的事实列表。 */
  facts: GlobalFactItem[];
  /** 全局画像首次创建时间。 */
  createdAt: string;
  /** 全局画像最近一次变更时间。 */
  updatedAt: string;
}

/**
 * 级联索引之间的显式关联。
 */
export interface IndexLinkRecord {
  /** 关联记录 ID。 */
  linkId: string;
  /** 来源层级。 */
  fromLevel: "l2" | "l1" | "l0";
  /** 来源索引 ID。 */
  fromId: string;
  /** 目标层级。 */
  toLevel: "l2" | "l1" | "l0";
  /** 目标索引 ID。 */
  toId: string;
  /** 关联创建时间。 */
  createdAt: string;
}

/**
 * 用户问题的意图分类结果。
 */
export type IntentType = "time" | "project" | "fact" | "general";

/**
 * L2 搜索结果。
 */
export type L2SearchResult =
  | {
      /** 命中分数。 */
      score: number;
      /** 命中的 L2 类型。 */
      level: "l2_time";
      /** 命中的时间维索引。 */
      item: L2TimeIndexRecord;
    }
  | {
      /** 命中分数。 */
      score: number;
      /** 命中的 L2 类型。 */
      level: "l2_project";
      /** 命中的项目维索引。 */
      item: L2ProjectIndexRecord;
    };

/**
 * L1 搜索结果。
 */
export interface L1SearchResult {
  /** 命中分数。 */
  score: number;
  /** 命中的 L1 记录。 */
  item: L1WindowRecord;
}

/**
 * L0 搜索结果。
 */
export interface L0SearchResult {
  /** 命中分数。 */
  score: number;
  /** 命中的 L0 记录。 */
  item: L0SessionRecord;
}

/**
 * 一次完整推理检索的返回结构。
 */
export interface RetrievalResult {
  /** 原始查询。 */
  query: string;
  /** 识别出的意图。 */
  intent: IntentType;
  /** 在哪一层已经足够回答。 */
  enoughAt: "l2" | "l1" | "l0" | "none";
  /** 命中的 L2 结果。 */
  l2Results: L2SearchResult[];
  /** 命中的 L1 结果。 */
  l1Results: L1SearchResult[];
  /** 命中的 L0 结果。 */
  l0Results: L0SearchResult[];
  /** 注入给模型的上下文文本。 */
  context: string;
}

/**
 * Dashboard 总览指标。
 */
export interface DashboardOverview {
  /** L0 总数。 */
  totalL0: number;
  /** L1 总数。 */
  totalL1: number;
  /** L2 时间索引总数。 */
  totalL2Time: number;
  /** L2 项目索引总数。 */
  totalL2Project: number;
  /** 全局画像中的事实条数。 */
  totalFacts: number;
  /** 最近一次 heartbeat 完成时间。 */
  lastIndexedAt?: string;
}

/**
 * 本地 UI 首屏快照。
 */
export interface MemoryUiSnapshot {
  /** 总览指标。 */
  overview: DashboardOverview;
  /** 最近的时间维 L2 索引。 */
  recentTimeIndexes: L2TimeIndexRecord[];
  /** 最近的项目维 L2 索引。 */
  recentProjectIndexes: L2ProjectIndexRecord[];
  /** 最近的 L1 结构化窗口。 */
  recentL1Windows: L1WindowRecord[];
  /** 最近的 L0 原始会话。 */
  recentSessions: L0SessionRecord[];
  /** 全局动态画像单例。 */
  globalFact: GlobalFactRecord;
}
