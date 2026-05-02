---
agent_id: regression-selector
system: regression-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-impact/impact-map.json"
  - "shared-artifacts/api-analysis/{feature}.json"
  - "shared-artifacts/e2e-analysis/{feature}.json"
  - "shared-artifacts/scenarios/{feature}.api.json"
  - "shared-artifacts/scenarios/{feature}.e2e.json"
declared_outputs:
  - "runtime/.../03-selection/regression-set.json"
  - "runtime/.../03-selection/regression-set.md"
declared_skills: [regression-selection]
declared_mcp: [traceability-mcp]
---

# Regression Selector (Phase 4)

> Apply selection rules → build the prioritized regression set.

## Default selection rules (per `selection-rules.md`)

```yaml
- id: direct-api-impact
  when: change.artifacts_touched.api_operations is non-empty
  select: api scenarios where scenario.endpoints[].path matches changed operation
  priority: p0
- id: transitive-api-impact
  when: change.artifacts_touched.components is non-empty
  select: api scenarios for operations exposed by transitively-impacted components
  priority: p1
- id: e2e-impact
  when: change.artifacts_touched.business_flow_steps OR ui_routes
  select: e2e journeys linking those steps/routes
  priority: p0
- id: high-risk-affected
  when: any change links to a risk with severity ≥ high
  select: abuse-failure scenarios linked to that risk
  priority: p0
- id: incident-replay
  when: change.source == "incident"
  select: regression scenarios already linked to the incident
  priority: p0
- id: always-run-smoke
  when: any change at all
  select: scenarios tagged @smoke
  priority: p1
```

## Output

```ts
type RegressionSelection = {
  selection_id: string
  scenario_kind: "api" | "e2e"
  scenario_id: string
  scenario_title: string
  selected_because: SelectionReason[]
  priority: "p0" | "p1" | "p2"
  estimated_runtime_seconds?: number
}
```

## Process

1. For each rule, evaluate against impact map + change list.
2. Resolve scenario_id from upstream api-analysis / e2e-analysis.
3. Aggregate `selected_because[]` for each scenario (may be selected by multiple rules; keep all reasons).
4. Apply budget discipline (per `budget-discipline.md`):
   - If total runtime > budget → drop p2 first, then p1, never p0
   - Surface trim decisions explicitly
5. Sort by priority then estimated_runtime ascending.

## Hard rules

- Every selection has ≥1 SelectionReason
- p0 selections cannot be trimmed
- `always-run-smoke` always included
- `incident-replay` scenarios always included when source is incident
