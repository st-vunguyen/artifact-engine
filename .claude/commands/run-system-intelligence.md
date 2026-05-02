# /run-system-intelligence

Build the system graph + dependency map.

## Args

- `--feature <slug>` (required)
- `--mode <quick|deep|enterprise>` (default: deep)

## Inputs required

- `shared-artifacts/business-flows/<slug>.md` (required; from business-flow run)
- `input/hld/<slug>/` (encouraged)
- `input/lld/<slug>/` (encouraged)
- `input/api-specs/<slug>/` (when REST APIs)

## What it produces

- `shared-artifacts/system-graphs/<slug>.json` + `.md` + `.diagram.mmd`
- `shared-artifacts/dependency-maps/<slug>.json`
- `output/system-analysis-packages/<slug>/`

## Workflow

`system-graph-pipeline@1.0`

## See also

- [systems/system-intelligence/](../../systems/system-intelligence/README.md)
