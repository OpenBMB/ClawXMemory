# AGENTS.md

This file is the repository-wide guide for coding agents working on ClawXMemory.

Use this file for agent-facing implementation guidance. Keep user-facing product and usage documentation in [README.md](README.md) and [docs/README_zh.md](docs/README_zh.md).

## Repository Scope

ClawXMemory is an OpenClaw `memory` plugin. The repository contains:

- the plugin runtime and hook wiring
- the file-based long-term memory store
- background indexing and Dream organization
- answer-time recall and prompt injection
- the local dashboard and trace views
- prompt assets and agent workflows

The current architecture is **markdown-first**:

- long-term memory lives in markdown files under the memory directory
- SQLite stores runtime control-plane state only
- recall, Dream, and UI all operate on file-memory, not on legacy aggregated tables

## Source Map

- `clawxmemory/src/index.ts`
  Plugin entry, service registration, tool registration, and prompt section registration.
- `clawxmemory/src/runtime.ts`
  Runtime composition, queue/timer orchestration, retrieval entrypoints, UI state, and memory boundary diagnostics.
- `clawxmemory/src/hooks.ts`
  Hook wiring for `before_prompt_build`, `before_message_write`, `agent_end`, `before_reset`, and internal message/command filtering.
- `clawxmemory/src/tools.ts`
  User-facing tool contracts: `memory_search`, `memory_overview`, `memory_list`, `memory_get`, and `memory_flush`.
- `clawxmemory/src/core/pipeline/heartbeat.ts`
  Background indexing pipeline from raw sessions into file-memory candidates and user profile rewrites.
- `clawxmemory/src/core/retrieval/reasoning-loop.ts`
  Single-project recall flow, project shortlist building, header-scan manifest selection, and final context assembly.
- `clawxmemory/src/core/review/dream-review.ts`
  Dream planning, project rewrite execution, file deletion, and user-profile rewrite orchestration.
- `clawxmemory/src/core/skills/llm-extraction.ts`
  Structured LLM prompts and parsers for extraction, route selection, project selection, manifest selection, Dream planning, and profile rewrites.
- `clawxmemory/src/core/storage/sqlite.ts`
  SQLite runtime state, raw session queue, indexing settings, and recent trace persistence.
- `clawxmemory/src/core/file-memory.ts`
  Markdown-backed memory store for `user-profile.md`, `project.meta.md`, `Project/*.md`, `Feedback/*.md`, and derived `MEMORY.md`.
- `clawxmemory/src/ui-server.ts`
  Local dashboard server.
- `clawxmemory/ui-source/*`
  Dashboard frontend.

## Architecture Contract

ClawXMemory is intentionally `plugin-first`, not `skills-only`.

Use the plugin runtime for:

- lifecycle hooks
- automatic raw session capture
- background indexing
- retrieval-time prompt injection
- Dream execution
- tool registration
- the local UI server

Use skills and prompt assets for:

- extraction rules
- recall routing and project selection
- Dream planning and project rewrite instructions
- retrieval context rendering
- agent workflows built on top of the plugin tools

Do not redesign the system as a pure skill layer unless the OpenClaw lifecycle constraints also change.

## Memory Model

The current system has two distinct layers.

### 1. Runtime state in SQLite

SQLite is a control-plane store, not the long-term memory truth source.

It persists:

- `l0_sessions`
  Raw captured conversation sessions waiting for or already processed by indexing.
- `pipeline_state`
  Runtime settings, recent case/index/dream traces, timestamps, and other plugin state.

Field semantics that should stay stable unless a migration is introduced:

- `indexed`
  Only on `L0SessionRecord`. Marks whether the raw session has already been consumed by the indexing pipeline.
- `source`
  Only on `L0SessionRecord`. Tracks where raw sessions came from, such as `openclaw`, `skill`, or `import`.
- `createdAt`
  First persistence time for a record.
- `updatedAt`
  Last runtime rewrite time for mutable state rows.

### 2. Long-term memory on disk

Long-term memory is stored as markdown files:

- `global/User/user-profile.md`
- `projects/<projectId>/project.meta.md`
- `projects/<projectId>/Project/*.md`
- `projects/<projectId>/Feedback/*.md`
- `global/MEMORY.md` and `projects/*/MEMORY.md`

`MEMORY.md` is a derived directory file for UI and debugging. It is not the recall truth source.

## Runtime Flow

### Answer-time Recall

The main answer-time hook is `before_prompt_build`.

Current flow:

1. Read the current user query and recent messages.
2. Call `ReasoningRetriever.retrieve(...)`.
3. Run the memory gate with route values:
   - `none`
   - `user`
   - `project_memory`
4. Load the global user profile when memory is needed.
5. For `project_memory`, build a formal project shortlist and let the model select at most one project.
6. Scan file headers from the selected project's `Project/*.md` and `Feedback/*.md`.
7. Let the model choose top-k memory files from the compact manifest.
8. Load selected files with full-text preference and hard limits.
9. Inject the rendered recall context through `prependSystemContext`.

Important:

- recall is **single-project by design**
- assistant replies are not used as project-resolution evidence
- `project.meta.md` is fixed context once a project is selected
- `MEMORY.md` is not used for semantic recall

### Background Indexing

The indexing pipeline is centered on `clawxmemory/src/core/pipeline/heartbeat.ts`.

Current responsibilities:

- capture raw sessions into `l0_sessions`
- batch unread sessions
- extract file-memory candidates
- write `Project/*.md`, `Feedback/*.md`, and user-profile updates
- record index traces and runtime stats

The indexing output is file-memory directly. There is no second persistent L1/L2 aggregation layer anymore.

### Dream

Dream is centered on `clawxmemory/src/core/review/dream-review.ts`.

Current responsibilities:

- read formal and `_tmp` file-memory
- ask the model for a global project plan
- ask the model to rewrite files per final project
- promote `_tmp` files into formal projects
- delete absorbed or superseded files
- rewrite `user-profile.md` when needed
- record Dream traces and summary state

Dream does not create a separate project summary layer and does not rely on `overview.md`.

## Review Priorities

When reviewing or modifying this repository, prioritize these questions:

1. Does markdown/file-memory remain the only long-term memory truth source?
2. Does SQLite stay limited to raw sessions, runtime state, and traces?
3. Does recall preserve the intended flow: `none / user / project_memory`, then single-project manifest selection?
4. Does Dream reorganize and rewrite files without reintroducing extra summary layers?
5. Do index and Dream avoid duplicate writes and clean up `_tmp` correctly?
6. Do tool outputs and dashboard views reflect real file-memory state rather than stale derived state?
7. If prompts or rule files change, do the surrounding code-side guardrails still match them?

Recommended review order:

1. `clawxmemory/src/index.ts`
2. `clawxmemory/src/runtime.ts`
3. `clawxmemory/src/core/retrieval/reasoning-loop.ts`
4. `clawxmemory/src/core/review/dream-review.ts`
5. `clawxmemory/src/core/pipeline/heartbeat.ts`
6. `clawxmemory/src/core/skills/llm-extraction.ts`
7. `clawxmemory/src/core/storage/sqlite.ts`
8. `clawxmemory/src/core/file-memory.ts`
9. `clawxmemory/src/tools.ts`

## Documentation Policy

Keep documentation split by audience:

- `AGENTS.md`
  Repository-specific guidance for coding agents and implementation reviews.
- `README.md`
  User-facing English overview, installation, and development basics.
- `docs/README_zh.md`
  User-facing Chinese overview.

Do not create new design-review or prompt-audit documents under `docs/` when the intended audience is coding agents. Extend this file instead.

## Validation Commands

Run commands from `clawxmemory/` unless a command explicitly needs the repository root:

```bash
npm run build
npm run typecheck
npm run test
npm run debug:retrieve -- --query "project progress"
```

Useful integration commands:

```bash
npm run relink
npm run reload
npm run uninstall
openclaw plugins inspect openbmb-clawxmemory --json
```
