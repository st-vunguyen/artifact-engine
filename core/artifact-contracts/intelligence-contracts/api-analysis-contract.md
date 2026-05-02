# API Analysis Contract

> **Contract ID:** `api-analysis-contract@1.0`
> **Producer:** `api-testing-intelligence`
> **Consumers:** `e2e-intelligence`, `regression-intelligence`, `reporting-mcp`

The API analysis artifact captures everything the API testing system learned about the OpenAPI surface: endpoints, status coverage, auth, pagination, contract issues, and a status-coverage matrix.

This contract reflects the canonical 10-folder output of the api-testing-tool reference, made cross-system consumable.

---

## 1. Artifact Files

```
shared-artifacts/api-analysis/<feature>.md                        ← human-readable summary
shared-artifacts/api-analysis/<feature>.json                      ← structured
shared-artifacts/api-analysis/<feature>.coverage-matrix.json      ← per-status × operation
shared-artifacts/api-analysis/<feature>.oas-snapshot.json         ← snapshot of input OAS
shared-artifacts/api-analysis/<feature>.review-findings.json      ← issues from spec review
```

The full Postman collections, env, data, performance configs are NOT cross-system — they live in `output/api-qc-packages/<feature>/` for direct consumption by Newman/CI.

---

## 2. Frontmatter

```yaml
---
contract: api-analysis-contract@1.0
producer: api-testing-intelligence
producer_run_id: <run-id>
feature: <feature-slug>
inputs_consumed:
  - input/api-specs/<file>.openapi.yaml
  - shared-artifacts/business-flows/<feature>.md
  - shared-artifacts/test-strategies/<feature>.md
  - shared-artifacts/risks/<feature>.json
generated_at: <ISO-8601>
checksum: sha256:<hex>
---
```

---

## 3. Top-Level JSON Shape

```json
{
  "summary": {
    "operations_total": 42,
    "operations_with_per_status_coverage": 38,
    "auth_schemes": ["bearer", "api-key"],
    "review_findings_count": 11,
    "contradictions_count": 0,
    "abuse_failure_scenarios_count": 23
  },
  "operations": [ /* Operation[] */ ],
  "coverage_matrix": [ /* CoverageRow[] */ ],
  "review_findings": [ /* ReviewFinding[] */ ],
  "auth_analysis": { /* AuthAnalysis */ },
  "pagination_filtering": { /* PaginationFilteringAnalysis */ },
  "contract_compliance": { /* ContractCompliance */ }
}
```

---

## 4. Operation Schema

```ts
type Operation = {
  operationId: string                 // from OpenAPI
  method: HttpMethod
  path: string
  summary?: string
  request_schema_ref?: string         // $ref into OAS components
  response_schemas: Record<status_code, schema_ref>
  auth_required: boolean
  auth_scopes?: string[]
  rate_limited: boolean
  pagination?: "offset" | "cursor" | "page" | "none"
  filtering?: string[]                // documented filter params
  status_codes_documented: number[]
  status_codes_covered: number[]      // from generated scenarios
  scenario_ids: string[]              // refs into scenarios/<feature>.api.json
  notes?: string
  evidence: Evidence[]
}
```

---

## 5. Coverage Matrix

```ts
type CoverageRow = {
  operationId: string
  status: number                      // e.g., 200, 400, 401, 429
  documented: boolean                 // is it in the OAS?
  has_scenario: boolean               // is there ≥1 scenario hitting this status?
  scenario_id?: string
  has_data_sample: boolean
  has_test_assertion: boolean
  status_kind: "happy" | "validation" | "auth" | "permission" | "conflict" | "rate-limit" | "server"
}
```

The coverage_matrix is the source of truth for "did we test this status?" Used by reporting-mcp to compute coverage %.

Per-status coverage is derived from the api-testing-tool's `07b-per-status-expansion.prompt.md` rule.

---

## 6. Review Findings

```ts
type ReviewFinding = {
  finding_id: string                  // "RF01"
  category: "lint" | "auth" | "pagination" | "patterns" | "snapshot-drift" | "contract" | "security"
  severity: "info" | "minor" | "major" | "critical"
  operation?: string                  // operationId if specific
  observed: string                    // what the agent saw
  inferred: string                    // what it implies
  source_evidence: Evidence[]         // OAS lines
  proposal?: string                   // safe fix proposal (DOES NOT mutate spec)
  proposal_path?: string              // path under output/.../proposals/
}
```

Per the api-testing-tool's `api-design.md` rule: findings live in `result/<slug>/01-review/`; proposals are *copies*, never replacements.

---

## 7. Auth Analysis

```ts
type AuthAnalysis = {
  schemes: AuthScheme[]
  scope_matrix: ScopeRow[]
  variations_covered: AuthVariation[]
}

type AuthScheme = {
  name: string                        // "bearerAuth", "apiKeyAuth"
  type: "http-bearer" | "http-basic" | "api-key" | "oauth2" | "openIdConnect"
  description: string
  evidence: Evidence[]
}

type ScopeRow = {
  scope: string                       // "orders:read", "orders:write"
  operations: string[]                // operationIds requiring this scope
}

type AuthVariation = {
  variation: "missing" | "malformed" | "expired" | "wrong-role" | "wrong-scope"
  covered: boolean
  scenario_ids: string[]
}
```

The api-testing-tool's `security.md` rule mandates coverage of all auth variations.

---

## 8. Hard Rules

1. Every Operation MUST have ≥1 entry in coverage_matrix per documented status.
2. Every CoverageRow with `has_scenario: false` for a documented status is a finding (severity ≥ minor).
3. Every Operation marked `auth_required: true` MUST have ≥4 auth-variation rows in coverage (missing, malformed, expired, wrong-role/scope).
4. Every ReviewFinding MUST cite OAS evidence.
5. The OAS snapshot MUST be a verbatim copy of the input spec at run time, NOT a modified version.

---

## 9. Cross-Artifact Use

| Consumer | What it uses |
|---|---|
| e2e-intelligence | Operation list to identify API touchpoints in journeys |
| regression-intelligence | coverage_matrix to compute regression scope when API changes |
| reporting-mcp | summary + coverage % for executive report |

---

## 10. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter + JSON schema |
| `consistency-validator` | scenario_ids exist; OAS snapshot matches input |
| `traceability-validator` | findings cite OAS lines |
| `completeness-validator` | every documented operation in matrix |

---

## 11. Versioning

- 1.0 — initial.
- 1.x — add fields (`error_response_examples_present`, `cors_analysis`).
- 2.0 — restructure operation model.
