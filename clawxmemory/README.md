# ClawXMemory Plugin

`@openbmb/clawxmemory` 是 ClawXMemory 仓库中的 OpenClaw `memory` 插件包。

它负责：

- 采集对话并写入 `L0`
- 在话题闭合时构建 `L1`
- 更新 `L2` 项目、`L2` 每日时间记忆和单例 `GlobalProfileRecord`
- 在 `before_prompt_build` 阶段注入记忆上下文
- 在 `before_reset` 前做当前 session 的 best-effort flush
- 启动本地记忆看板

## 安装

```bash
openclaw plugins install @openbmb/clawxmemory
openclaw gateway restart
```

安装后建议确认状态：

```bash
openclaw plugins inspect clawxmemory --json
```

## 关键配置

OpenClaw 里应确保：

```json
{
  "plugins": {
    "slots": {
      "memory": "clawxmemory"
    },
    "entries": {
      "clawxmemory": {
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
- 如果本机 `39393` 端口冲突，可在 `plugins.entries.clawxmemory.config.uiPort` 中显式改端口

## 开发

在这个目录下执行：

```bash
npm install
npm run build
npm run test
npm run debug:retrieve -- --query "项目进展"
```

本地 OpenClaw 联调命令：

```bash
npm run relink
npm run reload
npm run uninstall
```

## 发布到 ClawHub

在这个目录下执行：

```bash
npx clawhub package publish . --family code-plugin
```

当前 `clawhub package publish` CLI 不支持 `--dry-run`。如果需要先确认参数，可先执行：

```bash
npx clawhub package publish --help
```

仓库级安装、使用与设计说明见根目录 `README.md` 和 `docs/README_zh.md`。
