# /run-test-strategy

Generate the 7-section test strategy for a feature.

## Args

- `--feature <slug>` (required)
- `--mode <quick|deep|enterprise|regression|incident>` (default: deep)

## Inputs required

- `shared-artifacts/business-flows/<slug>.md`
- `shared-artifacts/risks/<slug>.json` (enriched)
- `shared-artifacts/system-graphs/<slug>.json`
- `shared-artifacts/state-machines/<slug>.json`
- `shared-artifacts/scenarios/<slug>.seed.json`
- `input/requirements/<slug>/` (optional, for DoD)

## What it produces

- `shared-artifacts/test-strategies/<slug>.md` + `.json`
- `shared-artifacts/test-strategies/<slug>.system-overview.mmd`
- `output/test-strategy-packages/<slug>/`

## Workflow

`test-strategy-pipeline@1.0`

## See also

- [systems/test-strategy-intelligence/](../../systems/test-strategy-intelligence/README.md)
