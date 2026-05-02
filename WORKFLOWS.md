# WORKFLOWS.md — Canonical Workflows of the Artifact Engine

> A workflow is a typed, declarative description of phases, validators, and gates. The orchestrator runs it. See [`core/artifact-contracts/workflow-contract.md`](core/artifact-contracts/workflow-contract.md).

---

## Per-system default workflows

| System | Workflow ID | Definition |
|---|---|---|
| business-flow-intelligence | `business-flow-full-pipeline@1.0` | [pipelines/full-business-flow-pipeline.workflow.yaml](systems/business-flow-intelligence/pipelines/full-business-flow-pipeline.workflow.yaml) |
| system-intelligence | `system-graph-pipeline@1.0` | [pipelines/build-system-graph.workflow.yaml](systems/system-intelligence/pipelines/build-system-graph.workflow.yaml) |
| risk-intelligence | `enrich-risks-pipeline@1.0` | [pipelines/enrich-risks.workflow.yaml](systems/risk-intelligence/pipelines/enrich-risks.workflow.yaml) |
| test-strategy-intelligence | `test-strategy-pipeline@1.0` | [pipelines/build-test-strategy.workflow.yaml](systems/test-strategy-intelligence/pipelines/build-test-strategy.workflow.yaml) |
| api-testing-intelligence | `api-test-full-pipeline@1.0` | [pipelines/full-api-qc-pipeline.workflow.yaml](systems/api-testing-intelligence/pipelines/full-api-qc-pipeline.workflow.yaml) |
| e2e-intelligence | `e2e-full-pipeline@1.0` | [pipelines/full-e2e-pipeline.workflow.yaml](systems/e2e-intelligence/pipelines/full-e2e-pipeline.workflow.yaml) |
| regression-intelligence | `regression-analysis-pipeline@1.0` | [pipelines/run-regression-analysis.workflow.yaml](systems/regression-intelligence/pipelines/run-regression-analysis.workflow.yaml) |

---

## The canonical end-to-end pipeline (chained workflows)

```
spec / requirements / HLD / LLD / OpenAPI / UI specs / UI flows
                            │
                            ▼
              business-flow-intelligence
                            │
        ┌───────────────────┴────────────────────┐
        ▼                                        ▼
business-flow.md                         risks (preliminary)
state-machine.json                       scenarios.seed.json
                                                 │
                            ┌────────────────────┴───────────────────┐
                            ▼                                        ▼
                  system-intelligence                       (waits for system-graph)
                            │                                        │
                            ▼                                        │
                   system-graph.json                                 │
                   dependency-map.json                               │
                            │                                        │
                            └──────────────┬─────────────────────────┘
                                           ▼
                                  risk-intelligence
                                           │
                                           ▼
                                  risks (enriched)
                                  blast-radius.json
                                           │
                                           ▼
                          test-strategy-intelligence
                                           │
                                           ▼
                                  test-strategy.md (7 sections)
                                           │
                       ┌───────────────────┴────────────────────┐
                       ▼                                        ▼
            api-testing-intelligence              e2e-intelligence
            (consumes OAS)                        (consumes UI flows)
                       │                                        │
                       ▼                                        ▼
            api-analysis + 10-folder pack        e2e-analysis + Playwright pack
                       │                                        │
                       └────────────────────┬───────────────────┘
                                            ▼
                                regression-intelligence
                                (when change input present)
                                            │
                                            ▼
                                regression-analysis
                                regression-set
```

---

## Execution stages (universal)

Every workflow runs these stages in order:

```
INPUT → ANALYSIS → GENERATION → VALIDATION → VERIFICATION → FINAL OUTPUT
```

Stage details: [docs/architecture/execution-lifecycle.md](docs/architecture/execution-lifecycle.md).

---

## Validation gates (applied in every workflow)

| Gate | Definition |
|---|---|
| `completeness-gate` | [core/orchestrator/validation-gates/completeness-gate.md](core/orchestrator/validation-gates/completeness-gate.md) |
| `consistency-gate` | [core/orchestrator/validation-gates/consistency-gate.md](core/orchestrator/validation-gates/consistency-gate.md) |
| `traceability-gate` | [core/orchestrator/validation-gates/traceability-gate.md](core/orchestrator/validation-gates/traceability-gate.md) |
| `quality-depth-gate` | [core/orchestrator/validation-gates/quality-depth-gate.md](core/orchestrator/validation-gates/quality-depth-gate.md) |

Gate output: pass / conditional-pass / fail. The orchestrator refuses to advance past `fail`.

---

## Recovery strategies

Per `core/artifact-contracts/workflow-contract.md`:

| Strategy | Use case |
|---|---|
| `stop-and-report` | Default for `validation_failed`, `gate_failed`, `missing_input`, `recovery_exhausted` |
| `retry-up-to-n` | `agent_error`, `agent_timeout` |
| `retry-with-backoff` | `mcp_unavailable` |
| `retry-with-altered-prompt` | Agent quality issue (low coverage, fabrication) |
| `partial-recover` | Granular phases (item-level retry) |
| `fall-back-to-phase` | High-fidelity phase fails → run alternate |
| `ask-user` | Unrecoverable ambiguity |
| `skip-phase` | Optional phases only |

Full catalog: [core/orchestrator/recovery-system/failure-strategies.md](core/orchestrator/recovery-system/failure-strategies.md).

---

## Execution modes

| Mode | Depth | Validation strictness |
|---|---|---|
| quick | Smoke + p0 only | Minimal |
| deep | All priorities | Standard |
| enterprise | All + non-functional | Maximum |
| regression | Targeted impacted scope | Standard |
| incident | Targeted failure path + adjacent | Maximum |

Mode is set in the workflow's frontmatter or via the router's intent.

---

## Single-workflow vs chained

- **Single-workflow run** — one of the per-system workflows. Useful for iterating on one system's output.
- **Chained run** — the orchestrator schedules multiple workflows in dependency order. Triggered when consumer artifacts are missing OR explicitly via `run-full-quality-suite`.

See [.claude/commands/run-full-quality-suite.md](.claude/commands/run-full-quality-suite.md).

---

## See also

- [PIPELINES.md](PIPELINES.md) — every per-system pipeline indexed
- [EXECUTION-LIFECYCLE.md](EXECUTION-LIFECYCLE.md) — run lifecycle states
- [VALIDATION-GOVERNANCE.md](VALIDATION-GOVERNANCE.md) — what gates check, why
- [RECOVERY-POLICY.md](RECOVERY-POLICY.md) — recovery strategies in depth
- [INTEROPERABILITY-STANDARD.md](INTEROPERABILITY-STANDARD.md) — cross-system handoff rules