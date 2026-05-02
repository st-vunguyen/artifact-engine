---
skill_id: scenario-expansion
system: api-testing-intelligence
version: 1.0
---

# Scenario Expansion Skill

> Expand seed scenarios into executable API scenarios across e2e/contract/integration/regression packs.

## Steps

For each seed in `shared-artifacts/scenarios/{feature}.seed.json`:

1. Determine target pack(s):
   - `kind=happy-path` → e2e + contract
   - `kind=edge-case` → contract + integration
   - `kind=abuse-failure` → e2e + integration (if linked to risks ≥ high)
   - `kind=regression` → regression
2. For each target pack:
   - Compose `ApiScenario` per `scenario-contract.md` §5
   - Map each step to an OAS operation (resolve from oas-snapshot)
   - Wire data from `07-data/`, env from `06-env/`
   - Set assertion list per request
3. Append to the corresponding Postman collection.
4. Append to traceability matrix.

## Hard rules

- Every scenario references a seed_id
- Every endpoint reference resolves to a documented OAS operation
- Every abuse-failure scenario references a risk_id (severity ≥ high)
- Every regression scenario cites a prior incident or PR
- Scenario IDs unique across packs

## Used by

- agent: `api-scenario-builder`
