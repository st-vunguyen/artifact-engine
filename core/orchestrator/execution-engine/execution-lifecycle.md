# Execution Lifecycle

> **Module:** `core/orchestrator/execution-engine/execution-lifecycle`
> **Purpose:** define the lifecycle states of a workflow run and the transitions between them.

This document defines the states a run passes through, what triggers each transition, and what events are emitted.

---

## 1. State Machine

```
       ┌────────────┐
       │  CREATED   │   selector returned a SelectedWorkflow
       └─────┬──────┘
             │ start
             ▼
       ┌────────────┐
       │  PLANNING  │   execution-mapping building plan
       └─────┬──────┘
             │ plan ready
             ▼
       ┌────────────┐
       │  RUNNING   │   phases dispatched
       └──┬────┬────┘
          │    │
          │ all │ blocker
   pass   │    ▼ raised
          │  ┌──────────┐
          │  │ BLOCKED  │   waits for recovery decision
          │  └──┬──┬────┘
          │     │  │ retry succeeded     │ user resume
          │     │  ▼                     │
          │  ┌──────────┐                │
          │  │RECOVERING│                │
          │  └──┬──┬────┘                │
          │     │  │ recovered           │ unrecoverable
          │     │  └──────► RUNNING      ▼
          │     ▼                  ┌──────────┐
          ▼  ┌──────────┐          │  FAILED  │
       ┌────│PUBLISHING│          └──────────┘
       │    └────┬─────┘
       │         │
       │         ▼
       │  ┌──────────────┐
       │  │  SUCCEEDED   │
       │  └──────────────┘
       │
       └─────► PUBLISHED → SUCCEEDED
                 (no-op state; explicit terminal)
```

---

## 2. State Definitions

| State | Meaning | Persisted at |
|---|---|---|
| `CREATED` | run-id allocated, runtime dir initialized, plan not yet built | `run.meta.json` |
| `PLANNING` | execution-mapping running | `run.meta.json` |
| `RUNNING` | ≥1 phase dispatched, none failing | `run.state.json` |
| `BLOCKED` | a phase failed; awaiting retry or user decision | `run.state.json` + `run.blockers.json` |
| `RECOVERING` | retry in progress | `run.state.json` |
| `PUBLISHING` | all phases passed; promotion to shared-artifacts/output happening | `run.state.json` |
| `SUCCEEDED` | publish complete; package signed | `run.state.json` |
| `FAILED` | recovery exhausted or unrecoverable blocker | `run.state.json` |
| `CANCELLED` | user explicitly cancelled | `run.state.json` |

Terminal states: `SUCCEEDED`, `FAILED`, `CANCELLED`.

---

## 3. Events Emitted

```ts
type LifecycleEvent =
  | { type: "run.created", run_id, workflow_id, system, feature, started_at }
  | { type: "run.planning_started" }
  | { type: "run.planning_completed", phase_count, parallelism }
  | { type: "phase.started", phase_id }
  | { type: "phase.completed", phase_id, duration_ms }
  | { type: "phase.failed", phase_id, blockers, retries }
  | { type: "run.blocked", blockers }
  | { type: "run.recovery_started", strategy, target_phase }
  | { type: "run.recovery_completed", outcome: "succeeded" | "failed" }
  | { type: "run.publishing_started" }
  | { type: "shared-artifact.published", path, contract }
  | { type: "package.published", path }
  | { type: "run.succeeded", finished_at, duration_ms }
  | { type: "run.failed", finished_at, blockers }
  | { type: "run.cancelled", finished_at, reason }
```

All events are written to `runtime/logs/<run-id>/events.jsonl` (one JSON per line).

---

## 4. Transition Triggers

| From | To | Trigger |
|---|---|---|
| CREATED | PLANNING | `start()` called |
| PLANNING | RUNNING | plan validated |
| PLANNING | FAILED | plan-invalid blocker |
| RUNNING | BLOCKED | phase emitted blocker(s) |
| RUNNING | PUBLISHING | all phases succeeded |
| BLOCKED | RECOVERING | recovery strategy invokable + budget remaining |
| BLOCKED | FAILED | unrecoverable OR strategy `stop-and-report` |
| BLOCKED | CANCELLED | user cancel |
| RECOVERING | RUNNING | retry succeeded |
| RECOVERING | FAILED | recovery exhausted |
| PUBLISHING | SUCCEEDED | all targets written + manifest signed |
| PUBLISHING | FAILED | publish error (very rare; usually FS-level) |

---

## 5. Persistence

The orchestrator persists state on every transition:

```
runtime/active-executions/<run-id>/
├── run.meta.json          ← created at CREATED, never edited
├── workflow.frozen.json   ← frozen workflow definition
├── run.state.json         ← current state, updated on transition
├── run.blockers.json      ← active blockers when BLOCKED
└── ...phase folders
```

`run.state.json`:

```json
{
  "state": "RUNNING",
  "last_transition_at": "2026-04-30T09:35:01Z",
  "phases": {
    "01-input": "succeeded",
    "02-analysis": "running",
    "03-generation": "pending",
    "04-validation": "pending",
    "05-verification": "pending",
    "06-publish": "pending"
  },
  "retries": { "02-analysis": 0 }
}
```

---

## 6. Resume Semantics

A run is resumable iff:
- Latest persisted state is `BLOCKED` or `RECOVERING`
- Frozen workflow + registries match the originals (or compatibility flag set)
- `runtime/checkpoints/<run-id>/` has a checkpoint covering the last completed phase

`SUCCEEDED`, `FAILED`, `CANCELLED` are terminal — they cannot be resumed; the user starts a new run.

---

## 7. Cancellation

User-initiated cancellation:

```
1. orchestrator receives cancel signal
2. propagates cancel to all in-flight phase runners
3. waits for grace period
4. transitions to CANCELLED
5. retains runtime/<run-id>/ for inspection
```

---

## 8. Time Budget

Each run has a hard wall-clock budget:

```
default: 2 hours
override: workflow.hard_timeout_seconds
```

Exceeding the budget → BLOCKED with kind `recovery_exhausted` → FAILED.

---

## 9. Reporting Hooks

When transitioning to `SUCCEEDED` or `FAILED`, the orchestrator triggers reporting-mcp:

- SUCCEEDED → write `output/<package>/REPORT.md` with full timeline
- FAILED → write `runtime/.../REPORT.md` with blockers + advice

The transition does not complete until the report is written; this guarantees every terminal run has a human-readable artifact.

---

## 10. Boundaries

The lifecycle is owned by the execution engine. Phase runners do NOT transition the run state — they only return PhaseRunResult, and the engine performs the transition based on the result.
