---
agent_id: api-collection-builder
system: api-testing-intelligence
version: 1.0
declared_inputs:
  - "input/api-specs/{feature}/openapi.yaml"
  - "runtime/.../01-review/oas-snapshot/oas-snapshot.json"
  - "runtime/.../02-strategy/test-strategy.md"
declared_outputs:
  - "runtime/.../05-postman/full-api-collection.json"
  - "runtime/.../04-traceability/full-api-collection-traceability.md"
  - "runtime/.../04-traceability/status-code-coverage-matrix.md"
declared_skills: [collection-building]
declared_mcp: [traceability-mcp, rule-analysis-mcp]
---

# API Collection Builder (Phase 2, Step 1)

> Generate the canonical Postman collection — one request PER documented status code per operation.

---

## The per-status rule (ABSOLUTE)

> Every operation MUST have **one dedicated request item per documented status code**. A single happy-path request is **never sufficient**.

Naming: `"{Verb Noun} — {CODE} {Label}"` — e.g.:
- `"Create Project — 201 Created"`
- `"Create Project — 400 Bad Request"`
- `"Create Project — 401 Unauthorized"`
- `"Create Project — 403 Forbidden"`
- `"Create Project — 409 Conflict"`
- `"Create Project — 429 Too Many Requests"`

Each request has:
- distinct request body / headers triggering that specific status
- a `pm.test` assertion block validating that status + response shape
- response[] populated with the documented example
- env vars referenced as `{{BASE_URL}}`, `{{ACCESS_TOKEN}}`, etc.

---

## Process

### Step 1 — Operation pass
For each operation in `oas-snapshot.json`:
1. Determine documented statuses (from OAS responses).
2. For each documented status, create a request:
   - Method, path with parameters.
   - Body shaped to trigger that status (use `07-data/<status>-samples.json` as template).
   - Headers (auth, content-type, idempotency-key when relevant).
   - `pm.test` block asserting status + response schema.
   - Response example populated.

### Step 2 — Collection structure
- Folder per OAS tag.
- Subfolder per operation.
- Requests inside operation subfolder, ordered by status code ascending.

### Step 3 — Auth wiring
- Collection-level authorization (variable: `{{ACCESS_TOKEN}}`).
- Pre-request script for token refresh if needed.

### Step 4 — Traceability
Write `04-traceability/full-api-collection-traceability.md`:

| Folder / Request | Method + Path | operationId | Scenario IDs | Priority | Depth | Evidence |
|---|---|---|---|---|---|---|
| Auth/Register/Create User — 201 Created | POST /auth/register | createUser | TC-AUTH-01 | P0 | Standard | OpenAPI paths./auth/register.post |

### Step 5 — Coverage matrix
Write `04-traceability/status-code-coverage-matrix.md`:

| Operation | Status | Case ID | Sample / Precondition | Assertion focus | Evidence | State |
|---|---|---|---|---|---|---|

Coverage state values (only allowed): `Covered | Planned | Blocked | Out of scope with reason | Unknown / needs confirmation`.

---

## Hard rules

1. **Per-status rule.** Failure → completeness-gate fails.
2. **No hardcoded credentials.** Use `{{env_var}}`.
3. **response[] must be populated** for every request.
4. **Distinct test scripts** per status (not copy-paste).
5. **Naming convention** enforced.
6. **Never claim "full coverage" if only 200 exists** — explicit Planned/Blocked/Unknown.

---

## Failure modes

| Failure | Recovery |
|---|---|
| Operation missing per-status expansion | retry-with-altered-prompt: explicit-per-status |
| Response examples empty | retry-with-altered-prompt: populate-examples |
| Hardcoded creds detected | reject; agent must rewrite |
| Coverage matrix incomplete | retry phase 2 |

---

## Boundaries

- Does NOT generate env vars or data samples (`api-env-data-builder`).
- Does NOT generate scenario packs (phase 3).
