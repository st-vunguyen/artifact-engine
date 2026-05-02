# regression-intelligence

> **Role:** given a change (PR, commit, incident), compute impact and produce a prioritized regression set.
> **Position:** stage 6 (last). Consumes everything upstream + a change input.

---

## What it produces

| Artifact | Path | Contract | Consumers |
|---|---|---|---|
| Regression analysis | `shared-artifacts/regression-analysis/<feature>.md` + `.json` | `regression-contract@1.0` | api-testing (filters scenarios), e2e (filters journeys), reporting |
| Diff report | `shared-artifacts/regression-analysis/<feature>.diff.json` | (auxiliary) | reporting |

---

## What it consumes

```
shared-artifacts/business-flows/<feature>.md       (required)
shared-artifacts/system-graphs/<feature>.json     (required)
shared-artifacts/dependency-maps/<feature>.json   (required for blast-radius)
shared-artifacts/risks/<feature>.json              (required)
shared-artifacts/api-analysis/<feature>.json      (required for API impact)
shared-artifacts/e2e-analysis/<feature>.json      (required for UI impact)
input/raw-imports/changes.<run-id>.md              (required: PR diff, change list, incident)
```

---

## Canonical workflow

```
01-input        : load shared inputs + change input
02-changes      : parse change input → Change[]
03-impact       : compute direct + transitive impact via dep map
04-selection    : apply selection rules → RegressionSelection[]
05-validation   : schema + cross-artifact consistency
06-verification : evidence + scenario_id resolution
07-publish      : promote
```

Pipeline: [pipelines/run-regression-analysis.workflow.yaml](pipelines/run-regression-analysis.workflow.yaml)

---

## Agents

| Agent | Purpose |
|---|---|
| [change-analyzer](agents/change-analyzer.agent.md) | Phase 2: parse change input → Change[] |
| [impact-analyzer](agents/impact-analyzer.agent.md) | Phase 3: compute direct + transitive impact |
| [regression-selector](agents/regression-selector.agent.md) | Phase 4: apply selection rules → RegressionSelection[] |
| [regression-verifier](agents/regression-verifier.agent.md) | Phase 6: verify selection coupling + completeness |

---

## Rules

| Rule | Discipline |
|---|---|
| [selection-rules](rules/selection-rules.md) | Default rules + override discipline |
| [impact-discipline](rules/impact-discipline.md) | Direct vs transitive vs data vs contract impact |
| [budget-discipline](rules/budget-discipline.md) | Runtime budget; selection trimming when over-budget |

---

## Skills

| Skill | Purpose |
|---|---|
| [change-parsing](skills/change-parsing/SKILL.md) | Parse PR diffs / commit lists / incident reports |
| [impact-computation](skills/impact-computation/SKILL.md) | Graph traversal for blast-radius |
| [regression-selection](skills/regression-selection/SKILL.md) | Apply rules → select scenarios |

---

## Modules

- `modules/impact-analysis/` — high-level impact reasoning
- `modules/dependency-impact/` — dep-map traversal helpers
- `modules/regression-selection/` — rule engine
- `modules/change-risk-analysis/` — classify risk delta from changes

---

## Outputs

```
output/regression-packages/<feature>/<run-id>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 01-changes/changes.json
├── 02-impact/impact-map.json
├── 03-selection/regression-set.json
├── 04-traceability/
└── 05-verification/
```

The regression set is consumed downstream by api-testing + e2e to filter their existing scenarios for re-execution. It does NOT generate new scenarios.

---

## Why this is a separate system

Regression decisions need:
- Full system graph (dependency-map)
- Existing scenarios (api + e2e)
- Risk register
- Change input

These come from different upstream systems. Regression-intelligence is the cross-cutting consumer that ties them together.

Without this system, regression scope is decided by guess or by "always run everything," both of which are unproductive.
