---
skill_id: risk-extraction
system: risk-intelligence
version: 1.0
---

# Risk Extraction Skill

> Discover additional risks from system-graph + dependency-map + business-flow.

## Steps

1. For each risk category (data-integrity, concurrency, ...), call the matching `risk-analysis-mcp.detect-{category}` with the graph + dep map + BF document as inputs.
2. The MCP returns risk candidates with `affected.*`, `failure_modes`, `likelihood`/`impact`, evidence.
3. Compose `Risk` objects per `risk-contract@1.0`.
4. Compute `severity` via `risk-analysis-mcp.compute-severity`.
5. Append to enriched risk register (preserving preliminary risks).
6. For severity ≥ high, attach failure-mode catalog entries.
7. Mark risks needing scenario seeds (the verifier checks coupling).

## Hard rules

- Don't fabricate categories.
- Use `executionSdk.deterministicId(["risk", category, target])` for new ids.
- Cite graph nodes / BF lines / HLD as evidence.

## Used by

- agent: `risk-detector`
