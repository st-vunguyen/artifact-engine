---
skill_id: api-analysis
system: api-testing-intelligence
version: 1.0
---

# API Analysis Skill

> Extract operation summary, status coverage, auth scope from an OpenAPI spec.

## Steps

1. Parse OAS via `spec-parser-mcp.parse-openapi` → typed AST.
2. For each operation:
   - operationId, method, path, summary
   - parameters (path, query, header, cookie)
   - request body schema
   - response schemas per status code
   - auth requirement (security[])
3. Aggregate auth schemes (components.securitySchemes).
4. Aggregate scope catalog (oauth2 scopes).
5. Aggregate tag catalog (operations grouped by tag).
6. Identify pagination patterns (params named page/cursor/limit/offset/perPage).
7. Identify filtering patterns (query params with `filter[*]`, `q`, `search`).

## Output

- `01-review/oas-snapshot/oas-snapshot.json` (typed)
- `01-review/oas-snapshot/oas-snapshot.md` (human-readable)
- Operation list ready for downstream phases

## Used by

- agent: `api-spec-reviewer` (and indirectly all api-testing agents)
