# Recovery Architecture

> How the engine handles failure. Full reference: [RECOVERY-POLICY.md](../../RECOVERY-POLICY.md).

## Components

```
phase-runner reports failure
      ↓
recovery-engine consulted
      ↓
chooses one of:
  retry-engine (in-place retry)
  partial-recovery (item-level subset rerun)
  failure-strategy (escalate / fall-back / stop)
```

## Strategies catalog

```
stop-and-report
retry-up-to-n
retry-with-backoff
retry-with-altered-prompt
partial-recover
fall-back-to-phase
ask-user
skip-phase
```

## Default mapping

| Failure | Default |
|---|---|
| `validation_failed` | stop-and-report |
| `agent_error` | retry-up-to-n (n=2) |
| `mcp_unavailable` | retry-with-backoff (3 attempts) |
| `gate_failed` | stop-and-report |

## Determinism

Given the same `(failure_kind, retry_count, workflow.recovery_strategies)`, the engine takes the same path every time.

## Resume

A run is resumable iff state ∈ {BLOCKED, RECOVERING, RUNNING (engine crash)} and the latest checkpoint passes integrity.

## See also

- [core/orchestrator/recovery-system/recovery-engine.md](../../core/orchestrator/recovery-system/recovery-engine.md)
- [core/orchestrator/checkpoint-system/resume-strategy.md](../../core/orchestrator/checkpoint-system/resume-strategy.md)
- [docs/playbooks/recovery-playbook.md](../playbooks/recovery-playbook.md)
