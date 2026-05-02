# Execution State Manager

> **Module:** `core/orchestrator/execution-engine/execution-state-manager`
> **Purpose:** maintain the in-memory + on-disk state of a run and ensure consistency across phase boundaries.

While the lifecycle (`execution-lifecycle.md`) defines transitions, the state manager is the actual store. It guarantees that two phase runners observing state see consistent values.

---

## 1. State Model

```ts
type ExecutionState = {
  run_id: string
  workflow_id: string
  state: LifecycleState                 // see execution-lifecycle.md §2
  phases: Record<phase_id, PhaseStatus>
  retries: Record<phase_id, number>
  blockers: Blocker[]
  produced: ProducedFile[]              // accumulated across all phases
  evidence_coverage_so_far: number      // computed from latest matrix
  events_log: string                    // path to runtime/logs/<run-id>/events.jsonl
  started_at: string
  last_transition_at: string
}

type PhaseStatus = "pending" | "running" | "succeeded" | "failed" | "skipped"
```

---

## 2. Persistence

The state is persisted on every mutation:

```
runtime/active-executions/<run-id>/run.state.json
```

Atomic write: write to `run.state.json.tmp`, fsync, rename. This guarantees a crash mid-write doesn't leave a partial file.

---

## 3. Mutations

Only the orchestrator mutates state. The phase runner returns results; the engine applies the mutation.

```ts
interface ExecutionStateManager {
  init(run_id, workflow_id): ExecutionState
  load(run_id): ExecutionState                  // from disk
  setPhaseStatus(phase_id, status: PhaseStatus): void
  recordRetry(phase_id): void
  addBlocker(b: Blocker): void
  clearBlockers(phase_id?): void
  appendProduced(files: ProducedFile[]): void
  updateCoverage(value: number): void
  transition(to: LifecycleState): void
  snapshot(): ExecutionState
  flush(): void                                 // persist to disk
}
```

`flush()` is called at every meaningful boundary: phase end, recovery start, transition, publish.

---

## 4. Snapshot vs. Live State

The engine reads state via `snapshot()` — an immutable copy. Phase runners receive snapshots; they never see live state. Mutations from one phase runner do not race with another's read.

When the engine writes mutations, it serializes them through a single mutex; on-disk persistence happens atomically.

---

## 5. Concurrent Phase Coordination

When two phase runners run in parallel:

- Both read the same `snapshot` at start.
- Each independently produces a `PhaseRunResult`.
- The engine applies mutations sequentially: `setPhaseStatus(A, succeeded); setPhaseStatus(B, succeeded);`
- Each mutation triggers a `flush()`.

There is no shared mutable structure between concurrent phase runners. They communicate through files in their own scoped_dirs and through the engine's serialized state mutations.

---

## 6. Recovery and State

When a phase fails and retry is decided:

```
recordRetry(phase_id)
clearBlockers(phase_id)            # clear stale blockers from prior attempt
setPhaseStatus(phase_id, "running")
flush()
```

When recovery exhausts:

```
setPhaseStatus(phase_id, "failed")
addBlocker(...)
transition("FAILED")
flush()
```

---

## 7. Resume Semantics

On resume:

```
state = load(run_id)
if state.state in (FAILED, SUCCEEDED, CANCELLED) → refuse resume
identify next pending phase via DAG + state.phases
re-bind inputs (idempotent)
schedule remaining phases
```

State is the source of truth for "what's done." Re-derivation from filesystem is a fallback only, used to detect drift.

---

## 8. Drift Detection

At every transition, the state manager validates:

- Every phase listed `succeeded` has its `required_outputs` present on disk.
- Every produced file in `state.produced` exists.
- Every cumulative checkpoint exists.

A mismatch (e.g., succeeded phase whose output files disappeared) triggers `state-drift` blocker — usually means manual tampering with `runtime/`. The engine refuses to continue.

---

## 9. Read-Only Views for Agents

Agents receive a read-only view of state via the invocation context:

```ts
type AgentStateView = {
  run_id, feature, system, workflow_id
  phase_id
  produced_so_far: { phase_id, path, kind }[]
  retry: { attempt, alteration? }
  shared_inputs: { kind, path, contract, version, checksum }[]
}
```

Agents do NOT see other phases' raw content. They access their declared inputs via `produced_so_far` paths, which reference files they're authorized to read.

---

## 10. Events as a Derived Log

Every state transition emits an event (`runtime/logs/<run-id>/events.jsonl`). The events log is APPEND-ONLY and is the canonical history.

If `run.state.json` is corrupted or lost, the engine can rebuild state from events (last-event-wins semantics per phase).

---

## 11. Garbage Collection

After a run reaches a terminal state and its package is published, the orchestrator may garbage-collect:

```
default retention: 7 days for runtime/active-executions/<run-id>/
                   30 days for runtime/checkpoints/<run-id>/
                   30 days for runtime/logs/<run-id>/
overrides: per-system or per-workflow
```

GC is opt-in via a separate command; the engine never deletes by itself.

---

## 12. Boundaries

The state manager DOES NOT:
- Run phases
- Decide retry strategies
- Modify the workflow definition
- Promote artifacts

It records and serves state. Everything else asks it for snapshots and submits mutations.
