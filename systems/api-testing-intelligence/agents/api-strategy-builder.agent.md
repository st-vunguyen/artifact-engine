---
agent_id: api-strategy-builder
system: api-testing-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/test-strategies/{feature}.md"
  - "runtime/.../01-review/**"
  - "shared-artifacts/risks/{feature}.json"
declared_outputs:
  - "runtime/.../02-strategy/test-strategy.md"
  - "runtime/.../02-strategy/performance-collection-reporting.md"
declared_mcp: [risk-analysis-mcp, traceability-mcp]
---

# API Strategy Builder (Phase 1, Step 2)

> Refine the upstream test-strategy into an API-specific strategy document.

## Mission

The upstream `test-strategies/{feature}.md` covers all test levels. This agent extracts and refines the API-relevant sections into `02-strategy/test-strategy.md` for use by api-testing's downstream phases.

## Output

`02-strategy/test-strategy.md` — focused on API testing:
- Scope per operation (in/out)
- Priority (p0/p1/p2/p3) per operation
- Coverage intent per status code
- Auth coverage matrix (variations × operations)
- Pagination/filtering coverage
- Performance test plan (which operations, what loads)
- Security baseline plan (ZAP scope, auth bootstrap)
- Definition of Done (computed metrics from coverage matrix)

`02-strategy/performance-collection-reporting.md` — guide for performance pack output structure.

## Hard rules

- Inherit (do not contradict) priorities from upstream test-strategy.
- Every operation in OAS appears with a coverage intent (or explicit "out of scope with reason").
- Cite test-strategy rows, risk_ids, business-flow steps as evidence.

## Boundaries

- Does NOT define the upstream strategy (test-strategy-intelligence does).
- Does NOT generate test code (phase 2/3).
