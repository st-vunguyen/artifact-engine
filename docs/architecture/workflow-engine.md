# Workflow Engine (Architecture)

> How workflows are loaded, planned, and executed.

## Components

```
intent-router → workflow-selector → execution-mapping → execution-engine → phase-runner
                                                                      ↘ recovery-engine
                                                                      ↘ checkpoint-manager
```

| Component | Role |
|---|---|
| [intent-router](../../core/orchestrator/router/intent-router.md) | Classify user intent → workflow candidate |
| [workflow-selector](../../core/orchestrator/router/workflow-selector.md) | Pick + freeze the workflow; resolve inputs/shared |
| [execution-mapping](../../core/orchestrator/router/execution-mapping.md) | Build execution plan (DAG of TaskNodes) |
| [workflow-parser](../../core/orchestrator/workflow-engine/workflow-parser.md) | YAML/JSON → typed WorkflowDefinition |
| [workflow-executor](../../core/orchestrator/workflow-engine/workflow-executor.md) | Drive end-to-end run |
| [workflow-state-machine](../../core/orchestrator/workflow-engine/workflow-state-machine.md) | Cross-workflow coordination |
| [phase-runner](../../core/orchestrator/execution-engine/phase-runner.md) | Run one phase |
| [retry-engine](../../core/orchestrator/execution-engine/retry-engine.md) | Apply recovery strategies |

## Workflow definition shape

See [core/artifact-contracts/workflow-contract.md](../../core/artifact-contracts/workflow-contract.md).

## Frozen-per-run

The orchestrator loads the workflow once at start, writes `runtime/.../workflow.frozen.json`, and never re-reads the source. Mid-run changes have no effect.

## See also

- [WORKFLOWS.md](../../WORKFLOWS.md)
- [PIPELINES.md](../../PIPELINES.md)
