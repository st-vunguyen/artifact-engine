# EXECUTION-LIFECYCLE.md — Run States & Transitions

> Full execution-engine state machine. The orchestrator transitions between these states as a workflow runs.

---

## States

| State | Meaning |
|---|---|
| `CREATED` | run-id allocated, runtime dir initialized, plan not yet built |
| `PLANNING` | execution-mapping running |
| `RUNNING` | ≥1 phase dispatched, none failing |
| `BLOCKED` | a phase failed; awaiting recovery decision |
| `RECOVERING` | retry in progress |
| `PUBLISHING` | all phases passed; promotion to shared/output happening |
| `SUCCEEDED` | publish complete; package signed |
| `FAILED` | recovery exhausted or unrecoverable blocker |
| `CANCELLED` | user explicitly cancelled |

Terminal states: `SUCCEEDED`, `FAILED`, `CANCELLED`.

---

## Transition diagram

```
       ┌────────────┐
       │  CREATED   │
       └─────┬──────┘
             │ start
             ▼
       ┌────────────┐
       │  PLANNING  │
       └─────┬──────┘
             │ plan ready
             ▼
       ┌────────────┐
       │  RUNNING   │ ◀─────────────┐
       └──┬────┬────┘               │
          │    │                    │
          │ all │ blocker           │ recovered
   pass   │    ▼                    │
          │  ┌──────────┐           │
          │  │ BLOCKED  │ ─────────►RECOVERING
          │  └────┬─────┘           │
          │       │ unrecoverable   │
          ▼       ▼                 │
       ┌─────────────┐              │
       │ PUBLISHING  │              │
       └────┬────┬───┘              │
            │    │                  │
            ▼    ▼                  ▼
       ┌────────┐ ┌───────┐    ┌────────┐
       │SUCCESS │ │ FAIL  │    │ FAILED │
       └────────┘ └───────┘    └────────┘
```

Plus `CANCELLED` reachable from RUNNING / BLOCKED / RECOVERING via user cancel.

Full detail: [core/orchestrator/execution-engine/execution-lifecycle.md](core/orchestrator/execution-engine/execution-lifecycle.md).

---

## Persistence

Every transition flushes:

```
runtime/active-executions/<run-id>/run.state.json
runtime/logs/<run-id>/events.jsonl   (append-only)
```

Schema: [core/artifact-contracts/metadata/execution-state-schema.json](core/artifact-contracts/metadata/execution-state-schema.json).

---

## Phase status (per phase, within a run)

```
pending → running → succeeded
                 ↘ failed
                 ↘ skipped
```

The orchestrator tracks status per phase in `run.state.json.phases`.

---

## Checkpoint policy

| Trigger | Action |
|---|---|
| Phase listed in `workflow.checkpoint_after` | Write checkpoint after success |
| Long-running phase (> 30 min) | Optional hot checkpoint mid-phase |

Format: [core/orchestrator/checkpoint-system/checkpoint-format.md](core/orchestrator/checkpoint-system/checkpoint-format.md).

---

## Resume semantics

A run is resumable iff:
- Latest persisted state ∈ {BLOCKED, RECOVERING, RUNNING (engine crash)}
- Frozen workflow + registries match the originals (or compatibility flag set)
- Latest checkpoint passes integrity check

`SUCCEEDED`, `FAILED`, `CANCELLED` are terminal — start fresh.

Full detail: [core/orchestrator/checkpoint-system/resume-strategy.md](core/orchestrator/checkpoint-system/resume-strategy.md).

---

## Time bounds

| Bound | Default |
|---|---|
| Per-phase timeout | 900 seconds (15 min) |
| Per-run hard timeout | 7200 seconds (2 hours) |
| Per-phase max retries | 2 |
| Per-run total max retries | 6 |

Workflows override per phase / per workflow.

---

## Cancellation

```
user calls cancel
  ↓
state.transition(→ CANCELLED on next safe boundary)
  ↓
phase runners signaled to wrap up
  ↓
grace period (30s default)
  ↓
finalize; runtime dir retained for inspection
```

---

## Reporting hooks

On terminal states (SUCCEEDED / FAILED / CANCELLED):

```
reporting-mcp.build-report(scope) → REPORT.md
artifact-analysis-mcp.summarize-recovery(events) → recovery timeline
manifest signed (file list + checksums + run metadata)
```

The transition does not complete until the report is written; every terminal run has a human-readable artifact.

---

## See also

- [core/orchestrator/execution-engine/execution-lifecycle.md](core/orchestrator/execution-engine/execution-lifecycle.md)
- [core/orchestrator/execution-engine/execution-state-manager.md](core/orchestrator/execution-engine/execution-state-manager.md)
- [core/orchestrator/checkpoint-system/checkpoint-manager.md](core/orchestrator/checkpoint-system/checkpoint-manager.md)
- [RECOVERY-POLICY.md](RECOVERY-POLICY.md)
