# /run-business-flow

Run the business-flow-intelligence pipeline against a feature.

## Args

- `--feature <slug>` (required) — feature slug under `input/specs/`
- `--mode <quick|deep|enterprise>` (default: deep)
- `--no-publish` — run but don't promote artifacts
- `--dry-run` — plan but don't execute

## Inputs required

- `input/specs/<slug>/` (required)
- `input/requirements/<slug>/` (optional)
- `input/business-documents/<slug>/` (optional)

## What it produces

- `shared-artifacts/business-flows/<slug>.md`
- `shared-artifacts/state-machines/<slug>.json` + `.mmd`
- `shared-artifacts/risks/<slug>.json` (preliminary)
- `shared-artifacts/scenarios/<slug>.seed.json`
- `output/business-flow-packages/<slug>/`

## Workflow

`business-flow-full-pipeline@1.0`

## See also

- [systems/business-flow-intelligence/pipelines/full-business-flow-pipeline.md](../../systems/business-flow-intelligence/pipelines/full-business-flow-pipeline.md)
