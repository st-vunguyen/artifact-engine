# Regression Contract

> **Contract ID:** `regression-contract@1.0`
> **Producer:** `regression-intelligence`
> **Consumers:** `api-testing-intelligence`, `e2e-intelligence`, `reporting-mcp`

The regression artifact answers: "Given a change to X, which scenarios must run?" It computes change-impact, dependency-impact, and produces a prioritized regression set.

---

## 1. Artifact Files

```
shared-artifacts/regression-analysis/<feature>.md            ← human-readable
shared-artifacts/regression-analysis/<feature>.json          ← structured impact map
shared-artifacts/regression-analysis/<feature>.diff.json     ← what changed since last baseline
```

---

## 2. Frontmatter

```yaml
---
contract: regression-contract@1.0
producer: regression-intelligence
producer_run_id: <run-id>
feature: <feature-slug>
inputs_consumed:
  - shared-artifacts/business-flows/<feature>.md
  - shared-artifacts/system-graphs/<feature>.json
  - shared-artifacts/risks/<feature>.json
  - shared-artifacts/api-analysis/<feature>.json
  - shared-artifacts/e2e-analysis/<feature>.json
change_inputs:
  - input/raw-imports/changes.<run-id>.md          # PR diff, change list, incident report
generated_at: <ISO-8601>
checksum: sha256:<hex>
---
```

---

## 3. Top-Level JSON Shape

```json
{
  "summary": {
    "changes_analyzed": 12,
    "directly_impacted_components": 4,
    "transitively_impacted_components": 9,
    "regression_scenarios_selected": 38,
    "estimated_runtime_minutes": 22
  },
  "changes": [ /* Change[] */ ],
  "impact_map": [ /* ImpactRow[] */ ],
  "regression_set": [ /* RegressionSelection[] */ ]
}
```

---

## 4. Change Schema

```ts
type Change = {
  change_id: string                        // "CH01"
  source: "pr" | "commit" | "spec-update" | "incident" | "manual-flag"
  source_ref: string                       // PR #, commit sha, incident id
  description: string
  artifacts_touched:
    components?: string[]                  // component_ids
    api_operations?: string[]              // operationIds
    business_flow_steps?: string[]
    ui_routes?: string[]
  evidence: Evidence[]
}
```

---

## 5. Impact Map

```ts
type ImpactRow = {
  change_id: string
  impact_target: string                    // component_id, journey_id, scenario_id
  impact_kind: "direct" | "transitive-1" | "transitive-2plus" | "data" | "contract"
  reasoning: string                        // chain of dependencies
  blast_radius_score: number               // 0..1
  evidence: Evidence[]
}
```

The dependency-analysis-mcp computes blast radius from the system-graph + dependency-map.

---

## 6. Regression Selection

```ts
type RegressionSelection = {
  selection_id: string                     // "RS01"
  scenario_kind: "api" | "e2e"
  scenario_id: string                      // ref into api or e2e analysis
  scenario_title: string
  selected_because: SelectionReason[]
  priority: "p0" | "p1" | "p2"
  estimated_runtime_seconds?: number
}

type SelectionReason = {
  kind: "direct-impact" | "transitive-impact" | "high-risk-affected" | "incident-replay" | "always-run-smoke"
  detail: string
  links_to_change_ids?: string[]
  links_to_risk_ids?: string[]
}
```

---

## 7. Selection Rules (declarative)

The default selection rules:

```yaml
rules:
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

These rules are configurable per workflow but the defaults must be present.

---

## 8. Hard Rules

1. Every selection MUST have ≥1 SelectionReason.
2. Every `selected_because.links_to_change_ids` MUST resolve to a declared Change.
3. Every selection's `scenario_id` MUST exist in `shared-artifacts/api-analysis` or `shared-artifacts/e2e-analysis`.
4. The regression set MUST include all `kind: "always-run-smoke"` scenarios.
5. If `change.source == "incident"`, the set MUST include regression scenarios that previously cited that incident.

---

## 9. Computing Impact

The regression-intelligence uses the system-graph's dependency-map:

```
direct       = components/operations directly touched by the change
transitive-1 = components reachable in 1 hop via Integrations
transitive-2plus = components reachable in 2+ hops
data         = components reading/writing data stores affected by schema/data changes
contract     = consumers of an API whose contract changed
```

`blast_radius_score` is normalized 0..1 from "directly impacted" up to "transitively reachable across N components."

---

## 10. Cross-Artifact Use

| Consumer | What it uses |
|---|---|
| api-testing-intelligence | regression_set scenarios of kind "api" → re-run pack |
| e2e-intelligence | regression_set scenarios of kind "e2e" → re-run pack |
| reporting-mcp | runtime estimate, prioritization for the regression report |

---

## 11. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter + JSON schema |
| `consistency-validator` | scenario_ids resolve, change_ids resolve, blast radius monotonic with hops |
| `traceability-validator` | every change cited |
| `completeness-validator` | all rules applied (no rule skipped silently) |

---

## 12. Versioning

- 1.0 — initial.
- 1.x — extra rule kinds, additional impact dimensions.
- 2.0 — restructure selection model.
