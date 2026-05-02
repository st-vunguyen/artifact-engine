# Execution Contract

> **Contract ID:** `execution-contract@1.0`
> **Purpose:** the runtime behavioral contract every phase must obey while being executed.

While `phase-contract.md` defines the shape of a phase definition, this contract defines what a phase *does* at runtime — its inputs, outputs, side-effects, and obligations.

---

## 1. The Runtime Promise

When the orchestrator invokes a phase, it guarantees:

1. The phase's `scoped_dir` exists and is empty.
2. All declared inputs are bound and readable.
3. All MCP servers in `mcp` are reachable.
4. All skills in `skills` are loaded.
5. The execution-sdk handle is bound to this phase.
6. `runtime/logs/<run-id>/<phase-id>.log` is open for stdout/stderr capture.
7. `timeout_seconds` enforced.

In return, the phase MUST:

1. Read only its declared inputs.
2. Write only into `scoped_dir`.
3. Produce all `required_outputs` by exit (or fail fast).
4. Emit progress events via `executionSdk.emit()`.
5. Be idempotent (re-running on identical input produces semantically equivalent output).
6. Honor cancellation by polling `ctx.cancelled`.
7. Exit zero on success, non-zero on failure.

---

## 2. Phase Inputs

```ts
type PhaseRuntimeInputs = {
  context: AgentStateView                  // run_id, phase_id, feature, system, retry, ...
  inputs: Record<name, ResolvedInput>      // bound from phase.inputs[]
  shared: ResolvedSharedRef[]              // bound from workflow.consumes_shared
  scoped_dir: string                       // runtime/.../<phase-id>/
  sdk: {
    artifact: ArtifactSdkHandle
    workflow: WorkflowSdkHandle
    validation: ValidationSdkHandle
    execution: ExecutionSdkHandle
    reporting: ReportingSdkHandle
  }
  mcp: McpHandle[]
  skills: SkillHandle[]
}
```

These are passed to the agent at invocation. The agent does not "import" them — they are part of the runtime context.

---

## 3. Phase Outputs

```ts
type PhaseRuntimeOutputs = {
  produced_files: ProducedFile[]           // automatic; computed from filesystem
  events_emitted: ProgressEvent[]
  validators_passed: ValidatorResult[]
  gate_results: GateResult[]
  exit_code: 0 | non-zero
  exit_reason?: string
}
```

The phase-runner extracts these from the agent's exit state and the filesystem.

---

## 4. Side-Effects: Allowed and Forbidden

| Side-effect | Allowed? |
|---|---|
| Write into `scoped_dir` | ✅ |
| Append to per-phase events log | ✅ |
| Call MCP servers in `mcp` | ✅ |
| Use registered skills | ✅ |
| Read declared inputs | ✅ |
| Write into other phases' `scoped_dir` | ❌ |
| Write into `input/` | ❌ |
| Write into `shared-artifacts/` directly | ❌ (orchestrator's job at publish) |
| Write into `output/` directly | ❌ |
| Modify `runtime/checkpoints/` | ❌ |
| Spawn arbitrary subprocesses | ❌ unless declared in workflow tool list |
| Make HTTP calls to non-MCP endpoints | ❌ unless explicitly whitelisted |

The phase runner enforces filesystem write permissions structurally (read-only mounts for inputs, write to scoped_dir only).

---

## 5. Idempotency

Re-running a phase on identical input MUST produce semantically equivalent output:

- Same set of files (same names, same kinds).
- Same claims, same evidence, same gaps, same contradictions.
- File ordering MAY differ (sorted later if needed).
- Timestamps MAY differ (excluded from semantic equivalence check).
- Internal IDs MUST be deterministic (use `executionSdk.deterministicId(...)`).

The traceability-validator detects idempotency violations across reruns.

---

## 6. Progress Events

```ts
type ProgressEvent =
  | { type: "phase.progress", marker: string }
  | { type: "agent.note", level, text }
  | { type: "agent.gap_detected", gap_id, topic }
  | { type: "agent.contradiction_detected", contradiction_id, topic }
  | { type: "agent.item_started", item_id }
  | { type: "agent.item_completed", item_id }
  | { type: "agent.item_failed", item_id, blocker }
  | { type: "agent.mcp_call", server, tool, duration_ms }
  | { type: "agent.skill_used", skill_id }
```

Events are advisory; the engine can run a phase without any (artifacts on disk are the truth). But events make execution observable.

---

## 7. Failure Reporting

When a phase fails, the agent SHOULD write:

```
runtime/.../<phase-id>/error.json
{
  "kind": "agent_error | agent_timeout | mcp_unavailable | runtime_error",
  "summary": "...",
  "detail": "...",
  "stack?": "...",
  "blockers?": [...]
}
```

The phase runner reads this on non-zero exit to populate the failure kind.

---

## 8. Required Output Discipline

When the phase exits, the runner scans `scoped_dir` against `phase.required_outputs`. Each glob MUST match ≥1 file. Missing → blocker.

The agent does not control whether the phase passes — the orchestrator decides based on outputs + gates. But the agent SHOULD self-check before exit:

```
const found = listProduced()
if (!matchesAllRequired(found, requiredOutputs)) {
  fail("missing-output", ...)
}
```

This catches problems earlier and produces clearer error.json.

---

## 9. Time and Resource Bounds

```
default phase timeout = 900 seconds
override = phase.timeout_seconds

default per-phase retries = 2
override = phase.max_retries

per-run total retries = 6
override = workflow.max_total_retries

per-run hard timeout = 7200 seconds (2 hours)
override = workflow.hard_timeout_seconds
```

Exceeding bounds → recovery engine invoked.

---

## 10. Cancellation Protocol

```
1. Orchestrator sets ctx.cancelled = true
2. Phase notices on next poll → wraps up artifacts in progress
3. Phase calls executionSdk.emit({ type: "phase.cancelling" })
4. Phase exits with exit_code = 130
5. If phase doesn't exit within 30 seconds → orchestrator force-kills
```

---

## 11. The Execution Promise — In One Paragraph

A phase, when invoked, receives bound inputs, scoped storage, MCP and skill handles, and an execution SDK. It produces files matching `required_outputs` inside `scoped_dir`, emits progress events, calls validators / MCPs as needed, and exits with a status. It does not touch other phases' state, does not call other systems, and does not promote its own work — that's the orchestrator's job. If interrupted, it saves what it can and exits cleanly. Re-running it on the same input yields semantically equivalent output.
