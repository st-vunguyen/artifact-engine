# Recovery Policy (.claude binding)

> Pointer to the canonical policy in [RECOVERY-POLICY.md](../../RECOVERY-POLICY.md).

## Default failure → strategy mapping

| failure_kind | default strategy |
|---|---|
| `validation_failed` | stop-and-report |
| `agent_error` | retry-up-to-n (n=2) |
| `agent_timeout` | retry-up-to-n (n=1) |
| `missing_input` | stop-and-report |
| `mcp_unavailable` | retry-with-backoff (max=3, base=10s) |
| `gate_failed` | stop-and-report |
| `agent_low_coverage` | retry-with-altered-prompt (alteration: stricter-evidence) |
| `agent_paraphrase` | retry-with-altered-prompt (alteration: literal-quoting) |

## Retry budgets

```
per-phase   = 2 (override: phase.max_retries)
per-run     = 6 (override: workflow.max_total_retries)
```

## Resume eligibility

A run is resumable iff:
- State ∈ {BLOCKED, RECOVERING, RUNNING (engine crash)}
- Latest checkpoint passes integrity check
- Frozen workflow + registries match (or override flag set)

## Forbidden

- Infinite retries
- Retrying `validation_failed` without intervention
- Hiding retries from the report
- Auto-skipping required phases

## See also

- [RECOVERY-POLICY.md](../../RECOVERY-POLICY.md)
- [core/orchestrator/recovery-system/](../../core/orchestrator/recovery-system/)
- [docs/playbooks/recovery-playbook.md](../../docs/playbooks/recovery-playbook.md)
