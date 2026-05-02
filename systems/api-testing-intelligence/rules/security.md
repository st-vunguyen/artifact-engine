# Security (System Rule)

> Auth, secrets, rate-limits, and safe-execution discipline.

## Auth coverage matrix (mandatory when evidence exists)

For every protected operation:

| Variation | Expected status |
|---|---|
| Unauthenticated | 401 (or documented equivalent) |
| Wrong scope / role | 403 |
| Malformed token / key | 401 or 403 |
| Expired / revoked / replay token | documented status |
| Forbidden cross-tenant access | documented denial status |

If any variation is not evidenced in the OAS, surface as a finding (not invented).

## Auth scheme specification (mandatory)

Every test pack MUST state the auth scheme explicitly:
- bearer
- API key
- basic auth
- oauth2 (with scopes)
- cookie session

If multiple schemes apply per operation, document the precedence.

## Secrets policy (absolute)

- Commit only `.example` files, template JSON, or placeholder values
- Never commit real tokens, session cookies, production URLs, real credentials
- Use `{{env_var}}` placeholders: `{{ACCESS_TOKEN}}`, `{{API_BASE_URL}}`, `{{CLIENT_SECRET}}`
- Never leak internal hostnames, staging URLs, callback URLs, one-time secrets

## Rate limits

- If the API publishes rate-limit headers (X-RateLimit-*, Retry-After), preserve evidence in test data
- Don't invent rate-limit values not in the OAS
- For 429 responses, document expected `Retry-After` semantics

## ZAP / DAST scanning

ZAP scan config in `09-performance/zap/`:
- **scope** — explicit hosts / paths
- **excludes** — destructive endpoints (DELETE on shared data, password resets, etc.)
- **auth bootstrap** — how ZAP authenticates (uses env var contract, no inline tokens)
- **raw outputs** in `10-reports/raw/security-baseline/`
- **curated** in `10-reports/security-baseline/<run-slug>/findings.md` distinguishing:
  - confirmed findings (with raw evidence)
  - false positives (with explanation)
  - triage items (need follow-up)
  - asset-config issues (vs target-system issues)

## Forbidden

- Claims of vulnerabilities without raw evidence
- Security guidance tied to a specific framework when the OAS doesn't dictate it
- Broadening scan scope beyond explicit permission
- Including production URLs in scan configs
- Aggressive scans (active scan / fuzzing) without explicit authorization

## Why

Security testing that's done badly is worse than not doing it — it gives false confidence. The discipline above keeps test outputs grounded in the spec and raw evidence, never in guesses.
