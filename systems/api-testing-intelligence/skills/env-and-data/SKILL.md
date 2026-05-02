---
skill_id: env-and-data
system: api-testing-intelligence
version: 1.0
---

# Env + Data Skill

> Build the environment variable contract + status-case data samples.

## Steps

1. Compose canonical 26-variable contract (`environment-variable-contract.md`).
2. Add domain-specific variables based on OAS (e.g., `WORKSPACE_SLUG`, `STRIPE_KEY`).
3. Generate `.env.example` with placeholder values.
4. Generate `postman-env.json` for Postman runner.
5. For each documented status code (200/201/400/401/403/409/429/5xx):
   - Generate `07-data/<status>-samples.json` with case_id, request_body, expected_response_match, evidence
6. Write `04-traceability/data-driven-samples-mapping.md`.

## Output

- `06-env/environment-variable-contract.md`
- `06-env/.env.example`
- `06-env/postman-env.json`
- `07-data/<status>-samples.json` (one file per documented status)
- `04-traceability/data-driven-samples-mapping.md`

## Hard rules

- Synthetic data only (no real PII)
- No real secrets in committed files
- Status alignment: every documented status has a sample file
- Cleanup notes per sample (parent-child dependencies)

## Used by

- agent: `api-env-data-builder`
