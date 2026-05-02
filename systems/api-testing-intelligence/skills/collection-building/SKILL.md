---
skill_id: collection-building
system: api-testing-intelligence
version: 1.0
---

# Collection Building Skill

> Generate Postman collections honoring the per-status request rule.

## Steps

1. Read `oas-snapshot.json` (operation list).
2. For each operation, for each documented status:
   - Compose a request item with:
     - Name: `"{Verb Noun} — {CODE} {Label}"`
     - Method + URL with `{{BASE_URL}}` prefix and path params
     - Headers (auth + content-type + idempotency-key when relevant)
     - Body (from `07-data/<status>-samples.json`)
     - `pm.test` block: status assertion + schema-shape assertion
     - response[] populated with documented example
3. Group requests:
   - Folder per OAS tag
   - Subfolder per operation
   - Requests inside, ordered by status code ascending
4. Wire collection-level auth (variable: `{{ACCESS_TOKEN}}`).
5. Add collection-level pre-request script: token refresh + run-id setup.
6. Add collection-level test script: shared assertions (e.g., response time budget, content-type).
7. Validate against `api-postman-7d` rubric.

## Output

- `05-postman/full-api-collection.json`
- entry rows in `04-traceability/full-api-collection-traceability.md`
- entry rows in `04-traceability/status-code-coverage-matrix.md`

## Hard rules

- No hardcoded credentials
- response[] populated for every request
- Distinct test scripts per status (not duplicated)
- Naming convention enforced
- One Postman request per documented status per operation

## Used by

- agent: `api-collection-builder`
