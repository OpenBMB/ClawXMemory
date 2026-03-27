# ClawXMemory Prompt Flow Audit

这份文档只做一件事：把当前仓库里所有真正参与运行时的 prompt，按实际执行顺序整理出来，方便逐条核对当前算法是不是你想要的。

## 范围

- 覆盖自动回答链路里的 prompt
- 覆盖后台索引构建链路里的 prompt
- 覆盖仍然留在代码中的遗留/辅助 prompt
- 单独标出那些不是 prompt，但会改变最终推理结果的代码侧护栏

不覆盖：

- OpenClaw 自己内部未在本仓库中的系统提示词实现细节
- 用户 workspace 文件的具体内容本身

## 1. 自动回答链路：真实执行顺序

### 1.1 OpenClaw 宿主 Project Context 先存在

OpenClaw 会先把 workspace bootstrap 文件注入到宿主 system prompt 里的 Project Context。ClawXMemory 不接管这一步，也不会自动改写这些文件。

### 1.2 `before_prompt_build` 触发

OpenClaw 在回答前触发 `before_prompt_build`，插件在这里做动态记忆检索。

相关代码：

- [hooks.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/hooks.ts)
- [runtime.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/runtime.ts)

当前真实行为：

1. 读取当前用户问题 `event.prompt`
2. 调用 `ReasoningRetriever.retrieve(...)`
3. 生成一段 ClawXMemory runtime contract
4. 如果拿到了 `retrieved.context`，把证据块拼到 runtime contract 后面
5. 通过 `prependSystemContext` 注入给 OpenClaw

注意：代码当前是 `prependSystemContext`，不是 `prependContext` 或 `appendSystemContext`。

## 2. `ReasoningRetriever.retrieve()` 主推理链

主逻辑在：

- [reasoning-loop.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/retrieval/reasoning-loop.ts)

当前真实顺序如下。

### 2.1 先做缓存和快速退出

先检查：

- recall cache
- 是否有 `GlobalProfile`
- 是否有本地 fallback 候选
- 后台索引是否正在忙

如果后台忙，会直接走本地 fallback，不等 LLM。

这部分不是 prompt，但会直接改变是否进入三跳推理。

### 2.2 Hop1：决定要不要查动态记忆，以及先走哪条路

定义位置：

- [llm-extraction.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/skills/llm-extraction.ts)

涉及内容：

- `HOP1_ROUTE_SYSTEM_PROMPT`
- `buildHop1RoutePrompt(input)`
- `decideMemoryRoute(...)`

#### Hop1 system prompt 的职责

- 判断 `memory_relevant`
- 判断 `base_only`
- 选择 `route = none | time | project | general`
- 生成 `time_selector`
- 生成 `project_lookup_query`

#### Hop1 user prompt 当前输入字段

```json
{
  "query": "当前用户问题",
  "global_profile": {
    "id": "profile id",
    "text": "截断后的全局画像"
  }
}
```

也就是说，Hop1 当前只看：

- 用户 query
- 截断后的 `GlobalProfile`

它还看不到：

- `L2`
- `L1`
- `L0`

### 2.3 Hop1 之后，本地准备候选 `L2`

代码位置：

- [reasoning-loop.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/retrieval/reasoning-loop.ts)

这里不是 prompt，但它决定了 Hop2 看到什么：

- `buildRouteCandidates(...)`
- 时间候选 `L2Time`
- 项目候选 `L2Project`

注意：这一步仍然包含代码侧筛选，不是纯模型端自己全权决定候选集。

### 2.4 Hop2：读候选 `L2`，判断是否停在 `L2`

定义位置：

- [llm-extraction.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/skills/llm-extraction.ts)

涉及内容：

- `HOP2_L2_SYSTEM_PROMPT`
- `buildHop2L2Prompt(input)`
- `selectL2ForQuery(...)`

#### Hop2 system prompt 的职责

- 读取候选 `L2`
- 选择 `selected_l2_ids`
- 输出 `intent`
- 输出 `enough_at = l2 | descend_l1 | none`

#### Hop2 user prompt 当前输入字段

```json
{
  "query": "当前用户问题",
  "global_profile": {
    "id": "profile id",
    "text": "截断后的全局画像"
  },
  "l2_time": [
    {
      "id": "l2 time id",
      "date_key": "2026-03-16",
      "summary": "时间摘要"
    }
  ],
  "l2_project": [
    {
      "id": "l2 project id",
      "project_key": "project-key",
      "project_name": "项目名",
      "status": "状态",
      "updated_at": "更新时间",
      "summary": "项目摘要",
      "latest_progress": "最近进展"
    }
  ]
}
```

也就是说，Hop2 当前能看到：

- `query`
- `GlobalProfile`
- 候选 `L2Time`
- 候选 `L2Project`

它当前看不到：

- `L1`
- `L0`

### 2.5 Hop2 之后，基于选中的 `L2` 准备候选 `L1 / L0`

代码位置：

- [reasoning-loop.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/retrieval/reasoning-loop.ts)

当前真实行为：

- 只会从选中的 `L2` 的 link/source 往下拿 `L1`
- 再从这些候选 `L1` 往下拿 `L0`

也就是说，当前层级关系是：

`L2 -> L1 -> L0`

不会让 Hop2 直接看到 `L0`。

### 2.6 Hop3：读 `L1` 和 `L0 preview`，决定是否需要下钻到原始会话

定义位置：

- [llm-extraction.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/skills/llm-extraction.ts)

涉及内容：

- `HOP3_EVIDENCE_SYSTEM_PROMPT`
- `buildHop3EvidencePrompt(input)`
- `selectEvidenceFromL1(...)`

#### Hop3 system prompt 的职责

- 读取已选 `L2`
- 读取候选 `L1`
- 读取 `L0` 头信息
- 输出：
  - `use_profile`
  - `selected_l1_ids`
  - `selected_l0_ids`
  - `enough_at = l1 | l0 | none`

#### Hop3 user prompt 当前输入字段

```json
{
  "query": "当前用户问题",
  "global_profile": {
    "id": "profile id",
    "text": "截断后的全局画像"
  },
  "selected_l2_time": [
    {
      "id": "l2 time id",
      "date_key": "2026-03-16",
      "summary": "时间摘要"
    }
  ],
  "selected_l2_project": [
    {
      "id": "l2 project id",
      "project_key": "project-key",
      "project_name": "项目名",
      "status": "状态",
      "summary": "项目摘要",
      "latest_progress": "最近进展"
    }
  ],
  "l1_windows": [
    {
      "id": "l1 id",
      "session_key": "session",
      "time_period": "时间段",
      "summary": "L1 摘要",
      "situation": "L1 情景摘要",
      "projects": ["project a", "project b"]
    }
  ],
  "l0_headers": [
    {
      "id": "l0 id",
      "session_key": "session",
      "timestamp": "时间",
      "last_user_message": "最后一条用户消息摘要",
      "last_assistant_message": "最后一条助手消息摘要"
    }
  ]
}
```

注意两点：

- Hop3 看到的是 `L0 header / preview`，不是完整原始对话
- 最终只有真的选中了 `selected_l0_ids`，后面才会把完整 `L0` 内容带进最终上下文

### 2.7 最终上下文模板渲染

模板文件：

- [context-template.md](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/skills/context-template.md)

当前模板内容很短，结构是：

```md
You are using multi-level memory indexes for this turn.
intent={{intent}}
enoughAt={{enoughAt}}

{{profileBlock}}

{{l2Block}}

{{l1Block}}

{{l0Block}}

Only use the above as supporting context; prioritize the user's latest request.
```

也就是说，最终真正注入给回答模型的动态记忆上下文，是这 6 块拼出来的：

- `intent`
- `enoughAt`
- `profileBlock`
- `l2Block`
- `l1Block`
- `l0Block`

### 2.8 最终注入点

注入发生在：

- [runtime.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/runtime.ts)

当前真实代码语义：

```ts
return { prependSystemContext: buildMemoryRuntimeSystemContext(retrieved.context) };
```

所以自动回答时的总输入顺序，可以理解为：

1. OpenClaw 自己已有的 system prompt
2. OpenClaw 宿主注入的 Project Context
3. 我们插件追加的 ClawXMemory runtime contract
4. 我们插件动态生成的 `context-template.md` 渲染结果（如果本轮选中了证据）
4. 用户当前问题

## 3. 直接工具路径

如果不是自动回答，而是显式调用工具，也会走 prompt。

代码位置：

- [tools.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/tools.ts)

其中：

- `memory_recall`

会直接复用同一个：

- `retriever.retrieve(query, ...)`

所以它背后还是上面的 Hop1/Hop2/Hop3 三跳链。

## 4. 后台索引链路：这些 prompt 不参与当前回答，但会决定以后能检索到什么

主调度位置：

- [heartbeat.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/pipeline/heartbeat.ts)

### 4.1 话题切换判断

定义位置：

- [llm-extraction.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/skills/llm-extraction.ts)

涉及内容：

- `TOPIC_BOUNDARY_SYSTEM_PROMPT`
- `buildTopicShiftPrompt(input)`
- `judgeTopicShift(...)`

当前输入字段：

- `current_topic_summary`
- `recent_user_turns`
- `incoming_user_turns`

这里当前只看用户消息，不看 assistant。

### 4.2 `L1` 提取

涉及内容：

- `EXTRACTION_SYSTEM_PROMPT`
- `buildPrompt(timestamp, messages, extraInstruction?)`
- `extract(...)`

当前输入字段是：

- 会话时间
- 可见消息序列
- 可选附加要求

它负责生成：

- `summary`
- `situation_time_info`
- `facts`
- `projects`

### 4.3 项目补全

涉及内容：

- `PROJECT_COMPLETION_SYSTEM_PROMPT`
- `buildProjectCompletionPrompt(input)`
- `completeProjectDetails(...)`

它在 L1 抽取后补齐遗漏项目线程。

### 4.4 `L2 项目` 归并

当前主路径是批量归并：

- `PROJECT_BATCH_RESOLUTION_SYSTEM_PROMPT`
- `resolveProjectIdentities(...)`

它当前由 [heartbeat.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/pipeline/heartbeat.ts) 调用。

另外代码里还留着一个单项目版本：

- `PROJECT_RESOLUTION_SYSTEM_PROMPT`
- `resolveProjectIdentity(...)`

但它不是当前主 heartbeat 链路。

### 4.5 `L2 时间` 日摘要重写

涉及内容：

- `DAILY_TIME_SUMMARY_SYSTEM_PROMPT`
- `buildDailyTimeSummaryPrompt(input)`
- `rewriteDailyTimeSummary(...)`

它会把已有当日摘要和新的 `L1` 窗口合成新的单日情景记忆。

### 4.6 `GlobalProfile` 重写

涉及内容：

- `GLOBAL_PROFILE_SYSTEM_PROMPT`
- `buildGlobalProfilePrompt(input)`
- `rewriteGlobalProfile(...)`

它会把：

- 现有全局画像
- 新 `L1` 中的稳定事实和项目信息

合成一段新的全局画像。

## 5. 遗留/辅助 prompt

代码里还有一套旧的 reasoning prompt：

- `REASONING_SYSTEM_PROMPT`
- `reasonOverMemory(input)`

位置：

- [llm-extraction.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/skills/llm-extraction.ts)

它现在不是主自动回答链路，但仍然在辅助搜索 `L2` 的路径里被调用：

- [reasoning-loop.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/retrieval/reasoning-loop.ts)

所以如果你要彻底审算法，这一套也不能忽略。

## 6. 不是 prompt，但会改写真实推理结果的代码护栏

这部分非常重要。只看 prompt 会误判当前算法，因为现在并不是“LLM prompt 决定一切”。

主要位置：

- [reasoning-loop.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/retrieval/reasoning-loop.ts)

当前会改写结果的主要代码点：

### 6.1 `buildLocalFallbackCandidates(...)`

本地先构造 fallback 候选。

### 6.2 `buildLocalFallback(...)`

后台忙或 LLM 失败时，直接走本地 fallback。

### 6.3 `getHopBudgets(...)`

把 `recallBudgetMs` 分给 Hop1/Hop2/Hop3。

### 6.4 `stabilizeHop1Decision(...)`

会对 Hop1 的原始输出做二次修正。

### 6.5 `buildRouteCandidates(...)`

本地决定给 Hop2 哪些 `L2` 候选。

### 6.6 `resolveSelectedIds(...)`

会对模型选中的 id 做整理和 fallback 兜底。

### 6.7 `shouldPreferProfileOverTimeL2(...)`

会在某些情况下强制偏向 `GlobalProfile`，压掉时间 `L2`。

这说明当前系统仍然存在“prompt 之外的行为控制”，不是完全纯模型驱动。

## 7. 当前最适合你人工核对的顺序

如果你要从头检查“现在的算法是不是我想要的”，建议按这个顺序看：

1. [runtime.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/runtime.ts)
2. [reasoning-loop.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/retrieval/reasoning-loop.ts)
3. [llm-extraction.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/skills/llm-extraction.ts)
4. [context-template.md](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/skills/context-template.md)
5. [heartbeat.ts](/Users/meisen/Desktop/youarememory/packages/openclaw-memory-plugin/src/core/pipeline/heartbeat.ts)

## 8. 当前已知文档不一致

现有旧文档里曾写过通过 `prependContext` 或 `prependSystemContext` 注入。

位置：

- [memory-design.md](/Users/meisen/Desktop/youarememory/docs/memory-design.md)

但真实代码现在已经是：

- `prependSystemContext`

所以如果你后面继续审文档，应该以代码为准。
