# RECOVERY-POLICY.md — Failure Handling

> Recovery is a first-class concern. The engine treats interruption as normal, not exceptional.

---

## Recovery strategies (catalog)

| Strategy | Use case | Idempotent | File |
|---|---|---|---|
| `stop-and-report` | Anything unrecoverable | yes | [core/orchestrator/recovery-system/failure-strategies.md](core/orchestrator/recovery-system/failure-strategies.md) |
| `retry-up-to-n` | Transient agent errors | yes | (same) |
| `retry-with-backoff` | MCP / network transient | yes | (same) |
| `retry-with-altered-prompt` | Agent quality issue (low coverage, paraphrase) | yes | (same) |
| `partial-recover` | Granular phases (item-level retry) | yes | [core/orchestrator/recovery-system/partial-recovery.md](core/orchestrator/recovery-system/partial-recovery.md) |
| `fall-back-to-phase` | High-fidelity phase fails → run alternate | yes | (same) |
| `ask-user` | Unrecoverable ambiguity | depends | (same) |
| `skip-phase` | Optional phases only | n/a | (same) |

---

## Default mapping (failure_kind → strategy)

| Failure kind | Default strategy |
|---|---|
| `validation_failed` | `stop-and-report` |
| `agent_error` | `retry-up-to-n` (n=2) |
| `agent_timeout` | `retry-up-to-n` (n=1) |
| `missing_input` | `stop-and-report` |
| `mcp_unavailable` | `retry-with-backoff` (max=3, base=10s) |
| `gate_failed` | `stop-and-report` |
| `recovery_exhausted` | `stop-and-report` (terminal) |
| `agent_low_coverage` | `retry-with-altered-prompt` (alteration: stricter-evidence) |
| `agent_paraphrase` | `retry-with-altered-prompt` (alteration: literal-quoting) |

Workflows override per-failure-kind.

---

## Retry budgets

```
default per-phase budget    = 2
default per-run budget      = 6
override                    = phase.max_retries / workflow.max_total_retries
```

When per-run budget exhausted: even retry-eligible phases stop retrying.

---

## Altered-prompt mechanics

The retry engine never shows the agent the previous failure's content (avoids feedback loops). Instead, it injects a hint into the agent's invocation context:

```ts
context.retry = {
  attempt: 2,
  alteration: { kind: "stricter-evidence" }
}
```

The agent's prompt template handles the alteration:
- `stricter-evidence` — "Refuse to emit any claim without ≥2 citations"
- `literal-quoting` — "Quote sources verbatim; no paraphrase"
- `smaller-batch` — "Process at most 10 items; produce partials"
- `request-disambiguation` — "Where source is ambiguous, emit Gap entry"

---

## Partial recovery

For phases declared `granular: true`:

```
1. Read per-item progress events
2. Quarantine failed items
3. Re-run the failed subset only
4. Merge with previously-succeeded items
```

See [core/orchestrator/recovery-system/partial-recovery.md](core/orchestrator/recovery-system/partial-recovery.md).

---

## Resume

A run is resumable iff:
- State ∈ {BLOCKED, RECOVERING, RUNNING (engine crashed)}
- Latest checkpoint passes integrity check
- Frozen workflow + registries match (or override flag set)

Resume reads the latest checkpoint and continues from the next pending phase.

See [core/orchestrator/checkpoint-system/resume-strategy.md](core/orchestrator/checkpoint-system/resume-strategy.md).

---

## Forbidden

- Infinite retries (budgets prevent this)
- Retrying validation_failed (the artifact is wrong; retrying without intervention reproduces it)
- Hiding retries from the report (always surfaced in REPORT.md)
- Auto-skipping required phases (only optional phases skip)
- Force flags / `--no-verify` / `--skip-gate`

---

## Telemetry

Every recovery decision logged:

```
{ "type": "run.recovery_started", "phase_id", "kind", "strategy", "attempt", "alteration?" }
{ "type": "run.recovery_completed", "phase_id", "outcome": "succeeded|failed" }
```

Reporting-mcp surfaces a "Recovery Timeline" section in REPORT.md.

---

## See also

- [core/orchestrator/recovery-system/recovery-engine.md](core/orchestrator/recovery-system/recovery-engine.md)
- [core/orchestrator/execution-engine/retry-engine.md](core/orchestrator/execution-engine/retry-engine.md)
- [docs/playbooks/recovery-playbook.md](docs/playbooks/recovery-playbook.md)
