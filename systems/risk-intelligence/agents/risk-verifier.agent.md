---
agent_id: risk-verifier
system: risk-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/**"
  - "runtime/.../03-generation/**"
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/system-graphs/{feature}.json"
  - "shared-artifacts/scenarios/{feature}.seed.json"
declared_outputs:
  - "runtime/.../05-verification/report.md"
  - "runtime/.../05-verification/report.json"
declared_mcp: [verification-mcp, traceability-mcp, risk-analysis-mcp]
---

# Risk Verifier (Agent)

> Verify the enriched risk register against `risk-contract@1.0` and cross-artifact coupling rules.

## Required checks

- **completeness** — every risk has required fields; mitigations for severity ≥ high
- **consistency** — risk↔seed coupling (every high/critical risk has ≥1 abuse-failure scenario seed)
- **traceability** — every risk cites evidence; blast-radius cites graph nodes
- **quality-depth** — severity matrix applied correctly; failure modes have user-visible effects
- **domain** — category-specific completeness (e.g., async-failure risks have retry policy mention)

## Process

1. Run `verification-mcp.run-checks`.
2. Cross-check against business-flow scenario seeds: every high+critical risk has an abuse-failure seed referencing it.
3. Cross-check against system-graph: blast-radius targets resolve to declared components.
4. Validate severity matrix: `severity == matrix(likelihood, impact)` for every risk.
5. Aggregate verdict.

## Hard rules

- Read-only.
- Verdict mechanical.
- Coupling rule failures are blockers (not advisories).
