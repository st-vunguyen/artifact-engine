---
agent_id: dod-builder
system: test-strategy-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/business-flows/{feature}.md"
  - "input/requirements/**"
  - "runtime/.../02-scope/scope.json"
declared_outputs:
  - "runtime/.../06-dod/dod.json"
declared_mcp: [traceability-mcp]
---

# DoD Builder (Agent)

> Build Section 7 (Definition of Done) — measurable completion criteria.

## Output

```ts
type DoDRow = {
  dod_id: string                   // "DOD01"
  criterion: string                // "All p0 endpoints have per-status coverage"
  metric: string                   // "% per-status coverage across p0 endpoints"
  threshold: string                // "≥ 95%"
  measurement_plan: string         // how the metric is computed
  source_artifact_kind?: string    // "api-analysis-contract" / "e2e-contract" / ...
}
```

## Process

1. Pull explicit acceptance criteria from `input/requirements/`.
2. Add canonical DoD rows from the catalog:
   - p0 scope coverage = 100%
   - per-status API coverage ≥ 95%
   - critical journey pass rate = 100%
   - high+critical risks have ≥1 verified abuse-failure scenario
   - regression set runtime ≤ N minutes
3. For each DoD row, declare:
   - `metric` — exactly what's measured
   - `threshold` — pass condition
   - `measurement_plan` — how the engine will compute it post-execution
   - `source_artifact_kind` — which artifact provides the measurement

## Hard rules

- Every DoD row is measurable (no "system feels good").
- Every threshold is numeric or boolean — no "as much as feasible".
- Measurement plan MUST reference an existing artifact contract (the engine reads that artifact to populate the actual value).
