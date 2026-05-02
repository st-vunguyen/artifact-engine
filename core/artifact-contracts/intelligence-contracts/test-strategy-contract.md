# Test Strategy Contract

> **Contract ID:** `test-strategy-contract@1.0`
> **Producer:** `test-strategy-intelligence`
> **Consumers:** `api-testing-intelligence`, `e2e-intelligence`, `regression-intelligence`, `reporting-mcp`

The test-strategy artifact is the **bridge** between the analysis world (business-flow, system-graph, risk-map) and the executable world (API tests, E2E tests, regression). It declares: scope, priorities, approach, risks, dependencies, definition of done.

This contract is modeled after the System-Level Test Strategy template referenced in `docs/test-strategy/`, made machine-readable.

---

## 1. Artifact Files

```
shared-artifacts/test-strategies/<feature>.md           ← human-readable, 7 sections
shared-artifacts/test-strategies/<feature>.json         ← structured projection
shared-artifacts/test-strategies/<feature>.system-overview.mmd   ← Mermaid system diagram
```

---

## 2. Frontmatter

```yaml
---
contract: test-strategy-contract@1.0
producer: test-strategy-intelligence
producer_run_id: <run-id>
feature: <feature-slug>
inputs_consumed:
  - shared-artifacts/business-flows/<feature>.md
  - shared-artifacts/risks/<feature>.json
  - shared-artifacts/system-graphs/<feature>.json
generated_at: <ISO-8601>
checksum: sha256:<hex>
mode: quick | deep | enterprise | regression | incident
---
```

---

## 3. The 7 Required Sections

| # | Section | Purpose |
|---|---|---|
| 1 | General Purpose | What system/module/feature is being tested; acceptance goal |
| 2 | System Overview Diagram | Architecture diagram — in-scope (green) vs out-of-scope (red) |
| 3 | Scope & Objective | Per-feature: test objective, in/out scope, priority, QC owner |
| 4 | Testing Approach | Per scope-area: test level/type, manual/auto/AI %, tool/framework, strategy notes |
| 5 | Risk & Mitigation | Per risk: description, impact, likelihood, mitigation plan, owner |
| 6 | Dependencies | Per dependency: category, owner, status, impact-if-delayed, deadline |
| 7 | Definition of Done | Completion criteria, metric/threshold, measurement plan |

A section may be empty only with explicit "Not applicable for this feature because <reason>" justification.

---

## 4. Section 3 — Scope & Objective Schema

```ts
type ScopeRow = {
  scope_id: string                 // "SC01"
  feature: string                  // ties to business-flow feature or sub-feature
  test_objective: string
  in_scope: string[]               // explicit in-scope items
  out_of_scope: string[]           // explicit out-of-scope items
  priority: "p0" | "p1" | "p2" | "p3"
  qc_owner: string                 // role or person id
  links_to:
    business_flow_step_ids?: string[]
    risk_ids?: string[]
    system_components?: string[]
  evidence: Evidence[]
}
```

Rules:
- Every `priority: "p0" | "p1"` row MUST link to ≥1 risk_id (severity ≥ medium).
- Every row MUST cite source evidence (typically business-flow flow rows).

---

## 5. Section 4 — Testing Approach Schema

```ts
type ApproachRow = {
  approach_id: string              // "AP01"
  scope_area: string               // e.g., "Checkout API", "Payment Gateway integration"
  test_levels: TestLevel[]
  test_types: TestType[]
  manual_pct: number               // 0..100
  auto_pct: number                 // 0..100
  ai_pct: number                   // 0..100; sum manual+auto+ai = 100
  primary_tool: string             // e.g., "Newman + Postman", "Playwright", "JMeter"
  framework: string                // e.g., "Postman v10", "Playwright 1.x", "k6 v0.x"
  strategy_notes: string
  links_to:
    scope_ids: string[]
    risk_ids?: string[]
}

type TestLevel = "unit" | "integration" | "contract" | "system" | "e2e" | "acceptance"
type TestType = "functional" | "non-functional" | "security" | "performance"
              | "accessibility" | "visual" | "compatibility" | "regression"
              | "smoke" | "abuse-failure" | "data-driven" | "exploratory"
```

Rules:
- `manual_pct + auto_pct + ai_pct` MUST equal 100.
- `primary_tool` MUST be a registered tool in the catalog (per `core/shared-rules/...`).
- For a `scope_id` of priority `p0`, `auto_pct + ai_pct` MUST be ≥ 60 (no high-priority manual-only).

---

## 6. Section 5 — Risk & Mitigation Schema

Risks are inherited from `risk-map-contract.md` but the strategy adds *test-side* mitigation:

```ts
type RiskMitigationRow = {
  risk_id: string                  // matches risks/<feature>.json
  description: string              // copy or refinement
  impact: ImpactLevel
  likelihood: LikelihoodLevel
  test_mitigation: string          // what testing reduces this risk
  test_artifacts:
    api_scenarios?: string[]       // scenario ids
    e2e_scenarios?: string[]       // scenario ids
    regression_scenarios?: string[]
  owner: string
}
```

The strategy does NOT redefine the risk itself; it declares which test artifacts mitigate it. The consistency-gate validates that referenced scenario ids exist (after api/e2e systems run).

---

## 7. Section 6 — Dependencies Schema

```ts
type DependencyRow = {
  dependency_id: string            // "DP01"
  name: string
  category: "service" | "data" | "infra" | "tool" | "third-party" | "team"
  owner: string
  status: "ready" | "in-progress" | "blocked" | "delayed" | "unknown"
  impact_if_delayed: string
  deadline?: string                // ISO-8601 if known
  blocks_scopes: string[]          // scope_ids blocked by this dep
}
```

---

## 8. Section 7 — Definition of Done Schema

```ts
type DoDRow = {
  dod_id: string                   // "DOD01"
  criterion: string                // e.g., "All p0 endpoints have per-status coverage"
  metric: string                   // e.g., "100% per-status coverage"
  threshold: string                // e.g., "≥ 95%"
  measurement_plan: string         // how the metric is computed
  source_artifact_kind?: string    // e.g., "scenario-contract", "api-test-pack"
}
```

After execution, `actual` and `pass_fail` fields are populated by the verifier.

---

## 9. Execution Modes (mode field)

| Mode | Depth | Coverage | Validation strictness |
|---|---|---|---|
| quick | shallow | smoke + p0 only | minimal |
| deep | thorough | all priorities | standard |
| enterprise | exhaustive | all + non-functional | maximum |
| regression | targeted | impacted scope only | standard |
| incident | targeted | failure path + adjacent | maximum |

The mode shapes the strategy's automation thresholds, scope inclusion, and what dependencies are blocking.

---

## 10. Hard Rules

1. Every Section 3 row MUST link to ≥1 business-flow step or system-component.
2. Every Section 4 row MUST link to ≥1 Section 3 row.
3. Every Section 5 row MUST reference an existing risk in `shared-artifacts/risks/<feature>.json`.
4. Every Section 7 row MUST be measurable (metric + threshold + plan).
5. Every Section 5 risk of severity ≥ high MUST have a non-empty `test_mitigation` and ≥1 test_artifact reference.
6. The strategy MUST consume business-flow + risk-map (these are mandatory upstream artifacts).

---

## 11. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter, 7 sections, schemas |
| `consistency-validator` | cross-links resolve (business-flow → strategy → risks); auto+ai+manual = 100 |
| `traceability-validator` | every claim has evidence |
| `completeness-validator` | DoD measurable, every p0/p1 scope has coverage plan |

---

## 12. Downstream Effects

- **api-testing-intelligence** reads the strategy's Section 4 rows where `test_levels` includes `integration | contract | system`. It uses `priority` to allocate effort and `risk_ids` to choose abuse-failure scenarios.
- **e2e-intelligence** reads rows where `test_levels` includes `e2e | acceptance`. It uses Mermaid system overview to anchor journeys.
- **regression-intelligence** reads rows where `test_types` includes `regression`. It uses the dependency table to prioritize the regression set.

---

## 13. Versioning

- 1.0 — initial.
- 1.x — add optional fields (e.g., `cost_estimate`).
- 2.0 — restructure sections, change required field semantics.
