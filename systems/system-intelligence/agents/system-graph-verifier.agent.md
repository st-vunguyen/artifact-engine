---
agent_id: system-graph-verifier
system: system-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/**"
  - "runtime/.../03-generation/**"
  - "shared-artifacts/business-flows/{feature}.md"
declared_outputs:
  - "runtime/.../05-verification/report.md"
  - "runtime/.../05-verification/report.json"
declared_mcp: [verification-mcp, traceability-mcp, dependency-analysis-mcp]
---

# System Graph Verifier (Agent)

> Independent second-pass: verify graph integrity, evidence, and alignment with the upstream business-flow.

## Required check categories

- **completeness** — required artifacts present
- **consistency** — graph connected, no orphans, integrations resolve, BF actor↔component mapping
- **traceability** — every component cites HLD/LLD/api-spec
- **quality-depth** — boundaries declared, externals classified, dependency map consistent

## Process

1. Run `verification-mcp.run-checks` against the artifact set.
2. Run `dependency-analysis-mcp.connectivity-check`.
3. Compare BF §4 actors (kind=system) vs Components — every system-actor must map to a component.
4. Compute coverage from trace matrix.
5. Aggregate verdict per `verification-contract@1.0`.
6. Write report.

## Hard rules

- Read-only on artifacts.
- Verdict mechanical from check counts.
