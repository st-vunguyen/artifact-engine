# Workflow Executor

> **Module:** `core/orchestrator/workflow-engine/workflow-executor`
> **Purpose:** drive an entire workflow run end-to-end, coordinating selector → mapping → execution → recovery → publish.

The executor is the top-level run driver. The router decides which workflow; the selector freezes inputs; the mapping plans phases; the executor runs the plan, handles recovery, and publishes.

---

## 1. Interface

```ts
interface WorkflowExecutor {
  run(spec: RunRequest): RunResult
  resume(run_id: string, options?: ResumeOptions): RunResult
  cancel(run_id: string): void
}

type RunRequest = {
  intent: IntentRequest                    // from caller (CLI/API/watcher)
  options?: {
    dry_run?: boolean                      // plan but don't execute
    no_publish?: boolean                   // run but don't promote artifacts
    parallelism?: number                   // override default
  }
}

type RunResult = {
  run_id: string
  status: "succeeded" | "failed" | "cancelled" | "blocked"
  state: ExecutionState
  blockers: Blocker[]
  package_path?: string                    // if SUCCEEDED
  shared_published: { kind: string, path: string }[]
}
```

---

## 2. Run Lifecycle

```
1. Receive RunRequest
2. intent-router → RoutedIntent
3. workflow-selector → SelectedWorkflow
4. Freeze workflow → write runtime/.../workflow.frozen.json
5. execution-mapping → ExecutionPlan
6. Initialize state (ExecutionState in CREATED)
7. Transition to PLANNING; emit lifecycle event
8. Validate plan; transition to RUNNING

9. While there are pending phases:
     a. Schedule independent ready phases (up to parallelism)
     b. Phase runner executes each → PhaseRunResult
     c. Apply state mutations
     d. If phase blockers:
          → recovery-engine invoked
          → may retry, partial-recover, fall-back, or stop
     e. If phase succeeds & is in checkpoint_after:
          → checkpoint-manager.write(...)
     f. Emit progress events

10. When all phases done → transition to PUBLISHING
11. Promote artifacts to shared-artifacts/ + output/<package>/
12. Sign manifest
13. reporting-mcp generates REPORT.md
14. Transition to SUCCEEDED
15. Return RunResult
```

---

## 3. Resume Path

```
1. resume-strategy → ResumePlan
2. If not resumable → return failed RunResult with reason
3. Else:
     - Load frozen workflow
     - Re-derive plan from mapping (deterministic)
     - Skip phases already succeeded
     - Restart from start_from_phase
     - Continue main loop
```

---

## 4. Cancellation

```
cancel(run_id):
  state.transition(RUNNING → CANCELLED on next safe boundary)
  signal phase runners to wrap up
  wait grace period
  finalize with whatever's been produced (no publish)
```

---

## 5. Failure Path

```
1. Phase fails
2. Recovery-engine returns decision
3. If retry → re-schedule phase
4. If partial-recover → schedule subset rerun
5. If fall-back → re-route DAG to alternate phase
6. If ask-user → emit ask-user event; transition BLOCKED; return RunResult(blocked)
7. If stop-and-fail → transition FAILED; return RunResult(failed)
```

---

## 6. Concurrency

The executor schedules up to `parallelism` independent phases simultaneously. Default = `min(4, cpu_count)`. Per-phase concurrency (granular phases) is internal to the agent.

---

## 7. State Persistence

The executor:
- Calls `state.flush()` after every transition
- Triggers checkpoints per `workflow.checkpoint_after`
- Writes `runtime/.../REPORT.md` at terminal states
- Promotes published artifacts atomically (mode 0444 once promoted)

---

## 8. Boundary Events

The executor emits high-level events:

```
run.created
run.planning_started
run.planning_completed
run.started                    (transition to RUNNING)
run.checkpoint_written
run.recovery_started
run.publishing_started
run.succeeded | run.failed | run.cancelled
```

These flow into `runtime/logs/<run-id>/events.jsonl`.

---

## 9. Errors at the Executor Layer

The executor distinguishes:

- **PHASE failures** → handled by recovery
- **EXECUTOR failures** → bugs in orchestration; logged, run marked FAILED

Bugs do not silently degrade. The executor's job is to be uneventful — phases handle work, recovery handles failures, the executor coordinates.

---

## 10. Boundaries

The executor does NOT:
- Modify workflows mid-run
- Run phase logic itself (delegates to phase-runner)
- Modify artifacts (agents do; orchestrator promotes)
- Make user-facing decisions (ask-user is emitted; the front-end handles UX)

It coordinates. Everything specific is delegated.
