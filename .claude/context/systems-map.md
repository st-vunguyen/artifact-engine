# Systems Map

> Quick reference: each system's role, inputs, outputs, agents, key rules.

---

## 1. business-flow-intelligence (foundational)

| | |
|---|---|
| **Role** | Spec → 17-section business model + state machine + preliminary risks + scenario seeds |
| **Inputs** | `input/specs/`, `input/requirements/`, `input/business-documents/` |
| **Outputs** | `shared-artifacts/business-flows/`, `state-machines/`, `risks/` (preliminary), `scenarios/<>.seed.json` |
| **Default workflow** | `business-flow-full-pipeline@1.0` |
| **Top agent** | `business-flow-generator` |
| **Verifier** | `business-flow-verifier` |
| **Key rule** | `business-flow-artifacts.md` (17 sections) |

## 2. system-intelligence

| | |
|---|---|
| **Role** | HLD/LLD/api-specs + BF → system graph + dependency map + boundaries |
| **Inputs** | `shared-artifacts/business-flows/`, `input/hld/`, `input/lld/`, `input/api-specs/` |
| **Outputs** | `shared-artifacts/system-graphs/`, `dependency-maps/` |
| **Default workflow** | `system-graph-pipeline@1.0` |
| **Top agent** | `system-graph-builder` |
| **Verifier** | `system-graph-verifier` |
| **Key rule** | `graph-integrity.md` |

## 3. risk-intelligence

| | |
|---|---|
| **Role** | Enrich preliminary risks with blast-radius + failure modes + mitigations |
| **Inputs** | `shared-artifacts/{business-flows,risks,system-graphs,dependency-maps,scenarios}` |
| **Outputs** | `shared-artifacts/risks/` (enriched, replaces preliminary) + `.blast-radius.json` + `.map.mmd` |
| **Default workflow** | `enrich-risks-pipeline@1.0` |
| **Agents** | `risk-detector`, `blast-radius-analyzer`, `failure-mode-enumerator`, `mitigation-generator` |
| **Verifier** | `risk-verifier` |
| **Key rule** | `risk-discipline.md` (severity matrix) |

## 4. test-strategy-intelligence (bridge)

| | |
|---|---|
| **Role** | Build the 7-section test strategy connecting analysis → execution |
| **Inputs** | `shared-artifacts/{business-flows,risks,system-graphs,scenarios,state-machines,dependency-maps}` |
| **Outputs** | `shared-artifacts/test-strategies/` |
| **Default workflow** | `test-strategy-pipeline@1.0` |
| **Agents** | `scope-analyzer`, `strategy-builder`, `risk-prioritizer`, `regression-planner`, `dod-builder` |
| **Verifier** | `strategy-verifier` |
| **Key rules** | `strategy-discipline.md`, `automation-thresholds.md`, `dod-discipline.md` |

## 5a. api-testing-intelligence

| | |
|---|---|
| **Role** | OpenAPI + upstream → 10-folder API test pack with per-status coverage |
| **Inputs** | `input/api-specs/`, `shared-artifacts/{business-flows,test-strategies,system-graphs,risks,scenarios,state-machines}` |
| **Outputs** | `shared-artifacts/api-analysis/`, `scenarios/<>.api.json`, `output/api-qc-packages/` |
| **Default workflow** | `api-test-full-pipeline@1.0` (4 phases: review/strategy → core pack → scenario packs → non-functional) |
| **Top agent** | `api-testing-qc` |
| **Verifier** | `api-report-verifier` |
| **Key rules** | `testing.md` (per-status rule), `api-design.md`, `verification-depth.md`, `reporting.md` |

## 5b. e2e-intelligence

| | |
|---|---|
| **Role** | UI flows + upstream → Playwright pack (strategy → scenarios → code → fixtures → execute) |
| **Inputs** | `input/ui-specs/`, `input/ui-flows/`, `shared-artifacts/{business-flows,test-strategies,state-machines,risks,scenarios,api-analysis(opt)}` |
| **Outputs** | `shared-artifacts/e2e-analysis/`, `scenarios/<>.e2e.json`, `output/e2e-packages/` |
| **Default workflow** | `e2e-full-pipeline@1.0` (5 phases) |
| **Top agent** | `automation-qc` |
| **Verifier** | `e2e-verifier` |
| **Key rules** | `e2e-automation.md`, `visual-regression.md`, `accessibility.md`, `responsive-design.md`, `failure-triage.md` |

## 6. regression-intelligence

| | |
|---|---|
| **Role** | Change input + upstream → prioritized regression set |
| **Inputs** | `shared-artifacts/{business-flows,system-graphs,dependency-maps,risks,api-analysis,e2e-analysis,scenarios.api,scenarios.e2e}`, `input/raw-imports/changes.<id>.md` |
| **Outputs** | `shared-artifacts/regression-analysis/`, `output/regression-packages/<>/<run-id>/` |
| **Default workflow** | `regression-analysis-pipeline@1.0` |
| **Agents** | `change-analyzer`, `impact-analyzer`, `regression-selector` |
| **Verifier** | `regression-verifier` |
| **Key rules** | `selection-rules.md`, `impact-discipline.md`, `budget-discipline.md` |

---

## Producer/consumer matrix (compact)

```
business-flow-intelligence ─► everyone
system-intelligence        ─► risk, test-strategy, api, e2e, regression
risk-intelligence          ─► test-strategy, api, e2e, regression
test-strategy-intelligence ─► api, e2e, regression
api-testing-intelligence   ─► e2e (touchpoints), regression
e2e-intelligence           ─► regression
regression-intelligence    ─► reporting only (no downstream system)
```

## See also

- [architecture-map.md](architecture-map.md)
- [artifact-map.md](artifact-map.md)
- [INTEROPERABILITY-STANDARD.md](../../INTEROPERABILITY-STANDARD.md)
