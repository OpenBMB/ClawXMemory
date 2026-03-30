# ClawXMemory 代码审查指南（插件优先版）

本指南面向 OpenClaw 插件实现。

## 1. 先看整体分层

- 插件能力层：`clawxmemory/src/**`
- Agent Skills 编排层：`clawxmemory/agent-skills/**`
- 策略配置层：`clawxmemory/skills/**`

## 2. 功能与文件映射

### 插件入口与生命周期

- `clawxmemory/src/index.ts`
  - runtime 组装、tools 注册、hook 注册
- `clawxmemory/src/runtime.ts`
  - 运行态 service、queue、timer、`before_reset` flush
- `clawxmemory/src/hooks.ts`
  - `before_prompt_build`
  - `before_message_write`
  - `agent_end`
  - `before_reset`

### 记忆构建与检索

- `clawxmemory/src/core/pipeline/heartbeat.ts`
- `clawxmemory/src/core/indexers/l1-extractor.ts`
- `clawxmemory/src/core/indexers/l2-builder.ts`
- `clawxmemory/src/core/retrieval/reasoning-loop.ts`
- `clawxmemory/src/core/storage/sqlite.ts`

重点关注：

- `L0` 默认是否按 `full_session` 采集
- `GlobalProfileRecord` 是否仍保持单例模型
- `MemoryUiSnapshot` 是否直接返回 `recentL1Windows + globalProfile`

### 工具与 UI

- `clawxmemory/src/tools.ts`
- `clawxmemory/src/ui-server.ts`
- `clawxmemory/ui-source/index.html`
- `clawxmemory/ui-source/app.js`
- `clawxmemory/ui-source/app.css`

重点关注：

- 看板是否已切到“主工作区 + 右侧按需抽屉”的信息结构
- Facts 视图是否展示单例全局画像，而不是旧版 facts 行列表

### Agent Skills

- `clawxmemory/agent-skills/memory-orchestrator/SKILL.md`
- `clawxmemory/agent-skills/memory-maintenance/SKILL.md`
- `clawxmemory/agent-skills/memory-maintenance/scripts/*.mjs`

### 策略配置

- `clawxmemory/skills/intent-rules.json`
- `clawxmemory/skills/extraction-rules.json`
- `clawxmemory/skills/project-status-rules.json`
- `clawxmemory/skills/context-template.md`
- `docs/memory-design.md`

## 3. 推荐审查顺序

1. `src/index.ts`：先看生命周期调用入口。
2. `src/core/retrieval/reasoning-loop.ts`：看检索决策链路。
3. `src/core/pipeline/heartbeat.ts`：看索引构建主流程。
4. `src/core/storage/sqlite.ts`：看数据落库与查询。
5. `src/tools.ts`：看对外工具契约。
6. `agent-skills/*/SKILL.md`：看编排是否符合预期。
7. `skills/*.json|md`：看规则是否合理。

## 4. 验证命令

```bash
npm run build
npm run typecheck
npm run debug:retrieve -- --query "项目进展"
```
