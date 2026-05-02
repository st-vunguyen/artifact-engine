# Retry Engine

> **Module:** `core/orchestrator/execution-engine/retry-engine`
> **Purpose:** apply declared recovery strategies to failed phases, deterministically.

The retry engine is invoked when a phase fails. It chooses an action from the workflow's `recovery_strategies` map, executes it, and returns either "retry succeeded" or "exhausted."

---

## 1. Strategies

```ts
type Strategy =
  | { kind: "stop-and-report" }
  | { kind: "retry-up-to-n", n: number, backoff?: BackoffSpec }
  | { kind: "retry-with-backoff", max: number, base_seconds: number, factor?: number }
  | { kind: "retry-with-altered-prompt", n: number, alteration: PromptAlteration }
  | { kind: "fall-back-to-phase", phase_id: string }
  | { kind: "ask-user", prompt: string }
  | { kind: "skip-phase", justification: string }      // ALLOWED only on optional phases

type BackoffSpec = { base_seconds: number, factor: number, jitter: boolean }
type PromptAlteration =
  | { kind: "smaller-batch" }              // ask agent to do less per pass
  | { kind: "stricter-evidence" }          // raise the bar
  | { kind: "request-disambiguation" }     // surface gaps explicitly
```

---

## 2. Strategy Selection

Failure kind → strategy:

```ts
function chooseStrategy(failure_kind, workflow): Strategy {
  return workflow.recovery_strategies[failure_kind]
      ?? defaultFor(failure_kind)
}
```

Defaults (per `execution-rules.md` §4):

| Failure kind | Default |
|---|---|
| `validation_failed` | `stop-and-report` |
| `agent_error` | `retry-up-to-n` (n=2) |
| `missing_input` | `stop-and-report` |
| `mcp_unavailable` | `retry-with-backoff` (max=3, base=10s) |
| `gate_failed` | `stop-and-report` |
| `recovery_exhausted` | `stop-and-report` (terminal) |
| `agent_timeout` | `retry-up-to-n` (n=1) |

---

## 3. Execution

```
function execute(strategy, task, state): RetryResult {
  switch strategy.kind:
    case "stop-and-report":
        return { decision: "fail", reason: "strategy=stop-and-report" }
    case "retry-up-to-n":
        if state.retries[task.id] < strategy.n:
            wait(strategy.backoff?)
            re-run phase
            return { decision: "retry", attempt: state.retries[task.id] + 1 }
        return { decision: "fail", reason: "retries exhausted" }
    case "retry-with-backoff":
        if state.retries[task.id] < strategy.max:
            delay = strategy.base_seconds * (strategy.factor ?? 2) ** state.retries[task.id]
            wait(delay)
            re-run phase
            return { decision: "retry", ... }
        return { decision: "fail", ... }
    case "retry-with-altered-prompt":
        if state.retries[task.id] < strategy.n:
            re-run phase with alteration applied to invocation context
            return { decision: "retry", ... }
        return { decision: "fail", ... }
    case "fall-back-to-phase":
        run alternate phase declared in workflow
        return { decision: "fallback", target: strategy.phase_id }
    case "ask-user":
        emit ask-user event with prompt
        wait for response
        if user-resume → re-run with possibly augmented inputs
        if user-cancel → { decision: "fail", reason: "user cancelled" }
    case "skip-phase":
        if !task.optional → reject (cannot skip required phases)
        else → mark phase skipped, advance
}
```

---

## 4. Determinism

Given the same `(failure_kind, retry_count, workflow.recovery_strategies)`, the retry engine takes the same path. The randomness only enters via `BackoffSpec.jitter`, which is bounded and recorded in the events log.

---

## 5. Retry Budgets

Per-phase budget:

```
default: 2 retries per phase
override: phase.max_retries
```

Per-run budget:

```
default: 6 retries total across all phases
override: workflow.max_total_retries
```

When per-run budget is exhausted, even retry-eligible phases stop retrying — the engine transitions to FAILED.

---

## 6. Altered Prompt Mechanics

For `retry-with-altered-prompt`, the engine doesn't show the agent the failure output. Instead it injects a hint into the agent's invocation context:

```
context.retry = {
  attempt: 2,
  alteration: { kind: "stricter-evidence" }
}
```

The agent's prompt template handles the alteration. Examples:

- `smaller-batch` → "Process at most 10 items this pass; produce partials."
- `stricter-evidence` → "Refuse to emit any claim without ≥2 citations."
- `request-disambiguation` → "Where the source is ambiguous, emit a Gap entry instead of a claim."

Alterations are pure prompt-level. They never modify the workflow definition.

---

## 7. Fall-back Mechanics

Some workflows define a `fall-back-to-phase` strategy: if a high-fidelity analysis phase fails, run a lower-fidelity heuristic instead.

```yaml
recovery_strategies:
  agent_error_in_03_advanced_extraction:
    kind: fall-back-to-phase
    phase_id: 03_basic_extraction
```

The fallback phase's outputs are tagged so downstream consumers know they're operating on heuristic data. Verification gate may downgrade verdict to `conditional-pass`.

---

## 8. Ask-User Mechanics

`ask-user` produces an interactive prompt. In CI / non-interactive contexts, this is treated as `stop-and-report`.

Prompt:

```ts
type AskUserPrompt = {
  question: string
  context: { failed_phase, blocker_summary }
  options: string[]                         // structured choices
  default?: string
  expected_artifact?: string                // user can drop a file in input/ to resume
}
```

---

## 9. Failure Classification

The retry engine receives a typed failure kind from the phase runner. Classification rules:

| Phase result | Kind |
|---|---|
| Validator returns `status=fail` for ≥1 finding | `validation_failed` |
| Gate returns `status=fail` | `gate_failed` |
| Required output missing | `validation_failed` (kind: missing-output) |
| Agent process exited non-zero | `agent_error` |
| Agent timeout | `agent_timeout` |
| MCP server unreachable | `mcp_unavailable` |
| Plan invalid | `plan_invalid` (terminal) |

The classification is pure; given the phase result, kind is derivable.

---

## 10. Logging

Every retry decision is logged:

```
{ "type": "run.recovery_started", "phase_id", "kind", "strategy", "attempt": 2, "alteration?": ... }
{ "type": "run.recovery_completed", "phase_id", "outcome": "succeeded|failed" }
```

Reporting-mcp surfaces a "Recovery Timeline" section in REPORT.md when retries occurred.

---

## 11. Anti-Patterns

| Pattern | Why bad |
|---|---|
| Infinite retries | Budgets prevent this. |
| Retrying a `stop-and-report` failure (validation_failed) | Validators failing means the artifact is wrong; retrying without intervention reproduces the wrong artifact. |
| Hiding retries from the report | Hides drift. Always surface in REPORT.md. |
| Auto-skipping required phases | Phases marked optional may be skipped; required phases never. |

---

## 12. Boundaries

The retry engine DOES NOT:
- Modify workflows
- Modify artifacts
- Decide independently when to give up (the strategy declares the budget)
- Communicate directly with users (it emits ask-user events; the CLI / orchestrator front-end handles the interaction)
