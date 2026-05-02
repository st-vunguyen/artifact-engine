---
agent_id: api-env-data-builder
system: api-testing-intelligence
version: 1.0
declared_inputs:
  - "input/api-specs/{feature}/openapi.yaml"
  - "runtime/.../01-review/oas-snapshot/oas-snapshot.json"
  - "runtime/.../05-postman/full-api-collection.json"
declared_outputs:
  - "runtime/.../06-env/.env.example"
  - "runtime/.../06-env/environment-variable-contract.md"
  - "runtime/.../06-env/postman-env.json"
  - "runtime/.../07-data/200-samples.json"
  - "runtime/.../07-data/201-samples.json"
  - "runtime/.../07-data/400-samples.json"
  - "runtime/.../07-data/401-samples.json"
  - "runtime/.../07-data/403-samples.json"
  - "runtime/.../07-data/409-samples.json"
  - "runtime/.../07-data/429-samples.json"
  - "runtime/.../07-data/5xx-samples.json"
  - "runtime/.../04-traceability/data-driven-samples-mapping.md"
declared_skills: [env-and-data]
declared_mcp: [traceability-mcp]
---

# API Env + Data Builder (Phase 2, Step 2)

> Generate environment variables contract + status-case data samples to drive the Postman collection.

---

## Standard environment variables (canonical 26)

Per the api-testing-tool reference's `environment-variable-contract.md`:

| Variable | Required | Type | Set by | Used by | Notes |
|---|---|---|---|---|---|
| `BASE_URL` | Yes | string | Manual | All requests | Placeholder only in committed files |
| `USER_EMAIL` | Yes | string | Manual | Auth flows | Synthetic, never real |
| `USER_PASSWORD` | Yes | string | Manual | Auth flows | Never commit |
| `USER_EMAIL_B` | No | string | Manual | Multi-user flows | – |
| `USER_PASSWORD_B` | No | string | Manual | Multi-user flows | – |
| `ACCESS_TOKEN` | Yes | string | Login capture | Protected requests | – |
| `ACCESS_TOKEN_A` | No | string | Login capture | Multi-user | – |
| `ACCESS_TOKEN_B` | No | string | Login capture | Multi-user | – |
| `REFRESH_TOKEN` | No | string | Login capture | Token rotation | If supported |
| `RESOURCE_ID` | No | string | Response capture | CRUD flows | Domain-specific rename in real projects |
| `ETAG` | No | string | Response capture | Conditional updates | Optimistic concurrency |
| `CURSOR` | No | string | Response capture | Pagination | Follow-up fetches |
| `PAGE` | No | number | Manual | Pagination | – |
| `PAGE_SIZE` | No | number | Manual | Pagination | – |
| `SEARCH_TERM` | No | string | Manual | Search/filter | Synthetic |
| `READ_ONLY_MODE` | No | boolean | Manual | Prod-safe runs | – |
| `RUN_ID` | No | string | Helper-generated | Data isolation | – |
| ... | ... | ... | ... | ... | ... |

Domain-specific variables (e.g., `STRIPE_KEY`, `WORKSPACE_SLUG`) are appended per feature.

Output: `06-env/environment-variable-contract.md` (full table) + `06-env/.env.example` (placeholder values) + `06-env/postman-env.json`.

---

## Status-case data samples

For each status code that appears in the OAS, generate `07-data/<status>-samples.json`:

```json
{
  "status": 400,
  "description": "Validation failures",
  "samples": [
    {
      "case_id": "CREATE-USER-400-01",
      "operation": "POST /users",
      "request_body": { "email": "not-an-email" },
      "expected_response_match": { "error_code": "INVALID_EMAIL" },
      "evidence": "OpenAPI paths./users.post.responses.400 schema"
    }
  ]
}
```

Standard files:
- `200-samples.json`, `201-samples.json` (happy paths)
- `400-samples.json` (validation)
- `401-samples.json` (unauthenticated)
- `403-samples.json` (forbidden)
- `409-samples.json` (conflict / duplicate)
- `429-samples.json` (rate-limit; reference `Retry-After` header expectations)
- `5xx-samples.json` (if any 5xx documented)

Plus domain-specific:
- `auth-samples.json`, `projects-samples.json`, etc. — entity-shaped CRUD samples (per `data-driven-samples-mapping.md`)

---

## Data-driven samples mapping

Output: `04-traceability/data-driven-samples-mapping.md` — table mapping samples to operations, scenario groups, cleanup notes.

---

## Hard rules

1. **No real secrets.** `.env.example` only has placeholders.
2. **Synthetic data only.** No real PII, no production references.
3. **Status alignment.** Every documented status has a sample file.
4. **Cleanup discipline.** Each sample notes parent-child dependencies for teardown.
5. **Idempotency where possible.** `RUN_ID` prefixing for parallel-safe runs.

---

## Boundaries

- Does NOT generate the Postman collection itself (api-collection-builder).
- Does NOT execute (Newman/CI does).
