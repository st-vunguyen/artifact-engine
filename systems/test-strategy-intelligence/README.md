# test-strategy-intelligence

> **Role:** the bridge between analysis and execution. Reads business-flow + system-graph + risks; outputs the test strategy that drives api-testing, e2e, and regression.
> **Position:** stage 4. Output is the input to all execution-side systems.

---

## What it produces

| Artifact | Path | Contract | Consumers |
|---|---|---|---|
| Test strategy | `shared-artifacts/test-strategies/<feature>.md` + `.json` | `test-strategy-contract@1.0` | api-testing, e2e, regression, reporting |
| System overview diagram | `shared-artifacts/test-strategies/<feature>.system-overview.mmd` | (visualization) | reporting |

---

## What it consumes

```
shared-artifacts/business-flows/<feature>.md      (required)
shared-artifacts/risks/<feature>.json             (required, enriched)
shared-artifacts/system-graphs/<feature>.json    (required)
shared-artifacts/state-machines/<feature>.json   (required)
shared-artifacts/scenarios/<feature>.seed.json   (required)
input/requirements/...                            (optional, for DoD)
```

---

## The 7-section test strategy

Following `core/artifact-contracts/intelligence-contracts/test-strategy-contract.md`:

1. General Purpose
2. System Overview Diagram
3. Scope & Objective (per-feature scope rows)
4. Testing Approach (per scope-area: levels/types, manual/auto/AI %, tools)
5. Risk & Mitigation (per risk: test mitigation + linked scenarios)
6. Dependencies (per dependency: status, blocking impact)
7. Definition of Done (measurable criteria)

This mirrors the System-Level Test Strategy template referenced in `docs/test-strategy/`.

---

## Canonical workflow

```
01-input        : load shared inputs
02-scope        : derive Scope rows from business-flow + system-graph
03-approach     : derive Testing Approach from scope + risks
04-risk-map     : project risks → test mitigation + scenario links
05-dod          : derive Definition of Done from requirements + DoD heuristics
06-compose      : assemble 7-section document + system overview Mermaid
07-validation   : schema + cross-artifact consistency
08-verification : evidence + coverage + measurability
09-publish      : promote
```

Pipeline: [pipelines/build-test-strategy.workflow.yaml](pipelines/build-test-strategy.workflow.yaml)

---

## Agents

| Agent | Purpose |
|---|---|
| [scope-analyzer](agents/scope-analyzer.agent.md) | Derive Scope & Objective rows |
| [strategy-builder](agents/strategy-builder.agent.md) | Derive Testing Approach rows + auto/manual/AI percentages |
| [risk-prioritizer](agents/risk-prioritizer.agent.md) | Project risks → Section 5 with test artifact links |
| [regression-planner](agents/regression-planner.agent.md) | Identify regression scope and frequency |
| [dod-builder](agents/dod-builder.agent.md) | Derive Definition of Done rows from requirements + DoD catalog |
| [strategy-verifier](agents/strategy-verifier.agent.md) | Verify the 7-section document conforms + coupling |

---

## Rules

| Rule | Discipline |
|---|---|
| [strategy-discipline](rules/strategy-discipline.md) | 7-section completeness; manual+auto+ai = 100; coverage requirements per priority |
| [automation-thresholds](rules/automation-thresholds.md) | Per-priority automation %; per-mode adjustments |
| [dod-discipline](rules/dod-discipline.md) | DoD criteria must be measurable + tied to artifacts |

---

## Modules

- `modules/scope-analysis/` — feature decomposition from BF + system graph
- `modules/strategy-builder/` — approach matrix construction
- `modules/risk-based-prioritization/` — risk → test priority mapping
- `modules/regression-planner/` — regression set definition
- `modules/automation-strategy/` — automation % decisioning per category

---

## Templates

`templates/test-strategy-template.md` — the 7-section markdown skeleton (mirrors the `docs/test-strategy/` template).

---

## Outputs

```
output/test-strategy-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 02-strategy/test-strategy.md
├── 02-strategy/test-strategy.json
├── 03-system-overview/<feature>.system-overview.mmd
├── 04-traceability/
└── 05-verification/
```

---

## Why this is critical

Without a test strategy, api-testing and e2e have no scope, priority, or DoD. They generate exhaustively (over-cover) or arbitrarily (under-cover). The strategy declares what's in/out of scope, what priority each scope is, and what "done" means — and downstream systems fill in the *executable* details.
