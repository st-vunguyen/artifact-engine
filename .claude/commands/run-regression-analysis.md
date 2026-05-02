# /run-regression-analysis

Compute prioritized regression set from a change input.

## Args

- `--feature <slug>` (required)
- `--change-input <path>` (required) — PR diff / commit list / incident report under `input/raw-imports/`
- `--budget <minutes>` (default: from test-strategy DoD)

## Inputs required

- `shared-artifacts/business-flows/<slug>.md`
- `shared-artifacts/system-graphs/<slug>.json`
- `shared-artifacts/dependency-maps/<slug>.json`
- `shared-artifacts/risks/<slug>.json`
- `shared-artifacts/api-analysis/<slug>.json`
- `shared-artifacts/e2e-analysis/<slug>.json`
- `shared-artifacts/scenarios/<slug>.api.json`
- `shared-artifacts/scenarios/<slug>.e2e.json`
- `input/raw-imports/changes.<id>.md`

## What it produces

- `shared-artifacts/regression-analysis/<slug>.json` + `.md`
- `shared-artifacts/regression-analysis/<slug>.diff.json`
- `output/regression-packages/<slug>/<run-id>/`

## Default selection rules

- direct-api-impact (p0)
- transitive-api-impact (p1)
- e2e-impact (p0)
- high-risk-affected (p0)
- incident-replay (p0; not downgradable)
- always-run-smoke (p1)

## Trim policy (when over budget)

1. Drop p2
2. Drop p1 (except `always-run-smoke`)
3. Never drop p0
4. Never drop `incident-replay`

If even p0 exceeds budget → stop-and-report.

## Workflow

`regression-analysis-pipeline@1.0`

## See also

- [systems/regression-intelligence/](../../systems/regression-intelligence/README.md)
- [systems/regression-intelligence/rules/budget-discipline.md](../../systems/regression-intelligence/rules/budget-discipline.md)
