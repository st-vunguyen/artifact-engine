# Execution Lifecycle (Architecture)

> Run state machine summary. Full reference: [EXECUTION-LIFECYCLE.md](../../EXECUTION-LIFECYCLE.md).

## States

`CREATED → PLANNING → RUNNING → BLOCKED ↔ RECOVERING → PUBLISHING → SUCCEEDED | FAILED | CANCELLED`

## Phase status

`pending → running → succeeded | failed | skipped`

## Persistence per transition

```
runtime/active-executions/<run-id>/run.state.json
runtime/logs/<run-id>/events.jsonl   (append-only)
```

## Universal stages

Every workflow runs:
```
INPUT → ANALYSIS → GENERATION → VALIDATION → VERIFICATION → FINAL OUTPUT
```

## See also

- [core/orchestrator/execution-engine/execution-lifecycle.md](../../core/orchestrator/execution-engine/execution-lifecycle.md)
- [recovery-architecture.md](recovery-architecture.md)
