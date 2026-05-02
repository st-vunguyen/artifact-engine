# /run-api-testing

Generate the 10-folder API test pack with per-status coverage.

## Args

- `--feature <slug>` (required)
- `--mode <quick|deep|enterprise>` (default: deep)

## Inputs required

- `input/api-specs/<slug>/openapi.yaml` (required)
- `shared-artifacts/business-flows/<slug>.md`
- `shared-artifacts/test-strategies/<slug>.md`
- `shared-artifacts/system-graphs/<slug>.json`
- `shared-artifacts/risks/<slug>.json`
- `shared-artifacts/scenarios/<slug>.seed.json`
- `shared-artifacts/state-machines/<slug>.json`

## What it produces

- `shared-artifacts/api-analysis/<slug>.json` + `.md`
- `shared-artifacts/api-analysis/<slug>.coverage-matrix.json`
- `shared-artifacts/api-analysis/<slug>.oas-snapshot.json`
- `shared-artifacts/scenarios/<slug>.api.json`
- `output/api-qc-packages/<slug>/` — 10-folder runnable pack:
  - `01-review/` `02-strategy/` `03-scenarios/` `04-traceability/`
  - `05-postman/` `06-env/` `07-data/` `08-helpers/`
  - `09-performance/` `10-reports/`

## Per-status request rule (ABSOLUTE)

Every operation has one Postman request per documented status code.
Naming: `"{Verb Noun} — {CODE} {Label}"`.

## Workflow

`api-test-full-pipeline@1.0`

## See also

- [systems/api-testing-intelligence/](../../systems/api-testing-intelligence/README.md)
- [systems/api-testing-intelligence/rules/testing.md](../../systems/api-testing-intelligence/rules/testing.md)
