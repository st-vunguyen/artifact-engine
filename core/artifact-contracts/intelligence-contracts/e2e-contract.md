# E2E Contract

> **Contract ID:** `e2e-contract@1.0`
> **Producer:** `e2e-intelligence`
> **Consumers:** `regression-intelligence`, `reporting-mcp`

The E2E artifact captures user journeys, multi-system flows, page object maps, and the link from journey steps back to business-flow steps + system components.

This contract reflects the e2e-testing-tool reference's Track 02 (Playwright) outputs in a system-consumable shape.

---

## 1. Artifact Files

```
shared-artifacts/e2e-analysis/<feature>.md                  ← human-readable journey set
shared-artifacts/e2e-analysis/<feature>.json                ← structured journeys
shared-artifacts/e2e-analysis/<feature>.journey-graph.mmd   ← Mermaid (state-flow LR)
shared-artifacts/e2e-analysis/<feature>.poms.json           ← page object map references
```

The actual Playwright test code (`*.spec.ts`, page objects, fixtures) lives in `output/e2e-packages/<feature>/` because it gets copied into the application repo.

---

## 2. Frontmatter

```yaml
---
contract: e2e-contract@1.0
producer: e2e-intelligence
producer_run_id: <run-id>
feature: <feature-slug>
inputs_consumed:
  - shared-artifacts/business-flows/<feature>.md
  - shared-artifacts/test-strategies/<feature>.md
  - shared-artifacts/api-analysis/<feature>.json
  - input/ui-flows/<feature>/...
  - input/ui-specs/<feature>/...
generated_at: <ISO-8601>
checksum: sha256:<hex>
---
```

---

## 3. Top-Level JSON Shape

```json
{
  "summary": {
    "journeys_total": 14,
    "journeys_critical": 5,
    "viewports_covered": ["desktop", "tablet", "mobile"],
    "page_objects_total": 22,
    "regression_journeys": 3,
    "abuse_failure_journeys": 4
  },
  "journeys": [ /* Journey[] */ ],
  "page_objects": [ /* PageObject[] */ ],
  "fixtures": [ /* Fixture[] */ ]
}
```

---

## 4. Journey Schema

```ts
type Journey = {
  journey_id: string                        // "journey-checkout-happy-path"
  title: string
  category: "happy-path" | "edge-case" | "abuse-failure" | "regression" | "smoke" | "visual" | "a11y"
  priority: "p0" | "p1" | "p2" | "p3"
  viewports: ("desktop" | "tablet" | "mobile")[]
  preconditions: string[]
  steps: JourneyStep[]
  outcomes: Outcome[]
  links_to:
    business_flow_step_ids: string[]        // back to BF
    risk_ids?: string[]
    api_operation_ids?: string[]            // touched APIs from api-analysis
    test_strategy_scope_ids?: string[]
  evidence: Evidence[]
}

type JourneyStep = {
  step_id: string                           // "step-01"
  action: "navigate" | "click" | "type" | "select" | "wait" | "assert" | "intercept" | "scroll" | "auth"
  target: SelectorRef                       // role-based or testid
  value?: string
  expected: ExpectedState
  page_object_ref?: string
  evidence?: Evidence[]
  screenshot_label?: string                 // for visual baselines
}

type SelectorRef = {
  kind: "role" | "label" | "testid" | "text" | "url"
  value: string
  fallback?: string                          // e.g., aria-label fallback
}

type ExpectedState = {
  url_pattern?: string
  visible_text?: string
  invisible_text?: string
  network?: { method: string, path_pattern: string, status: number }
  state_label?: string                       // matches state-machine state id
  visual_snapshot?: string                   // baseline file name
  a11y_violations_max?: number               // default 0 for AA scenarios
}

type Outcome = {
  outcome_id: string
  description: string
  assertions: string[]
  measurable_metric?: string                 // e.g., "page-load-ms < 3000"
}
```

---

## 5. Page Objects

```ts
type PageObject = {
  pom_id: string                            // "checkout-page"
  name: string
  path: string                              // e.g., "tests/e2e/pages/CheckoutPage.page.ts"
  url_patterns: string[]
  elements: PomElement[]
}

type PomElement = {
  element_id: string                        // "submit-button"
  name: string
  selector: SelectorRef
  used_by_journeys: string[]                // journey_ids
}
```

The e2e-testing-tool reference uses Page Object Model with semantic selectors (`getByRole`, `getByLabel`). The contract enforces this:

- Every PomElement MUST use `kind: "role" | "label" | "testid"` as primary.
- `kind: "text"` and class-based selectors are advisories at best.

---

## 6. Fixtures

```ts
type Fixture = {
  fixture_id: string
  kind: "auth" | "data" | "global-setup" | "global-teardown" | "intercept"
  description: string
  path: string                              // e.g., "tests/e2e/fixtures/auth.ts"
  used_by_journeys: string[]
  evidence: Evidence[]
}
```

---

## 7. Hard Rules

1. Every Journey MUST link to ≥1 business-flow step (no journey without flow grounding).
2. Every Journey of `category: "abuse-failure"` MUST link to ≥1 risk_id.
3. Every Journey of `category: "regression"` MUST cite a prior incident or PR (in `evidence`).
4. Every JourneyStep target MUST use semantic selector (role/label/testid). Class/text selectors are findings.
5. Every Journey marked `priority: "p0"` MUST be tagged `@critical` in the generated test code.
6. Visual baselines MUST exist before a journey claims `visual_snapshot`.

---

## 8. Mermaid Journey Graph

```
shared-artifacts/e2e-analysis/<feature>.journey-graph.mmd
```

A state-flow diagram showing:
- Journey nodes (per category, color-coded)
- Edges = preconditions / followed-by relations
- Subgraphs per viewport
- Cross-references to business-flow nodes

---

## 9. Coupling with API Analysis

When a journey step has `expected.network`, the orchestrator's consistency-gate validates:

- The `path_pattern` resolves to an Operation in `api-analysis/<feature>.json`.
- The expected `status` is in that Operation's `status_codes_documented`.
- Cross-reference recorded in `links_to.api_operation_ids`.

---

## 10. Cross-Artifact Use

| Consumer | What it uses |
|---|---|
| regression-intelligence | journey list to compute UI regression set on changes |
| reporting-mcp | journey summary + coverage rollups for executive report |

---

## 11. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter + JSON schema |
| `consistency-validator` | journey ↔ flow ↔ risk coupling, semantic selectors |
| `traceability-validator` | every journey has evidence |
| `completeness-validator` | viewport coverage, every p0 journey tagged |

---

## 12. Versioning

- 1.0 — initial.
- 1.x — additional categories, viewport types, optional fields.
- 2.0 — restructure step model or selector kinds.
