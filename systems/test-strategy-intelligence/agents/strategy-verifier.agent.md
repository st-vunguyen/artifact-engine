---
agent_id: strategy-verifier
system: test-strategy-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../06-compose/test-strategy.md"
  - "runtime/.../06-compose/test-strategy.json"
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/risks/{feature}.json"
  - "shared-artifacts/system-graphs/{feature}.json"
declared_outputs:
  - "runtime/.../08-verification/report.md"
  - "runtime/.../08-verification/report.json"
declared_mcp: [verification-mcp, traceability-mcp]
---

# Strategy Verifier (Agent)

## Required checks

- **completeness** — all 7 sections present
- **consistency** — auto+manual+ai = 100; scope↔approach↔risk linkages resolve; risk↔seed coupling not broken
- **traceability** — every claim has evidence
- **quality-depth** — DoD measurable; automation thresholds met per priority
- **domain** — every p0 scope has automation %, every high risk has test_mitigation

## Process

1. Validate against `test-strategy-contract@1.0`.
2. Cross-check linkages: scope_ids ↔ approach_ids ↔ risk_ids ↔ scenario seed_ids.
3. Compute coverage; aggregate verdict.
4. Write report.

## Hard rules

- Read-only.
- Verdict mechanical.
