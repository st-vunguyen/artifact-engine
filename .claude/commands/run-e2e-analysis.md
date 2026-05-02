# /run-e2e-analysis

Generate the Playwright E2E pack — strategy → scenarios → code → fixtures → execution.

## Args

- `--feature <slug>` (required)
- `--mode <quick|deep|enterprise>` (default: deep)
- `--viewports <list>` (default: desktop,tablet,mobile)
- `--a11y-level <A|AA|AAA>` (default: AA)
- `--execute` (when an app target is available, runs phase 5)

## Inputs required

- `shared-artifacts/business-flows/<slug>.md`
- `shared-artifacts/test-strategies/<slug>.md`
- `shared-artifacts/state-machines/<slug>.json`
- `shared-artifacts/risks/<slug>.json`
- `shared-artifacts/scenarios/<slug>.seed.json`
- `shared-artifacts/api-analysis/<slug>.json` (optional)
- `input/ui-specs/<slug>/`, `input/ui-flows/<slug>/`

## What it produces

- `shared-artifacts/e2e-analysis/<slug>.json` + `.md`
- `shared-artifacts/e2e-analysis/<slug>.journey-graph.mmd`
- `shared-artifacts/e2e-analysis/<slug>.poms.json`
- `shared-artifacts/scenarios/<slug>.e2e.json`
- `output/e2e-packages/<slug>/` — Playwright pack:
  - `tests/e2e/{config,core,fixtures,helpers,pages,specs,reporters,snapshots,docs}`
  - `playwright.config.ts`

## Two-pass execution rule

When `@visual` tests exist:
- Pass 1: non-visual (`--grep-invert @visual`)
- Pass 2: visual (`--grep @visual`)

Visual baselines must exist before pass 2.

## Workflow

`e2e-full-pipeline@1.0`

## See also

- [systems/e2e-intelligence/](../../systems/e2e-intelligence/README.md)
- [systems/e2e-intelligence/rules/e2e-automation.md](../../systems/e2e-intelligence/rules/e2e-automation.md)
