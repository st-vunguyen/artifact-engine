# Recovery Engine

> **Module:** `core/orchestrator/recovery-system/recovery-engine`
> **Purpose:** drive recovery actions when phases or runs fail, integrating retry-engine, partial-recovery, and failure-strategies.

The recovery engine is the orchestrator's response to failure. It is invoked when a phase reports blockers; it picks an action, executes it, and reports back.

---

## 1. Position in the Engine

```
phase-runner reports failure
      ↓
recovery-engine consulted
      ↓
chooses one of:
  retry-engine (in-place retry)
  partial-recovery (salvage what passed; rerun what failed)
  failure-strategy (escalate / fall-back / stop)
```

---

## 2. Inputs

```ts
type RecoveryRequest = {
  run_id: string
  failed_phase_id: string
  blockers: Blocker[]
  attempt: number                              // current retry count for this phase
  state: ExecutionState                        // snapshot
  workflow: WorkflowDefinition
}
```

---

## 3. Outputs

```ts
type RecoveryDecision =
  | { kind: "retry-in-place", strategy: Strategy }
  | { kind: "partial-recover", plan: PartialRecoveryPlan }
  | { kind: "fall-back-to-phase", target: phase_id }
  | { kind: "ask-user", prompt: AskUserPrompt }
  | { kind: "stop-and-fail", reason: string }
```

---

## 4. Decision Algorithm

```
1. Classify failure_kind from blockers (per retry-engine §9)
2. Look up workflow.recovery_strategies[failure_kind]
3. Consult retry budget (per-phase, per-run)
4. Apply chooser:

   if budget remaining AND strategy is retry-* → retry-in-place
   else if blockers indicate "partial success" (some required outputs produced; some failed)
        AND workflow allows partial recovery → partial-recover
   else if strategy is fall-back-to-phase → fall-back-to-phase
   else if strategy is ask-user → ask-user
   else → stop-and-fail
```

The engine prefers in-place retry first; partial recovery is opted-in by workflow declaration; user prompts are last resort.

---

## 5. Coordination With Other Modules

| Decision | Delegated to |
|---|---|
| `retry-in-place` | retry-engine |
| `partial-recover` | partial-recovery |
| `fall-back-to-phase` | execution-engine (re-routes via DAG to alternate phase) |
| `ask-user` | orchestrator front-end (CLI / API surface) |
| `stop-and-fail` | execution-lifecycle transitions to FAILED |

---

## 6. Multi-Blocker Handling

When a phase has multiple blockers:

```
1. Classify each blocker; collect kinds
2. If any kind is unrecoverable (e.g., missing-input) → stop-and-fail
3. If all kinds are retryable → choose strategy for the most-severe kind
4. If kinds are mixed → choose stop-and-fail with multi-blocker context
```

This conservative policy avoids "lucky retry" for a side issue while a fundamental issue persists.

---

## 7. Retry Budget Coordination

```
retry_budget_remaining = state.retries[failed_phase_id] < phase.max_retries
                      AND sum(state.retries) < workflow.max_total_retries
```

If exhausted, the engine downgrades to non-retry strategies (partial-recover, fall-back, ask-user). If those are also unavailable → stop-and-fail.

---

## 8. Validation Gate Failures

Failures from validation gates are classified as `gate_failed`. The default strategy is `stop-and-report`. Workflows MAY declare `retry-with-altered-prompt` for `gate_failed` IF the gate failure mode is one the agent can address (e.g., low evidence coverage → ask agent to recite more evidence).

For structural gate failures (missing required outputs, schema invalid), retry rarely helps — they almost always require human intervention.

---

## 9. Error Compounding Detection

If retry-in-place is chosen and the same phase fails the same way two attempts in a row, the engine escalates:

```
attempt 1 failed: missing required output "business-flow.md"
attempt 2 failed: missing required output "business-flow.md"
→ escalate to stop-and-fail with reason "deterministic phase failure"
```

This prevents wasting budget on non-progressing retries.

---

## 10. User-Visible Output

When the engine chooses a recovery action, it logs and reports:

```
{ "type": "run.recovery_started",
  "phase_id": "02-analysis",
  "decision": "retry-in-place",
  "attempt": 2,
  "kind": "agent_error",
  "strategy": "retry-up-to-2"
}
```

REPORT.md (when written) includes a "Recovery Timeline" section summarizing all decisions.

---

## 11. Test Vectors

Each system contributes recovery test vectors:

```
{ "input": { "blockers": [...], "attempt": 0, "strategy_map": {...} },
  "expected": { "kind": "retry-in-place", ... } }
```

The recovery engine's decisions are deterministic and unit-testable.

---

## 12. Boundaries

The recovery engine DOES NOT:
- Run phases (it asks the execution engine to)
- Modify workflows
- Make ad-hoc decisions outside declared strategies
- Skip required phases
- Auto-pass failed gates
