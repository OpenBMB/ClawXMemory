<p align="center">
  <picture>
    <img alt="ClawXMemory" src="./docs/image/logo.png" width="90%">
  </picture>
</p>

<h3 align="center">
Memory as Structure
</h3>

<p align="center">
  <a href="./docs/README_zh.md"><b>简体中文</b></a> &nbsp;|&nbsp; <b>English</b>
</p>

---

## 📖 About ClawXMemory

ClawXMemory is a memory system jointly released by Tsinghua University's THUNLP Lab, OpenBMB, ModelBest, and AI9Stars. Built on EdgeClaw's native long-term memory capability, it introduces a structured abstraction and systematic extension of the memory mechanism, then packages that design as a plugin so it can integrate cleanly into the OpenClaw ecosystem as a reusable general-purpose memory module. ClawXMemory is not a simple incremental enhancement to existing memory. It brings OpenClaw a structured, multi-level, evolvable long-term memory system: during conversations, information is gradually distilled into memory fragments and continuously aggregated into project memory, timeline memory, and user profiles; before each response, the model actively follows the memory structure to select and locate relevant memory layer by layer, bringing in only the context that is actually useful.

ClawXMemory focuses on three core questions: what to remember, how to organize it, and how to make it truly usable. It provides three corresponding capabilities:

- Structured multi-level memory: extract and aggregate conversations from L0 -> L1 -> L2, building an evolvable memory structure instead of stopping at flat history logs
- Model-driven selection and reasoning: rather than relying on conventional retrieval, the model follows memory indexes to choose relevant memory and reason over the needed context level by level
- Memory management and visualization: a local visual dashboard provides both canvas and list views so the memory structure and hierarchy remain easy to inspect; all memory is stored in local SQLite, and import/export support lets you migrate the full memory state across devices in one step

---

## 📦 Installation

### Requirements

> [!NOTE]
> Before you start, make sure:
>
> - Node.js `>= 24`
> - OpenClaw `>= 2026.3.22`
> - the `openclaw` CLI and gateway are available

### Recommended: install the released package

> [!TIP]
> This is the simplest and most stable option.

```bash
openclaw plugins install @clawxmemory/clawxmemory-openclaw
openclaw gateway restart
```

If your OpenClaw setup uses `tools.profile: "coding"` or any explicit allowlist, you also need to expose these three chat-facing tools to the agent. Otherwise, even though the plugin is loaded, the model side will still only see `memory_search` / `memory_get`:

```json
{
  "tools": {
    "alsoAllow": ["memory_overview", "memory_list", "memory_flush"]
  }
}
```

After installation, it is recommended to inspect the status:

```bash
openclaw plugins inspect clawxmemory-openclaw --json
```

If the gateway is not running yet:

```bash
openclaw gateway start
```

### Developer mode: install from source for local debugging

Use this when you need to modify code or debug the plugin locally:

```bash
git clone https://github.com/OpenBMB/ClawXMemory.git
cd ClawXMemory
npm install
npm run relink:memory-plugin
```

#### What does `relink` do?

`relink` automates the whole local integration flow: it builds the plugin, links it into OpenClaw, takes over the memory slot, writes the chat-facing memory tools into `tools.alsoAllow`, restarts the gateway, and performs a health check.

#### Use an isolated config

This avoids polluting your current OpenClaw environment:

```bash
OPENCLAW_CONFIG_PATH=/path/to/openclaw.json npm run relink:memory-plugin
```

#### Daily development flow

- First-time setup, switching installation mode, or clearing state
-> use `npm run relink:memory-plugin`
- Reloading after code-only changes
-> use `npm run reload:memory-plugin`

### Installation verification

Run the following commands to verify plugin status:

```bash
openclaw plugins inspect clawxmemory-openclaw --json
openclaw gateway status --json
```

Confirm that:

- `clawxmemory-openclaw` has `status: loaded`
- `plugins.slots.memory` points to `clawxmemory-openclaw`
- the gateway is running normally

### UI access

Open:

```text
http://127.0.0.1:39393/clawxmemory/
```

### Port conflicts / custom port

The default UI address is `http://127.0.0.1:39393/clawxmemory/`. If port `39393` is already occupied on your machine, explicitly set `uiPort` in the OpenClaw plugin config:

```json
{
  "plugins": {
    "entries": {
      "clawxmemory-openclaw": {
        "config": {
          "uiPort": 40404
        }
      }
    }
  }
}
```

The default config file is `~/.openclaw/openclaw.json`. If you use an isolated config, for example:

```bash
OPENCLAW_CONFIG_PATH=/path/to/openclaw.json npm run reload:memory-plugin
```

then edit the file pointed to by `OPENCLAW_CONFIG_PATH`, not the default config file.

The same plugin config block also supports:

- `uiHost`
- `uiPathPrefix`

After changing the config, run `openclaw gateway restart`, or in development run `npm run reload:memory-plugin` / `npm run relink:memory-plugin`. After reload, rely on the final `UI` address printed by the script; it follows the actual configured `uiHost`, `uiPort`, and `uiPathPrefix`.

### Uninstall

To uninstall only the plugin:

```bash
openclaw plugins uninstall clawxmemory-openclaw --force
```

> [!WARNING]
> OpenClaw only removes the plugin installation record, load path, and slot binding. It does not automatically restore the native memory-related configuration that ClawXMemory disabled to avoid conflicts.

To fully uninstall and restore native memory:

```bash
npm run uninstall:memory-plugin
```

If you are debugging against an isolated config, you can specify it explicitly:

```bash
OPENCLAW_CONFIG_PATH=/path/to/openclaw.json npm run uninstall:memory-plugin
```

---

## 🧠 How ClawXMemory Works

ClawXMemory gradually turns raw conversations into a structured memory system for long-term context modeling through a combination of hierarchical memory construction and model-driven selection.

For example, if you are iterating on a paper over time, each discussion is not forgotten or stored as disconnected fragments. Instead, those discussions are continuously merged into the current state of that project. When you later ask, "Where are we now?", the system answers directly from that state rather than searching through historical chat logs.

### Building the multi-level memory index

During memory construction, ClawXMemory takes conversations as input and automatically organizes information into structured memory in the background:

| List level | Meaning |
| ---------- | ------- |
| **Project Memory (L2)** | Long-term project memory aggregated by topic |
| **Time Memory (L2)** | Time-based memory aggregated by date |
| **Memory Fragments (L1)** | Structured summaries of closed topics |
| **Raw Conversation (L0)** | Original chat message records |
| **Profile** | Singleton user profile record |

The whole process requires no extra action: you chat as usual, the system keeps accumulating memory; you keep progressing on tasks, and the memory structure evolves with them. Short-term context handles the current response, while ClawXMemory turns those conversations into long-term context that can be reused repeatedly.

<p align="center">
  <picture>
    <img alt="build memory index" src="./docs/image/build_en.png" width=70%>
  </picture>
</p>

### Model-driven memory selection and reasoning

The issue in many systems is not that they lack memory, but that they have retrieval without understanding. When users ask questions like "What stage is this project at now?", "How did we decide on this plan last week?", or "Didn't you know I prefer Chinese phrasing?", the challenge is not simply finding a similar text span. The real question is whether the system knows which part of memory to inspect and how deep it needs to go.

ClawXMemory does not simply retrieve or concatenate history. Instead, the model actively follows the multi-level memory structure: it first checks higher-level project memory, time memory, or user profile to judge what may be relevant; only when that is insufficient does it continue locating finer-grained memory fragments, and if necessary it can trace back to concrete conversations.

<p align="center">
  <picture>
    <img alt="memory selection and inference" src="./docs/image/inference_en.png" width=50%>
  </picture>
</p>

The process is closer to progressively locating an answer along the memory structure than blindly searching through history. What enters the current response is no longer "as much history as possible", but only the context that is genuinely relevant to the question. In other words, ClawXMemory does not solve "how to stuff more history into the prompt"; it solves "how to use only the long-term context that actually matters."

---

## 🛠️ Development and Debugging

### Repository layout

```text
ClawXMemory/
├── packages/
│   └── openclaw-memory-plugin/
│       ├── src/          # Core logic (most important)
│       ├── ui-source/    # Local UI dashboard
├── docs/
└── scripts/
```

### Development workflow

```bash

# First-time link from this repo into your local OpenClaw
npm run relink:memory-plugin

# Rebuild and reload after modifying src/ or ui-source/
npm run reload:memory-plugin

# Optional: keep the plugin compiling continuously
npm run dev:plugin

# Type checking
npm run typecheck

# Test the plugin workspace
npm run test --workspace @clawxmemory/clawxmemory-openclaw

# Debug the memory retrieval flow
npm run debug:retrieve --workspace @clawxmemory/clawxmemory-openclaw -- --query "项目进展"

# Check npm package contents before release
npm run pack:check --workspace @clawxmemory/clawxmemory-openclaw

# Remove the plugin and restore OpenClaw native memory ownership
npm run uninstall:memory-plugin
```

It is recommended to separate daily development from pre-release validation:

- During local integration, prefer `relink` / `reload`; they handle build, link, config sync, and gateway restart for you.
- Before submitting or releasing, run at least `npm run typecheck`, `npm run test --workspace @clawxmemory/clawxmemory-openclaw`, and `npm run pack:check --workspace @clawxmemory/clawxmemory-openclaw` once.
- If you need to validate the install flow in an isolated environment, run `npm pack --workspace @clawxmemory/clawxmemory-openclaw` first, then do a smoke test with the generated `.tgz` via `openclaw plugins install`.
- OpenClaw `v2026.3.28` adds a memory-plugin-owned pre-compaction memory flush contract. ClawXMemory has evaluated that change, but this release intentionally keeps host-side `agents.defaults.compaction.memoryFlush` disabled until ClawXMemory has a dedicated durable-write path for its SQLite-backed memory model.

### Contributing

You can contribute through the standard flow: **Fork this repository -> open an Issue -> submit a Pull Request (PR)**.

---

## 📮 Contact

<table>
  <tr>
    <td>📋 <b>Issues</b></td>
    <td>For technical problems and feature requests, please use <a href="https://github.com/OpenBMB/ClawXMemory/issues">GitHub Issues</a>.</td>
  </tr>
  <tr>
    <td>📧 <b>Email</b></td>
    <td>If you have any questions, feedback, or would like to get in touch, email us at <a href="mailto:yanyk.thu@gmail.com">yanyk.thu@gmail.com</a>.</td>
  </tr>
</table>
