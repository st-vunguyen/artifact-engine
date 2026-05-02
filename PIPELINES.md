# PIPELINES.md — Pipeline Index

> Every workflow available in the engine. Definitions are in `systems/<x>/pipelines/<name>.workflow.yaml`; this file is the index.

---

## Top-level orchestrator entry

The router's intent recognition (see [core/orchestrator/router/intent-router.md](core/orchestrator/router/intent-router.md)) maps user intent to one of:

```
intent: produce-business-flow      → business-flow-full-pipeline@1.0
intent: produce-system-graph       → system-graph-pipeline@1.0
intent: enrich-risks               → enrich-risks-pipeline@1.0
intent: produce-test-strategy      → test-strategy-pipeline@1.0
intent: produce-api-test-pack      → api-test-full-pipeline@1.0
intent: produce-e2e-pack           → e2e-full-pipeline@1.0
intent: run-regression             → regression-analysis-pipeline@1.0
intent: run-full-quality-suite     → chain (all of the above)
intent: verify-existing-artifact   → <system>-verify (verifier-only sub-workflow)
intent: resume-run                 → resume-strategy
```

---

## business-flow-intelligence

| Pipeline | When | File |
|---|---|---|
| `business-flow-full-pipeline@1.0` (default) | New feature spec; spec changes | [pipelines/full-business-flow-pipeline.md](systems/business-flow-intelligence/pipelines/full-business-flow-pipeline.md) |
| `analyze-spec-to-business-flow` | Phase 2 only (re-analysis with same intake) | (subset) |
| `mermaid-generation` | Phase 3 only | (subset) |
| `business-flow-verification` | Phase 5 only on existing artifacts | (subset) |

## system-intelligence

| Pipeline | File |
|---|---|
| `system-graph-pipeline@1.0` (default) | [pipelines/build-system-graph.workflow.yaml](systems/system-intelligence/pipelines/build-system-graph.workflow.yaml) |

## risk-intelligence

| Pipeline | File |
|---|---|
| `enrich-risks-pipeline@1.0` (default) | [pipelines/enrich-risks.workflow.yaml](systems/risk-intelligence/pipelines/enrich-risks.workflow.yaml) |

## test-strategy-intelligence

| Pipeline | File |
|---|---|
| `test-strategy-pipeline@1.0` (default) | [pipelines/build-test-strategy.workflow.yaml](systems/test-strategy-intelligence/pipelines/build-test-strategy.workflow.yaml) |

## api-testing-intelligence

| Pipeline | File |
|---|---|
| `api-test-full-pipeline@1.0` (default) | [pipelines/full-api-qc-pipeline.workflow.yaml](systems/api-testing-intelligence/pipelines/full-api-qc-pipeline.workflow.yaml) |

## e2e-intelligence

| Pipeline | File |
|---|---|
| `e2e-full-pipeline@1.0` (default) | [pipelines/full-e2e-pipeline.workflow.yaml](systems/e2e-intelligence/pipelines/full-e2e-pipeline.workflow.yaml) |

## regression-intelligence

| Pipeline | File |
|---|---|
| `regression-analysis-pipeline@1.0` (default) | [pipelines/run-regression-analysis.workflow.yaml](systems/regression-intelligence/pipelines/run-regression-analysis.workflow.yaml) |

---

## Phase composition (universal)

Every workflow phase is one of:
- `agent-run` — agent processes inputs → outputs
- `validators-run` — pure validator pass
- `gates-run` — apply validation gates
- `publish` — orchestrator promotes artifacts to shared/output

See [core/artifact-contracts/workflow-contracts/phase-contract.md](core/artifact-contracts/workflow-contracts/phase-contract.md).

---

## Common gates

Every workflow phase declares gates. Standard combinations:

| Phase kind | Typical gates |
|---|---|
| INPUT | `completeness-gate` |
| ANALYSIS | `completeness-gate`, `traceability-gate` |
| GENERATION | `completeness-gate`, `consistency-gate` |
| VALIDATION | `consistency-gate`, `quality-depth-gate` |
| VERIFICATION | `traceability-gate`, `quality-depth-gate` |
| PUBLISH | `consistency-gate` |

---

## Recovery profile (default)

```yaml
recovery_strategies:
  agent_error: { kind: retry-up-to-n, n: 2 }
  agent_timeout: { kind: retry-up-to-n, n: 1 }
  validation_failed: { kind: stop-and-report }
  gate_failed: { kind: stop-and-report }
  mcp_unavailable: { kind: retry-with-backoff, max: 3, base_seconds: 10 }
  agent_low_coverage: { kind: retry-with-altered-prompt, n: 2, alteration: { kind: stricter-evidence } }
```

Workflows MAY override per-failure-kind.

---

## Time profile (default)

| Phase kind | Typical | Hard cap |
|---|---|---|
| INPUT | 30–120s | 300s |
| ANALYSIS | 8–25 min | 30 min |
| GENERATION | 2–6 min | 10 min |
| VALIDATION | < 60s | 5 min |
| VERIFICATION | 3–10 min | 15 min |
| PUBLISH | < 10s | 60s |

Workflow hard timeout default: 2 hours.

---

## See also

- [WORKFLOWS.md](WORKFLOWS.md) — execution flows + chained pipelines
- [EXECUTION-LIFECYCLE.md](EXECUTION-LIFECYCLE.md) — run state machine
