# Workflow Standards

> Standards for authoring `*.workflow.yaml` files.

## Required structure

```yaml
workflow_id: <system>-<purpose>@<major>.<minor>
system: <system-id>
description: "<one-line>"
defaults: { default_timeout_seconds, hard_timeout_seconds, max_total_retries }
inputs: [Input[]]
consumes_shared: [SharedRef[]]
produces_shared: [SharedRef[]]
phases: [Phase[]]
checkpoint_after: [phase_id[]]
recovery_strategies: { failure_kind: Strategy }
```

Conform to [`core/artifact-contracts/workflow-contract.md`](../../core/artifact-contracts/workflow-contract.md).

## Phase IDs

- Zero-padded: `01-input`, `02-analysis`, ...
- Unique within workflow
- Slug-safe

## Required outputs

- Glob patterns relative to `runtime/.../<phase-id>/`
- Always declared explicitly (empty array for orchestrator phases is OK; explicit)
- Validated post-phase

## depends_on

- DAG (no cycles)
- References phases declared earlier in the file
- The orchestrator computes topological order; independent phases run in parallel

## Standard gate combinations

| Phase kind | Typical gates |
|---|---|
| INPUT | `completeness-gate` |
| ANALYSIS | `completeness-gate`, `traceability-gate` |
| GENERATION | `completeness-gate`, `consistency-gate` |
| VALIDATION | `consistency-gate`, `quality-depth-gate` |
| VERIFICATION | `traceability-gate`, `quality-depth-gate` |

## Recovery strategies (defaults)

```yaml
agent_error: { kind: retry-up-to-n, n: 2 }
agent_timeout: { kind: retry-up-to-n, n: 1 }
validation_failed: { kind: stop-and-report }
gate_failed: { kind: stop-and-report }
mcp_unavailable: { kind: retry-with-backoff, max: 3, base_seconds: 10 }
```

## Lint

`pnpm run lint:workflows` validates every `*.workflow.yaml`. Failures block PRs.

## See also

- [PIPELINES.md](../../PIPELINES.md)
- [core/artifact-contracts/workflow-contracts/phase-contract.md](../../core/artifact-contracts/workflow-contracts/phase-contract.md)
