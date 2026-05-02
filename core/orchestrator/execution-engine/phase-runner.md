# Phase Runner

> **Module:** `core/orchestrator/execution-engine/phase-runner`
> **Purpose:** execute one phase of a workflow plan — invoke agent / validators / gates, collect outputs, write events.

The phase runner is the unit of execution. It runs ONE TaskNode at a time. The execution engine schedules many phase runners (in parallel where the DAG allows).

---

## 1. Inputs

```ts
type PhaseRunInput = {
  task: TaskNode                     // from execution-mapping
  plan: ExecutionPlan
  state: ExecutionState              // shared across phases of a run
  agent_runtime: AgentRuntime        // factory for agent invocations
  mcp_pool: McpPool                  // pre-launched MCP servers
}
```

---

## 2. Outputs

```ts
type PhaseRunResult = {
  task_id: string
  status: "succeeded" | "failed" | "skipped"
  duration_ms: number
  produced: ProducedFile[]
  validators: ValidatorResult[]
  gates: GateResult[]
  blockers: Blocker[]
  retries_attempted: number
  exit_reason: string
}
```

---

## 3. Lifecycle of One Phase

```
PHASE BEGIN
  emit phase.started event
  ensure scoped_dir exists, empty (idempotent re-run wipes prior phase output)
  bind read-only inputs

EXECUTE
  if kind == "agent-run":
      launch agent with skills + mcp + inputs
      stream stdout/stderr → runtime/logs/<run-id>/<phase-id>.log
      wait for agent exit (or timeout)
  if kind == "validators-run":
      run each validator over scoped_dir + bound inputs
  if kind == "gates-run":
      run each gate over scoped_dir + cumulative state
  if kind == "publish":
      promote artifacts (orchestrator-internal)

POST-EXECUTE
  list produced files vs outputs_required
      if any required output missing → blocker(missing-required-output)
  run validators (if any are configured for this phase but not run above)
      collect validator results
  run gates (if any)
      collect gate results
  if any blocker:
      decide retry or fail (per recovery_strategies)
      if retry → loop with retry counter; if exhausted → fail

CHECKPOINT
  if task.checkpoint_after:
      write checkpoint per checkpoint-format.md

EMIT
  phase.completed | phase.failed event
  return PhaseRunResult
```

---

## 4. Agent Invocation

The phase runner does not embed agent logic. It hands the agent a structured environment:

```ts
type AgentInvocation = {
  agent_id: string
  agent_def: string                  // contents of <agent>.agent.md
  skills: SkillDef[]                 // resolved skill packs
  mcp_handles: McpHandle[]           // pre-connected MCP servers
  inputs: { [name: string]: ResolvedInput }
  scoped_dir: string                 // where to write
  context: { run_id, phase_id, feature, system }
  timeout_seconds: number
}
```

The agent runtime (Claude / cli wrapper) is pluggable. The phase runner only needs:
- `runtime.invoke(invocation): Promise<AgentExitInfo>`
- `runtime.cancel(handle): void`

This abstraction means swapping models or runtimes does not require changes to the phase runner.

---

## 5. Stdout / Stderr Capture

Agent stdout is captured into `runtime/logs/<run-id>/<phase-id>.log` (raw stream). Structured progress events emitted by the agent (one JSON per line in stdout, prefixed with `@@event ` ) are extracted into `runtime/logs/<run-id>/events.jsonl`.

Agents communicate state via files; stdout is for observability only.

---

## 6. Validator Execution

For each validator in `task.validators`:

```
1. Identify input scope (artifacts in scoped_dir + cumulatively-produced)
2. Run validator (as MCP tool or in-process module)
3. Receive ValidatorResult { id, status, findings[] }
4. Persist to runtime/.../<phase-id>/validators/<validator-id>.json
```

Failing validator → blocker.

Validators are read-only; they do not modify artifacts.

---

## 7. Gate Execution

Gates run AFTER validators (gates often depend on validator output):

```
1. Each gate reads its config + the scoped_dir + cumulative artifacts
2. Gate computes pass/fail with detail
3. Gate result → runtime/.../<phase-id>/gates/<gate-id>.json
```

Failing gate → blocker. Per `execution-rules.md` R-X-10, no skip.

---

## 8. Retry Behavior

If the recovery strategy for the failure kind says "retry-up-to-N":

```
clear scoped_dir
re-bind inputs (idempotent)
re-invoke agent / validators
keep counter
if counter == N → blocker(recovery_exhausted)
```

Between retries, the agent receives a `retry: true` flag in its invocation context so it can adjust strategy (e.g., emit smaller artifacts, request more evidence). It does NOT receive the prior failure's content as a "fix this" prompt — that creates feedback loops; instead the agent re-does its job from scratch with knowledge that it failed.

---

## 9. Timeout Handling

If the agent runtime exceeds `timeout_seconds`:

```
1. Issue cancel
2. Wait grace period (5s default)
3. Force-kill if still alive
4. Mark phase failed with kind=agent-error
5. Apply recovery strategy
```

---

## 10. Idempotent Re-run

Re-running a phase wipes its `scoped_dir` first, then re-binds inputs. This guarantees a clean slate.

The phase runner does NOT preserve partial progress across retries by default. (The checkpoint system preserves progress across run-level boundaries; phase-level retry restarts the phase.)

---

## 11. Concurrent Phase Execution

The execution engine may schedule multiple phase runners simultaneously (per the DAG). Each runs in its own working directory; there is no shared mutable state.

The orchestrator's only synchronization point is the post-phase write to `ExecutionState` (see `execution-state-manager.md`).

---

## 12. Boundaries

The phase runner DOES NOT:
- Decide what runs next (the engine does)
- Modify workflows or plans
- Touch other phases' scoped_dirs
- Promote artifacts to `output/` or `shared-artifacts/` (publish phase, owned by orchestrator)
- Write to `input/`

It runs one phase, captures everything, returns the result.
