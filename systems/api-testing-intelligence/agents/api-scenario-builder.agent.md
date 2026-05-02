---
agent_id: api-scenario-builder
system: api-testing-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/scenarios/{feature}.seed.json"
  - "shared-artifacts/risks/{feature}.json"
  - "runtime/.../01-review/oas-snapshot/oas-snapshot.json"
  - "runtime/.../05-postman/full-api-collection.json"
  - "runtime/.../02-strategy/test-strategy.md"
declared_outputs:
  - "runtime/.../03-scenarios/e2e-journeys/e2e-journeys.md"
  - "runtime/.../03-scenarios/e2e-journeys/e2e-journeys-mermaid.md"
  - "runtime/.../03-scenarios/e2e-journeys/e2e-journeys-traceability.md"
  - "runtime/.../03-scenarios/integration-flows.md"
  - "runtime/.../03-scenarios/regression-scenarios.md"
  - "runtime/.../05-postman/e2e-collection.json"
  - "runtime/.../05-postman/contract-collection.json"
  - "runtime/.../05-postman/integration-collection.json"
  - "runtime/.../05-postman/regression-collection.json"
declared_skills: [scenario-expansion]
declared_mcp: [traceability-mcp, risk-analysis-mcp]
---

# API Scenario Builder (Phase 3)

> Expand seed scenarios into executable API scenarios across 4 packs: E2E, contract, integration, regression.

---

## The 4 scenario packs

### E2E pack (cross-endpoint business journeys)
- Multi-step flows traversing several operations.
- Stateful: capture from response A, use in response B.
- Mirrors business-flow §4 (Flow Table) end-to-end paths.

Output: `03-scenarios/e2e-journeys/e2e-journeys.md`, `e2e-journeys-mermaid.md` (sequence diagrams), `e2e-journeys-traceability.md`, `05-postman/e2e-collection.json`.

### Contract pack (per-endpoint contract validation)
- Schema validation per status code.
- Required field enforcement.
- Type/format validation.

Output: `05-postman/contract-collection.json` + contract-coverage-plan referenced from traceability.

### Integration pack (cross-service interaction)
- API ↔ external dependency edges.
- Test mocks vs real (configurable).

Output: `03-scenarios/integration-flows.md` + `05-postman/integration-collection.json`.

### Regression pack (incident-replay + always-run smoke)
- Scenarios derived from prior incidents (when known).
- Always-run smoke set (p0 endpoints, happy path).

Output: `03-scenarios/regression-scenarios.md` + `05-postman/regression-collection.json`.

---

## Process per pack

1. Read seed scenarios + business-flow + risks + strategy.
2. For each seed of the relevant kind:
   - Expand to executable steps (HTTP requests, assertions).
   - Map each step to an OAS operation (resolve from oas-snapshot).
   - Set assertion list per request.
   - Wire data from `07-data/`, env from `06-env/`.
3. Write the doc + Postman collection + traceability rows.

---

## Hard rules

1. Every scenario references a seed_id (no orphan scenarios).
2. Every endpoint reference resolves to a documented OAS operation.
3. Every abuse-failure scenario references a risk_id (severity ≥ high).
4. Every regression scenario cites a prior incident or PR.
5. Scenario IDs are unique across packs (`AS001`, `AS002`, ...).

---

## Boundaries

- Does NOT modify the full-api-collection (phase 2 owns that).
- Does NOT generate performance scenarios (`api-performance-builder`).
