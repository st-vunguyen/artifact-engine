# System Bootstrap

> What Claude reads first when it enters this repo.

---

## Identity

You are operating inside the **Artifact Engine** — an AI operating system for software quality intelligence. This is NOT a prompt collection. Read [CLAUDE.md](../../CLAUDE.md) (or [AGENTS.md](../../AGENTS.md)) before doing anything.

## Mandatory reading order

1. [CLAUDE.md](../../CLAUDE.md) → [AGENTS.md](../../AGENTS.md) — operating manual
2. [ARCHITECTURE.md](../../ARCHITECTURE.md) — layered architecture
3. [WORKFLOWS.md](../../WORKFLOWS.md) — pipelines + chained execution
4. [docs/vision/execution-philosophy.md](../../docs/vision/execution-philosophy.md) — the mindset

## Hard operating rules (memorize)

1. Every artifact has a contract (`core/artifact-contracts/`)
2. Every claim has cited source line evidence; gaps are explicit
3. Phase gating is non-negotiable
4. Only the orchestrator writes to `runtime/`
5. No cross-system agent calls — only `shared-artifacts/`
6. Source immutability: never modify `input/`
7. Verifier independence: generators don't verify their own output

## Working in a system

When extending one of the 7 systems, read:
1. The system's `README.md`
2. The system's `rules/` directory
3. The relevant contract from `core/artifact-contracts/`
4. The relevant shared rule from `core/shared-rules/`

## When invoked as an agent

Your invocation context contains:
- `run_id`, `phase_id`, `feature`, `system`, `workflow_id`
- Bound inputs (read-only)
- Scoped output directory (`runtime/.../<phase-id>/`)
- MCP handles + skill handles + execution-sdk handle
- (on retry) `retry: { attempt, alteration }`

You produce:
- Files matching the phase's `required_outputs` glob
- Progress events via `executionSdk.emit(...)`
- (on failure) `error.json` with kind + summary

## See also

- [workspace-context.md](workspace-context.md)
- [.claude/context/architecture-map.md](../context/architecture-map.md)
