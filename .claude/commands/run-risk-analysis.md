# /run-risk-analysis

Enrich the preliminary risk register with blast-radius + failure modes + mitigations.

## Args

- `--feature <slug>` (required)
- `--mode <quick|deep|enterprise>` (default: deep)

## Inputs required

- `shared-artifacts/business-flows/<slug>.md`
- `shared-artifacts/risks/<slug>.json` (preliminary; from business-flow)
- `shared-artifacts/system-graphs/<slug>.json`
- `shared-artifacts/dependency-maps/<slug>.json`
- `shared-artifacts/scenarios/<slug>.seed.json`

## What it produces

- `shared-artifacts/risks/<slug>.json` (enriched; replaces preliminary)
- `shared-artifacts/risks/<slug>.blast-radius.json`
- `shared-artifacts/risks/<slug>.map.mmd`
- `output/risk-analysis-packages/<slug>/`

## Workflow

`enrich-risks-pipeline@1.0`

## See also

- [systems/risk-intelligence/](../../systems/risk-intelligence/README.md)
