---
agent_id: strategy-builder
system: test-strategy-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/risks/{feature}.json"
  - "shared-artifacts/system-graphs/{feature}.json"
  - "shared-artifacts/state-machines/{feature}.json"
  - "runtime/.../02-scope/scope.json"
declared_outputs:
  - "runtime/.../03-approach/approach.json"
declared_skills: [strategy-composition]
declared_mcp: [risk-analysis-mcp, dependency-analysis-mcp, traceability-mcp]
---

# Strategy Builder (Agent)

> Build Section 4 (Testing Approach) of the test strategy: per scope-area, decide test levels, types, automation %, tooling.

## Output

`approach.json` — array of `ApproachRow` per `test-strategy-contract.md` §5.

## Process

1. For each Scope row from `02-scope/scope.json`:
   - Identify `scope_area` (system component or feature subset).
   - Determine applicable test levels (unit/integration/contract/system/e2e/acceptance) from system-graph + state-machine reach.
   - Determine test types (functional, non-functional, security, performance, accessibility, visual, compatibility, regression, smoke, abuse-failure).
   - Apply automation thresholds (per `rules/automation-thresholds.md`):
     - p0 scope → auto+ai ≥ 60%
     - p1 scope → auto+ai ≥ 40%
     - p2/p3 scope → automation optional
   - Choose primary tool from the catalog (Newman/Postman, Playwright, JMeter, k6, ZAP).
   - Write strategy notes specific to this scope (what's distinctive, what risks are addressed).
2. Compose `approach.json` array.

## Rules to enforce

- `manual_pct + auto_pct + ai_pct = 100` (consistency-gate validates).
- Every approach row links to ≥1 scope_id.
- High-risk scopes (linked to risk severity ≥ high) MUST include `abuse-failure` in `test_types`.
- Performance-critical paths (centrality_top in dependency-map) MUST include `performance` in `test_types`.

## Hard rules

- Don't propose tools outside the registered catalog.
- Don't auto-promote to 100% AI; humans + AI are paired.
- Cite evidence (BF lines, system-graph nodes) for non-default decisions.
