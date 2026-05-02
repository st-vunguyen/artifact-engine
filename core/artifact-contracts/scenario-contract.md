# Scenario Contract

> **Contract ID:** `scenario-contract@1.0`
> **Producers:** `business-flow-intelligence` (seeds), `api-testing-intelligence` (api scenarios), `e2e-intelligence` (journey scenarios)
> **Consumers:** downstream tooling, test runners, reporting-mcp

A scenario is a structured test/verification idea — it represents what to test, why, and what evidence/risks it ties back to. The contract supports three "shapes" sharing a common base.

---

## 1. Artifact Locations

```
shared-artifacts/scenarios/<feature>.seed.json   ← seeds from business-flow
shared-artifacts/scenarios/<feature>.api.json    ← api-testing scenarios
shared-artifacts/scenarios/<feature>.e2e.json    ← e2e journey scenarios
```

---

## 2. Common Frontmatter (each `.json` has a wrapper)

```json
{
  "contract": "scenario-contract@1.0",
  "kind": "seed | api | e2e",
  "producer": "business-flow-intelligence | api-testing-intelligence | e2e-intelligence",
  "producer_run_id": "<run-id>",
  "feature": "<feature-slug>",
  "generated_at": "<ISO-8601>",
  "checksum": "sha256:<hex>",
  "scenarios": [ /* ... */ ]
}
```

---

## 3. Base Scenario Shape

```ts
type ScenarioBase = {
  scenario_id: string                       // unique within feature
  kind: "happy-path" | "edge-case" | "abuse-failure" | "regression" | "performance" | "security"
  title: string
  description: string
  links_to: {
    flow_step_ids?: string[]                // → business-flow.md S01, S02, ...
    risk_ids?: string[]                     // → risk-register
    seed_ids?: string[]                     // → predecessor seeds
  }
  evidence: Evidence[]                      // why this scenario exists
  priority: "p0" | "p1" | "p2" | "p3"
  expected_outcome: string
}
```

---

## 4. Seed Variant (from business-flow)

A seed is a *test idea* without execution detail. It says "we should test X because of Y," not "here's the HTTP request."

```ts
type Seed = ScenarioBase & {
  kind_specific: never                      // base only
}
```

The `<feature>.seed.json` is the input artifact for both api-testing and e2e systems.

---

## 5. API Scenario Variant (from api-testing)

```ts
type ApiScenario = ScenarioBase & {
  endpoints: ApiCall[]                      // ordered HTTP calls
  data: {
    fixtures?: string[]                     // shared fixture file refs
    inline?: object                         // request bodies
  }
  assertions: Assertion[]                   // post-call verification
  preconditions?: ApiCall[]                 // setup calls
  cleanup?: ApiCall[]                       // teardown calls
}

type ApiCall = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"
  path: string                              // OpenAPI path template
  headers?: Record<string,string>
  query?: Record<string, string | number | boolean>
  body?: object | string
  expected_status: number | number[]        // e.g., 200 or [200, 201]
}

type Assertion = {
  kind: "status" | "schema" | "body-path" | "header" | "latency-ms" | "side-effect"
  target: string                            // e.g., "$.data.id"
  matcher: "equals" | "exists" | "regex" | "lt" | "gt" | "between" | "schema-ref"
  value?: unknown
  evidence?: Evidence[]                     // why this assertion
}
```

---

## 6. E2E Scenario Variant (from e2e)

```ts
type E2EScenario = ScenarioBase & {
  journey_id: string                        // grouping across scenarios
  steps: JourneyStep[]
  fixtures?: string[]                       // shared test data
  viewports?: ("desktop" | "tablet" | "mobile")[]
}

type JourneyStep = {
  step_id: string
  action: "navigate" | "click" | "type" | "wait" | "assert" | "intercept" | "scroll" | "select"
  selector?: string                         // role-based or testid preferred
  value?: string
  expected?: ExpectedState
  evidence?: Evidence[]
}

type ExpectedState = {
  url_pattern?: string
  visible_text?: string
  invisible_text?: string
  network?: { method: string, path_pattern: string, status: number }
  state_label?: string                       // matches state-machine state id
}
```

---

## 7. Shared Sub-Schemas

```ts
type Evidence = {
  source: string
  line_range?: [number, number]
  excerpt?: string
  confidence: "high" | "medium" | "low"
}
```

(Same as `business-flow-contract.md`. Centralized in `traceability-contract.md`.)

---

## 8. Hard Rules

1. Every scenario MUST have ≥1 `evidence` entry OR a `links_to.flow_step_ids` referencing an evidenced flow row.
2. Every `kind: "abuse-failure"` scenario MUST `links_to.risk_ids` referencing a risk of severity ≥ `high`.
3. Every `kind: "regression"` scenario MUST cite a prior incident or PR in `evidence`.
4. Scenario IDs MUST be unique within the artifact.
5. API scenarios MUST validate against the OpenAPI spec referenced by `input/api/`. Path templates must exist; expected statuses must be declared in the OAS.
6. E2E scenarios SHOULD use role-based selectors (e.g., `getByRole`) not implementation selectors (e.g., `.btn-primary`).

---

## 9. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter, JSON schema |
| `traceability-validator` | evidence/back-links exist and resolve |
| `consistency-validator` | risk↔abuse-failure coupling, OAS conformance, scenario ID uniqueness |
| `completeness-validator` | priority distribution sane (not 100% p0), kinds covered (≥1 happy, ≥1 edge for non-trivial flows) |

---

## 10. Lifecycle

```
business-flow → publishes seeds
                              ↓
                api-testing reads seeds + OAS
                              ↓
                publishes api scenarios
                              ↓
                              ↓ (parallel)
                e2e reads seeds + UI flows
                              ↓
                publishes e2e scenarios
```

api and e2e scenarios MUST reference seed_ids in `links_to.seed_ids` to maintain end-to-end traceability from business-flow to executable test.

---

## 11. Anti-Patterns

- Scenarios with `evidence: []` and no `links_to` → reject.
- Generic scenarios ("test happy path") without specific assertions → reject.
- Abuse-failure scenarios that don't reference a risk → reject.
- Path templates not present in OAS → reject.

---

## 12. Versioning

- 1.0 — initial.
- Adding a new `kind` → minor.
- Removing `kind`, renaming fields → major.
