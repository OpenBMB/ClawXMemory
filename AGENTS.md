# AGENTS.md

This file is the repository-wide guide for coding agents working on ClawXMemory.

Use this file for agent-facing implementation guidance. Keep user-facing product and usage documentation in [README.md](README.md) and [docs/README_zh.md](docs/README_zh.md).

This file replaces the old agent-oriented docs previously stored in:

- `docs/code-review-guide.md`
- `docs/memory-design.md`
- `docs/prompt-flow-audit.md`

## Repository Scope

ClawXMemory is an OpenClaw `memory` plugin. The repository contains:

- the plugin runtime and storage engine
- the multi-level memory indexing pipeline
- the retrieval and prompt-injection flow
- the local dashboard
- agent skills and rule files that shape extraction and recall behavior

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
  Background indexing pipeline from raw sessions into L1, L2, and the global profile.
- `clawxmemory/src/core/retrieval/reasoning-loop.ts`
  Multi-hop retrieval, recall budgets, local fallbacks, cache behavior, evidence rendering, and final context assembly.
- `clawxmemory/src/core/skills/llm-extraction.ts`
  Structured LLM prompts and parsers for routing, evidence selection, topic boundaries, extraction, project resolution, time summaries, and profile rewrites.
- `clawxmemory/src/core/storage/sqlite.ts`
  SQLite persistence, query helpers, and repository-level read/write behavior.
- `clawxmemory/src/ui-server.ts`
  Local dashboard server.
- `clawxmemory/ui-source/*`
  Dashboard frontend.
- `clawxmemory/skills/*.json` and `clawxmemory/skills/context-template.md`
  Policy and rendering assets used by retrieval/indexing flows.
- `clawxmemory/agent-skills/*/SKILL.md`
  Agent-facing workflows for browsing, orchestrating, and maintaining memory.

## Architecture Contract

ClawXMemory is intentionally `plugin-first`, not `skills-only`.

Use the plugin runtime for:

- lifecycle hooks
- automatic L0 capture
- background indexing
- retrieval-time prompt injection
- tool registration
- the local UI server

Use `skills` and prompt assets for:

- extraction rules
- intent and routing rules
- project status normalization
- retrieval context rendering
- agent workflows built on top of the plugin tools

Do not redesign the system as a pure skill layer unless the OpenClaw lifecycle constraints also change.

## Memory Model

The runtime stores a strict multi-level memory structure:

- `L0SessionRecord`
  Raw conversation sessions captured from OpenClaw.
- `L1WindowRecord`
  Closed-topic memory windows extracted from L0 sessions.
- `L2TimeIndexRecord`
  Daily timeline summaries aggregated from L1 windows.
- `L2ProjectIndexRecord`
  Project-level summaries aggregated from L1 windows.
- `GlobalProfileRecord`
  A singleton global profile record with `recordId: "global_profile_record"`.

Field semantics that should stay stable unless a migration is introduced:

- `indexed`
  Only on `L0SessionRecord`. Marks whether the raw session has already been consumed by the heartbeat pipeline.
- `source`
  Only on `L0SessionRecord`. Tracks where raw sessions came from, such as `openclaw`, `skill`, or `import`.
- `createdAt`
  First persistence time for a record.
- `updatedAt`
  Last aggregation rewrite time for mutable records such as L2 indexes and the global profile.

Structural constraints:

- `L0`, `L1`, and `L2` are append-and-aggregate collections.
- `GlobalProfileRecord` is a singleton and should not drift into a multi-row fact table model.
- The effective retrieval hierarchy is `L2 -> L1 -> L0`.
- Recent open topics are buffered before they become L1 and should not be recalled prematurely.

## Runtime Flow

### Answer-time Retrieval

The main answer-time hook is `before_prompt_build`.

Actual flow:

1. Read the current user query from the hook event.
2. Call `ReasoningRetriever.retrieve(...)`.
3. Build a ClawXMemory runtime contract.
4. If retrieval returns evidence, render `clawxmemory/skills/context-template.md`.
5. Inject the contract and rendered evidence through `prependSystemContext`.

Important: the current runtime uses `prependSystemContext`, not `prependContext` and not `appendSystemContext`.

### Multi-hop Retrieval

The live retrieval chain is implemented in `clawxmemory/src/core/retrieval/reasoning-loop.ts`.

Current retrieval behavior:

1. Check caches, fast exits, profile availability, local fallback candidates, and background-busy conditions.
2. Hop 1 decides whether memory is relevant and which route to prefer.
   Inputs are the user query and a truncated `GlobalProfileRecord`.
3. Code builds candidate L2 catalogs locally.
4. Hop 2 reads candidate `L2Time` and `L2Project` entries and decides whether L2 is enough or whether to descend.
5. Code resolves candidate `L1` and `L0` only from the selected L2 sources.
6. Hop 3 reads selected L2 items, candidate L1 windows, and L0 headers/previews, then chooses whether full L0 is required.
7. Final context is rendered from:
   - `intent`
   - `enoughAt`
   - `profileBlock`
   - `l2Block`
   - `l1Block`
   - `l0Block`

Model prompts do not fully control the final result. Code-side guardrails also matter:

- local fallback candidate building
- recall budget allocation
- hop output stabilization
- local L2 shortlist construction
- selected-id resolution and fallback
- profile-vs-time preference logic in some cases

If you audit or change retrieval behavior, review both prompts and these code-side controls.

### Background Indexing

The indexing pipeline is centered on `clawxmemory/src/core/pipeline/heartbeat.ts`.

Current pipeline responsibilities:

- capture L0 conversation sessions
- keep an active-topic buffer for still-open threads
- detect topic boundaries
- extract L1 windows
- canonicalize or complete project details
- update L2 time summaries
- update L2 project summaries
- rewrite the singleton global profile

Prompt changes in extraction or aggregation are not enough by themselves. Always verify the surrounding repository and merge logic in:

- `clawxmemory/src/core/indexers/l1-extractor.ts`
- `clawxmemory/src/core/indexers/l2-builder.ts`
- `clawxmemory/src/core/pipeline/heartbeat.ts`

## Review Priorities

When reviewing or modifying this repository, prioritize these questions:

1. Does the plugin still own OpenClaw dynamic memory cleanly?
2. Are lifecycle hooks wired correctly and in the expected order?
3. Does retrieval preserve the intended hierarchy: profile or L2 first, then L1, then L0 only when needed?
4. Do local fallbacks and timeout behavior degrade safely without blocking the main reply?
5. Does heartbeat indexing avoid duplicate L0 consumption and preserve topic boundaries?
6. Does `GlobalProfileRecord` remain a singleton rewrite target?
7. Do tool outputs and dashboard views reflect the real repository state rather than stale or legacy structures?
8. If prompts or rule files change, do code-side assumptions still match them?

Recommended review order:

1. `clawxmemory/src/index.ts`
2. `clawxmemory/src/runtime.ts`
3. `clawxmemory/src/core/retrieval/reasoning-loop.ts`
4. `clawxmemory/src/core/skills/llm-extraction.ts`
5. `clawxmemory/src/core/pipeline/heartbeat.ts`
6. `clawxmemory/src/core/storage/sqlite.ts`
7. `clawxmemory/src/tools.ts`
8. `clawxmemory/agent-skills/*/SKILL.md`
9. `clawxmemory/skills/*.json` and `clawxmemory/skills/context-template.md`

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
