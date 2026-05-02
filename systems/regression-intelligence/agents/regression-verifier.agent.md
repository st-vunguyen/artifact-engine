---
agent_id: regression-verifier
system: regression-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../**"
  - "shared-artifacts/api-analysis/{feature}.json"
  - "shared-artifacts/e2e-analysis/{feature}.json"
  - "shared-artifacts/risks/{feature}.json"
declared_outputs:
  - "runtime/.../05-verification/report.md"
  - "runtime/.../05-verification/report.json"
declared_mcp: [verification-mcp, traceability-mcp]
---

# Regression Verifier

## Required checks

- **completeness** — every change has impact rows; every impact has selections (or explicit "no scenarios match" gap)
- **consistency** — scenario_ids resolve in upstream artifacts; impact reasoning chain references real components
- **traceability** — every selection cites change_ids; every change cites source_ref
- **quality-depth** — selection rules applied (no rule skipped silently); budget honored; p0 not trimmed
- **coupling** — incident-source changes have replay scenarios; high-risk changes have abuse-failure scenarios

## Process

1. Run check categories.
2. Validate scenario_ids resolve (cross-system check).
3. Validate budget rules honored.
4. Compute coverage (% of impacts that have at least one selection).
5. Aggregate verdict.
6. Write report.

## Hard rules

- Read-only on artifacts.
- Verdict mechanical.
- Selection without impact reference is a blocker.
