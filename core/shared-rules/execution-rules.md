# Execution Rules — Shared

> **Applies to:** every workflow, agent, and orchestrator action.
> **Authority:** highest. Defines how work runs.

---

## 1. The Universal Stages

Every workflow runs through this shape (no exceptions):

```
INPUT → ANALYSIS → GENERATION → VALIDATION → VERIFICATION → FINAL OUTPUT
```

Domain workflows fill the stages with specific phases. The shape is fixed.

---

## 2. Phase Gating

### R-X-01 — No phase starts before its dependencies finish
Computed from `Phase.depends_on`. The orchestrator topologically orders phases; independent phases run in parallel.

### R-X-02 — No phase ends before its `required_outputs` exist
The orchestrator scans `runtime/.../<phase-id>/` against the glob list. Missing files = phase incomplete.

### R-X-03 — No phase ends until its gates pass
Gates run after `required_outputs` are present. A failing gate freezes the workflow at this phase.

### R-X-04 — A frozen workflow is checkpointed, never silently dropped
The orchestrator writes a checkpoint and emits a structured blocker report. The user (or a recovery system) decides whether to retry, rewrite, or abandon.

---

## 3. Idempotency

### R-X-05 — Re-running a phase on the same input must produce a semantically equivalent output
Random reordering of equivalent items is allowed. Drifted citations, new claims, or dropped claims are NOT.

### R-X-06 — The orchestrator is the only writer to `runtime/`
Agents write to a phase-scoped folder; the orchestrator manages the layout. Agents do not touch `runtime/checkpoints/` or `runtime/logs/`.

### R-X-07 — `input/` is immutable across a run
Reading is unrestricted; writing is forbidden. Proposed corrections to `input/` are written as artifacts under `output/<package>/proposals/`.

---

## 4. Failure Handling

### R-X-08 — Failures map to recovery strategies declared in the workflow contract
The default mapping (see `workflow-contract.md`):

| Failure kind | Default strategy |
|---|---|
| `validation_failed` | `stop-and-report` |
| `agent_error` | `retry-up-to-2` |
| `missing_input` | `stop-and-report` |
| `mcp_unavailable` | `retry-with-backoff(max=3, base=10s)` |
| `gate_failed` | `stop-and-report` |
| `recovery_exhausted` | `stop-and-report` |

### R-X-09 — Recovery is deterministic
Given the same checkpoint and the same recovery strategy, the engine takes the same action.

### R-X-10 — Force-skipping a gate is forbidden
There is no `--force` flag. Failed gates require either fixing the artifact or rewriting the phase. The engine does not let workflows ship with skipped gates.

---

## 5. Checkpointing

### R-X-11 — Checkpoint after every phase listed in `checkpoint_after`
Format: `runtime/checkpoints/<run-id>/<phase-id>.checkpoint.json`. Schema in `core/orchestrator/checkpoint-system/checkpoint-format.md`.

### R-X-12 — Checkpoints are immutable
Once written, never edited. A new attempt writes a new checkpoint with a new id.

### R-X-13 — Resume reads the latest checkpoint and continues
The engine refuses to resume past a `fail` verdict — that's a stop-and-report condition.

---

## 6. Concurrency

### R-X-14 — Independent phases run in parallel
Per the DAG. The engine schedules concurrency up to a configurable limit.

### R-X-15 — Two runs of the same workflow cannot share a `<run-id>` directory
Run IDs are unique. Two runs at the same time produce two `runtime/active-executions/...` folders.

### R-X-16 — Cross-run coordination through `shared-artifacts/`, never via direct comms
A new run that needs an artifact published by a previous run reads `shared-artifacts/`. It does NOT scan the other run's `runtime/`.

---

## 7. Agent Behavior

### R-X-17 — Agents are pure with respect to runtime state
Agents read inputs, produce outputs in the phase-scoped folder, and exit. They do not modify the workflow definition, the orchestrator, or other phases' folders.

### R-X-18 — Agents emit structured progress, not free-form chatter
Allowed: artifact paths, status events, gap items, contradictions, errors with context.
Discouraged: prose narratives meant for human consumption (those go in REPORT.md, generated at publish).

### R-X-19 — Agents declare what they consume and produce
In their agent definition (frontmatter). The orchestrator validates that an agent only reads/writes within its declared boundaries.

### R-X-20 — Agents respect the verifier separation
Generators do not verify; verifiers do not generate.

---

## 8. MCP Use

### R-X-21 — MCP tools are stateless
Each call is independent. State lives in artifacts, not in MCP server memory.

### R-X-22 — Failing MCP calls do NOT silently degrade
If `traceability-mcp` fails, the workflow fails — it does not produce un-traced artifacts as a fallback.

---

## 9. Time and Determinism

### R-X-23 — Timestamps use UTC, ISO-8601
All `*_at` fields. Local times are forbidden in artifacts.

### R-X-24 — Identifiers are deterministic where possible
File checksums = SHA-256. Run IDs = `<system>-<feature>-<utc-compact>`. Slugify rules in `naming-conventions.md`.

---

## 10. Logging

### R-X-25 — All lifecycle events go to `runtime/logs/<run-id>/events.jsonl`
JSONL, one event per line. Structured. Queryable. The reporting-mcp consumes this for REPORT.md.

### R-X-26 — Agent stdout is captured, not surfaced as state
Captured into the run logs. State is what the artifacts say, not what an agent printed.

---

## 11. Resource and Time Bounds

### R-X-27 — Phases declare a soft timeout
Default 15 minutes per phase. Workflows MAY override per phase. Exceeding the timeout triggers `agent_error` recovery.

### R-X-28 — Workflows declare a hard timeout
Default 2 hours per workflow. Exceeding triggers `recovery_exhausted` and stop-and-report.

---

## 12. Forbidden Execution Patterns

| Pattern | Why forbidden |
|---|---|
| Skipping the verifier on a "small" workflow | Verifier is the gate; size doesn't matter. |
| Re-running a workflow over the previous run's `runtime/` directory | Use a new `<run-id>`. |
| Hot-modifying a workflow definition mid-run | Definitions are loaded once and frozen for the run. |
| An agent writing to `output/` directly | Promotion is the orchestrator's job. |
| A phase reading another phase's working files | Phases communicate via `required_outputs` only. |

---

## 13. The Execution Contract in One Paragraph

The orchestrator schedules phases topologically, runs them in their declared agents, validates required outputs, runs gates, checkpoints at declared boundaries, recovers per declared strategies, and refuses to promote unless verification verdict is pass or conditional-pass. Agents execute pure phase logic against typed inputs/outputs in scoped folders. Cross-system communication happens exclusively through `shared-artifacts/` with contract-validated handoffs. Every step is logged, deterministic where possible, and resumable.
