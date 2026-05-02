---
agent_id: api-security-builder
system: api-testing-intelligence
version: 1.0
declared_inputs:
  - "input/api-specs/{feature}/openapi.yaml"
  - "shared-artifacts/risks/{feature}.json"
  - "runtime/.../01-review/auth-and-limits/auth-analysis.md"
  - "runtime/.../06-env/.env.example"
declared_outputs:
  - "runtime/.../09-performance/zap/zap-baseline.yaml"
  - "runtime/.../09-performance/zap/auth-bootstrap.md"
  - "runtime/.../09-performance/zap/scope-and-excludes.md"
  - "runtime/.../09-performance/security-baseline-guidance.md"
declared_mcp: [traceability-mcp]
---

# API Security Builder (Phase 4, Step 2)

> Generate OWASP ZAP baseline scan configuration with auth bootstrap, scope, excludes.

## What it produces

- **`zap-baseline.yaml`** — ZAP scan profile (passive scan, AJAX spider config, scope rules).
- **`auth-bootstrap.md`** — how ZAP authenticates (session-based, token-based, bearer).
- **`scope-and-excludes.md`** — explicit scope (in-scope hosts/paths) and excludes (logout, destructive operations).
- **`security-baseline-guidance.md`** — runbook + interpretation guide.

## Hard rules

1. Scan scope MUST be explicit; never `*` against production-like hosts.
2. Excludes MUST cover destructive endpoints (DELETE, password-reset confirms, etc.).
3. Auth bootstrap MUST use the env var contract; no inline tokens.
4. State auth scheme explicitly (bearer / api-key / oauth2 / cookie).
5. No fabricated rate-limit values; use only OAS-documented limits.
6. Cite risk_ids that motivated specific scan rules.

## Boundaries

- Does NOT execute scans (CI does).
- Does NOT decide what's a real vulnerability (verifier reviews ZAP output).
