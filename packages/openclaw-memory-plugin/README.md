# ClawXMemory OpenClaw 插件

`@clawxmemory/clawxmemory-openclaw` 是仓库里的 OpenClaw `memory` 插件实现。

它负责：

- 采集对话并写入 `L0`
- 在话题闭合时构建 `L1`
- 更新 `L2` 项目、`L2` 每日时间记忆和单例 `GlobalProfileRecord`
- 在 `before_prompt_build` 阶段注入记忆上下文
- 在 `before_reset` 前做当前 session 的 best-effort flush
- 启动本地记忆看板

## 对大多数人

安装、使用、更新、排障和二次开发说明已经统一放到仓库根 README：

- [README.md](../../README.md)

## 这个包更适合什么时候看

当你在意的是插件包本身，而不是整个仓库时，再看这里：

- `openclaw.plugin.json`：manifest、config schema、UI hints
- `src/index.ts`：插件入口
- `src/runtime.ts`：运行态壳层
- `src/hooks.ts`：OpenClaw hook 接线
- `src/core/**`：记忆核心

## 关键配置

OpenClaw 里应确保：

```json
{
  "plugins": {
    "slots": {
      "memory": "clawxmemory-openclaw"
    },
    "entries": {
      "clawxmemory-openclaw": {
        "enabled": true,
        "hooks": {
          "allowPromptInjection": true
        }
      }
    }
  }
}
```

说明：

- 这是 `kind: "memory"` 插件，应该放在 `plugins.slots.memory`
- `allowPromptInjection: true` 需要开启，否则 `before_prompt_build` 的记忆注入会被 OpenClaw 屏蔽

安装后建议用以下命令确认状态：

```bash
openclaw plugins inspect clawxmemory-openclaw
```

如果本机 `39393` 端口冲突，可在 OpenClaw 配置里的 `plugins.entries.clawxmemory-openclaw.config.uiPort` 显式改端口；默认配置文件是 `~/.openclaw/openclaw.json`，如果你使用 `OPENCLAW_CONFIG_PATH`，则修改对应文件。

## 调试

```bash
npm run debug:retrieve --workspace @clawxmemory/clawxmemory-openclaw -- --query "项目进展"
```

## 发布到 ClawHub

这个包在 ClawHub 应按 `code-plugin` 发布。由于它位于 monorepo 子目录，发布命令需要显式带上 `--source-path`：

```bash
clawhub package publish packages/openclaw-memory-plugin \
  --family code-plugin \
  --source-repo UltraRAG/youarememory \
  --source-commit <release-commit-sha> \
  --source-path packages/openclaw-memory-plugin
```

说明：

- 这条命令应从仓库根目录执行
- `--source-commit` 应填写实际发布使用的 commit SHA，而不是旧值
- 发布后初始扫描状态显示为 `pending` 属于正常现象
