# Components (System Rule)

> Each artifact has one purpose. Scenario IDs consistent across all artifacts.

## One-purpose discipline

Each file in the api pack has exactly one job:

| Folder | Purpose | NOT for |
|---|---|---|
| `01-review/` | Spec findings + proposals | Asset generation |
| `02-strategy/` | Strategy doc | Detailed scenarios |
| `03-scenarios/` | Scenario narratives | Postman collections |
| `04-traceability/` | Mapping tables | Findings |
| `05-postman/` | Executable collections | Documentation |
| `06-env/` | Env contract + .env.example | Real secrets |
| `07-data/` | Data samples | Production data |
| `08-helpers/` | Runbooks + scripts | Test logic |
| `09-performance/` | k6/JMeter/ZAP configs | Functional tests |
| `10-reports/` | Run outputs | Asset configs |

A file mixing purposes → split into separate files in the right folders.

## Scenario ID consistency

Every scenario / case / request / data sample has a stable ID. The same ID appears across:

- `02-strategy/test-strategy.md`
- `03-scenarios/*.md`
- `04-traceability/*.md`
- `05-postman/*.json` (request name reflects it)
- `07-data/*.json` (case_id field)
- `10-reports/*/findings.md` (when issues found)

ID convention:
- API scenarios: `AS001`, `AS002` ... (3-digit zero-padded)
- API cases (per status): `<OP>-<STATUS>-<NN>`, e.g., `CREATE-USER-400-01`
- E2E journeys: `EJ01`, `EJ02` ...

Drift across files → consistency-gate fails.

## No loose run folders under `10-reports/`

Every report run is nested under a report family folder (performance / security-baseline / verification / maintenance). Loose runs (e.g., `10-reports/run-20260430/`) → rejected.

## Why

The pack has dozens of files; readers and downstream tools must be able to navigate by purpose, not by filename guesses. Consistent IDs let a reader follow a scenario from strategy → request → data → report without lookup tables.
