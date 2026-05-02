---
skill_id: performance-scaffold
system: api-testing-intelligence
version: 1.0
---

# Performance Scaffold Skill

> Generate k6 / Newman / JMeter scaffolds for API performance testing.

## Steps

1. Read `02-strategy/test-strategy.md` performance scope (which operations, what budgets).
2. Read `05-postman/full-api-collection.json` for selected operations.
3. **k6**: write `09-performance/k6/script.js` with stages (ramp-up, plateau, ramp-down) per scenario; thresholds per budget.
4. **k6 options**: `09-performance/k6/options.json` with VUs, duration, thresholds (`http_req_duration: ["p(95)<500"]`).
5. **Newman runbook**: `09-performance/newman/runbook.md` for soak runs of full-api-collection.
6. **JMeter**: `09-performance/jmeter/base.jmx` (XML) + `datasets/` (CSV samples) + `README.md`.
7. **performance-collection**: filtered Postman collection at `05-postman/performance-collection.json` (perf-relevant ops only).
8. **performance-guidance.md**: runbook + budget interpretation + warnings.

## Hard rules

- Reference shared env vars (no hardcoded URLs/tokens)
- Reference shared data samples for body payloads
- Explicit "do not run against production" warning
- Realistic load profiles citing strategy budgets
- Pick only operations with declared performance scope

## Used by

- agent: `api-performance-builder`
