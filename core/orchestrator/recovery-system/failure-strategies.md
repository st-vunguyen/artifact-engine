# Failure Strategies

> **Module:** `core/orchestrator/recovery-system/failure-strategies`
> **Purpose:** catalog of failure-handling strategies, each with semantics, applicability, and side-effects.

This document is the menu the recovery engine picks from. Workflows reference these strategies by id in their `recovery_strategies` map.

---

## 1. Strategy Catalog

| Strategy | Use case | Idempotent | Cost |
|---|---|---|---|
| `stop-and-report` | Anything unrecoverable; default for missing inputs, gate failures | yes | 0 |
| `retry-up-to-n` | Transient agent errors | yes | n × phase cost |
| `retry-with-backoff` | Resource transient failures (MCP unavailable) | yes | sum(backoff) + n × phase cost |
| `retry-with-altered-prompt` | Agent quality issue (low coverage, fabrication) | yes | n × phase cost |
| `partial-recover` | Granular phases, item-level failures | yes | failed-subset cost |
| `fall-back-to-phase` | High-fidelity phase fails; lower-fidelity exists | yes | alternate phase cost |
| `ask-user` | Ambiguity that needs human input | depends on user | unbounded |
| `skip-phase` | Optional phase that's allowed to be omitted | n/a | 0 |

---

## 2. `stop-and-report`

```yaml
{ kind: "stop-and-report" }
```

- Run transitions to FAILED.
- Blockers + reason recorded in `runtime/.../REPORT.md`.
- No retry attempted.

**When to choose:** validation gate failed, missing input, plan-invalid, recovery-exhausted, anything where retry would just re-discover the same problem.

**Anti-pattern:** using this for transient errors — you're throwing away work for an error that would clear on retry.

---

## 3. `retry-up-to-n`

```yaml
{ kind: "retry-up-to-n", n: 2, backoff: { base_seconds: 5, factor: 2 } }
```

- Phase rerun up to n times.
- Optional backoff between attempts.
- Per-phase budget consumed.

**When to choose:** transient agent errors (timeout, parse error, runtime hiccup).

**Anti-pattern:** using this for `gate_failed` — gates fail because content is wrong, not because the agent ran badly.

---

## 4. `retry-with-backoff`

```yaml
{ kind: "retry-with-backoff", max: 3, base_seconds: 10, factor: 2 }
```

- Same as retry-up-to-n but with mandatory exponential backoff.
- Used when failure is likely a resource issue.

**Schedule:** 10s, 20s, 40s, ...

**When to choose:** MCP server unreachable, network blips, transient FS errors.

---

## 5. `retry-with-altered-prompt`

```yaml
{ kind: "retry-with-altered-prompt", n: 2, alteration: { kind: "stricter-evidence" } }
```

- Phase reruns with a hint added to the agent's invocation context.
- Hint suggests an alternate strategy (smaller batch, stricter evidence, request disambiguation).

**When to choose:** agent's first attempt was on-topic but missed the bar (e.g., evidence coverage 0.78); a different prompt framing might recover.

**Anti-pattern:** using this for structural failures — altered prompts can't synthesize missing input files.

---

## 6. `partial-recover`

```yaml
{ kind: "partial-recover", retry_subset_budget: 1 }
```

- Salvage succeeded items; rerun failed items only.
- Requires `granular: true` on the phase.

**When to choose:** large fan-out phase where retrying everything is expensive.

**Restrictions:** items must be independent; per-item artifacts must have stable IDs (per `partial-recovery.md`).

---

## 7. `fall-back-to-phase`

```yaml
{ kind: "fall-back-to-phase", phase_id: "03_basic_extraction" }
```

- Replace the failing phase with an alternate phase.
- The alternate must be declared in the workflow.
- Downstream consumers may receive lower-fidelity inputs.

**When to choose:** hi-fidelity AI extraction fails; a deterministic heuristic alternate exists.

**Side-effect:** the verification verdict may downgrade to `conditional-pass` because the fallback used.

---

## 8. `ask-user`

```yaml
{ kind: "ask-user", prompt: "AI cannot resolve contradiction in source. Which is authoritative?" }
```

- Engine emits an ask-user event.
- Run pauses in BLOCKED state until user replies.
- In CI / non-interactive contexts, behaves as `stop-and-report`.

**When to choose:** unrecoverable ambiguity that only a stakeholder can resolve.

**Constraints:** prompt must be specific and actionable; default response policy must be clear.

---

## 9. `skip-phase`

```yaml
{ kind: "skip-phase", justification: "performance pack is opt-in for this feature" }
```

- Phase marked as skipped; downstream phases that depend on it must also be skipped or have alternate inputs.
- Allowed only on phases with `optional: true` in the workflow definition.

**Anti-pattern:** using this to hide a real failure — every skip surfaces in REPORT.md and is auditable.

---

## 10. Strategy Composition

Workflows can declare different strategies per failure_kind:

```yaml
recovery_strategies:
  agent_error: { kind: "retry-up-to-n", n: 2 }
  agent_timeout: { kind: "retry-up-to-n", n: 1 }
  validation_failed: { kind: "stop-and-report" }
  gate_failed: { kind: "stop-and-report" }
  mcp_unavailable: { kind: "retry-with-backoff", max: 3, base_seconds: 10 }
  agent_low_coverage: { kind: "retry-with-altered-prompt", n: 2, alteration: { kind: "stricter-evidence" } }
```

Per-phase overrides are allowed:

```yaml
phases:
  - id: 03-generation
    recovery_strategies:
      agent_error: { kind: "partial-recover" }
```

---

## 11. Strategy Authoring Guidance

When designing a workflow:

- Default `validation_failed` and `gate_failed` to `stop-and-report`.
- Default `agent_error` to `retry-up-to-n` with `n: 2`.
- Default `mcp_unavailable` to `retry-with-backoff`.
- Use `retry-with-altered-prompt` ONLY where you have a specific alteration that addresses the likely cause.
- Use `partial-recover` only on truly granular phases.
- Use `fall-back-to-phase` only when you have a real alternate phase, not as a way to skip work.
- Use `ask-user` sparingly; it's expensive in attention.

---

## 12. Logged Outcomes

Every strategy execution emits:

```
{
  "type": "strategy.applied",
  "strategy": "<kind>",
  "phase_id": "...",
  "outcome": "succeeded|failed",
  "attempt": <n>,
  "duration_ms": <n>,
  "context": { ... }
}
```

Reporting-mcp aggregates these into a "Recovery Timeline" section of REPORT.md.

---

## 13. Boundaries

Failure strategies are declarative — they describe *what to do*. The recovery engine decides *which* applies; the retry engine + partial-recovery + execution-engine *execute* them. Strategies themselves contain no executable logic.
