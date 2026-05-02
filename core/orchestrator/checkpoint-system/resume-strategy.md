# Resume Strategy

> **Module:** `core/orchestrator/checkpoint-system/resume-strategy`
> **Purpose:** decide whether and how to resume a previously interrupted run.

The resume strategy is the planner that consults the checkpoint manager and execution state, then either:

1. Plans a continuation, or
2. Refuses with a specific reason.

It does not run anything. It produces a plan the orchestrator executes.

---

## 1. Inputs

```ts
type ResumeRequest = {
  run_id: string
  user_intent: "auto" | "from-phase" | "from-latest"
  options: {
    allow_registry_drift?: boolean
    allow_workflow_drift?: boolean
    target_phase?: phase_id              // for "from-phase"
  }
}
```

---

## 2. Outputs

```ts
type ResumePlan = {
  resumable: boolean
  reason?: string
  start_from_phase?: phase_id
  skip_phases?: phase_id[]
  rerun_phases?: phase_id[]              // phases that succeeded but must be redone (rare)
  carried_artifacts?: ProducedFile[]     // already-produced files that stay valid
  retry_budget_remaining?: { total: number, per_phase: Record<phase_id, number> }
  warnings?: string[]                    // surfaces things the user should know
}
```

---

## 3. Algorithm

```
1. Load run.state.json
2. Load workflow.frozen.json
3. Compute current registries snapshot

4. CHECK: state ∈ {SUCCEEDED, FAILED, CANCELLED} → not resumable: terminal
5. CHECK: state ∈ {BLOCKED, RECOVERING, RUNNING}
   - BLOCKED with unrecoverable blocker → not resumable
   - RUNNING (engine crashed mid-phase) → resumable; restart that phase
   - BLOCKED/RECOVERING → resumable

6. Find latest valid checkpoint:
   ckpt = checkpoint_manager.latest(run_id)
   if ckpt is null → "no checkpoint; can only restart from beginning"

7. Validate checkpoint:
   result = checkpoint_manager.validate(ckpt)
   if signature failure → not resumable: tampered
   if workflow drift → not resumable unless allow_workflow_drift
   if registry drift → not resumable unless allow_registry_drift
   if produced drift → not resumable: filesystem tampered

8. Compute plan:
   skip_phases = ckpt.state.phases where status == "succeeded"
   start_from_phase =
       if RUNNING → the running phase (restart it)
       else → next_phase_id from checkpoint
   carried_artifacts = ckpt.produced (only those still valid)
   retry_budget_remaining = workflow.max_total_retries - sum(state.retries.values())

9. Emit warnings for:
   - phases skipped due to checkpoint
   - retry budget low
   - hot checkpoint (partial progress retained)
```

---

## 4. Resume Modes

### Mode `auto`
Engine decides. Latest valid checkpoint → plan continuation.

### Mode `from-phase`
User specifies `target_phase`. Strategy validates:
- Target phase exists in DAG
- All phases that target depends on have valid produced state (either succeeded or has artifacts on disk)

If valid → start_from_phase = target.

### Mode `from-latest`
User confirms "latest." Equivalent to `auto` but requires explicit acknowledgment in non-interactive contexts.

---

## 5. Refusal Reasons

| Reason | When |
|---|---|
| `terminal-state` | Run already completed/failed/cancelled |
| `no-checkpoint` | No checkpoint written yet (run failed before first boundary) |
| `checkpoint-tampered` | Signature mismatch |
| `workflow-changed` | workflow.frozen.json checksum drift |
| `registry-drift` | Agent/MCP/validator/gate version changed |
| `produced-drift` | A produced file was modified/deleted |
| `unrecoverable-blocker` | The blocker that stopped the run cannot be resolved by retry |
| `target-phase-unreachable` | from-phase mode with invalid target |

Each refusal includes a remediation hint:

```
"checkpoint-tampered: the saved state has been modified; start a fresh run with the same input."
"workflow-changed: workflow definition has been edited; either revert or start fresh."
"registry-drift: agent X has been upgraded since this run; rerun with --allow-registry-drift to accept potential differences, or pin the prior agent version."
```

---

## 6. Restart from RUNNING State

When the engine crashed mid-phase, the run.state.json shows a phase as "running." On resume:

```
The phase's scoped_dir may have partial output.
Strategy:
  1. Wipe that phase's scoped_dir
  2. Restart the phase from scratch
  3. Continue from there
```

This is safe because phases are required to be idempotent (R-X-05).

---

## 7. Hot Checkpoint Resumption

If a phase emits hot checkpoints AND the agent declares `supports_hot_resume: true`:

```
Strategy:
  1. Load latest hot checkpoint
  2. Compute progress.last_marker
  3. Pass marker to agent invocation context
  4. Agent skips already-processed items
```

If the agent doesn't support hot resume, the hot checkpoint is discarded; phase restarts from scratch.

---

## 8. Edge Cases

### Checkpoint missing files
A produced file is missing from disk → `produced-drift`. No partial repair; either re-run from beginning or accept the drift via flag (rarely useful).

### Multiple latest candidates
Should not happen (phase_id is unique per run), but if it does, the strategy picks the highest `created_at` and emits a warning.

### Registry semver-compatible drift
A minor version bump (registry agents at v1.4 instead of v1.3) is treated as drift requiring override. We do not assume semver compatibility for agents, since prompt-level changes can affect outputs.

---

## 9. Resume Plan Validation

Before executing the plan, the orchestrator validates:

- All `carried_artifacts` paths still exist with their checksums
- `start_from_phase` is in the DAG and reachable from the carried set
- `skip_phases` is a strict subset of completed phases

If validation fails between plan and execution (race condition: someone touched a file), the engine refuses to resume and reports.

---

## 10. User Output

A successful resume plan emits to the user:

```
Resume plan for run business-flow-checkout-20260430T093312Z:
  Skipping (succeeded):  01-input, 02-analysis, 03-generation
  Restarting from:       04-validation
  Carried artifacts:     8 files (~245 KB)
  Retry budget:          5/6 remaining
  Warnings:              none

Continue? [Y/n]
```

In auto mode, the prompt is shown once; subsequent runs in CI may use `--no-prompt`.

---

## 11. Boundaries

The resume strategy DOES NOT:
- Modify checkpoints
- Mutate runtime state
- Run phases
- Promote artifacts

It plans. The orchestrator + execution-engine + phase-runner execute the plan.
