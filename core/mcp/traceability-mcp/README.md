# traceability-mcp

> **MCP server.** Evidence + citation engine. Used by every system, every claim.

---

## Purpose

Standardized claim → source citation. Auto-extracts verbatim excerpts; validates locators; builds the trace matrix.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `cite(args)` | `{ source, line_range \| cell_ref \| page \| section_anchor, claim_text? }` | `Evidence` (with verbatim excerpt auto-filled) |
| `validate-locator(evidence)` | `Evidence` | `{ valid: boolean, drift_kind?: enum }` |
| `build-matrix-row(claim, evidence)` | `{ claim, evidence[] }` | `TraceRow` |
| `compute-coverage(matrix)` | `Matrix` | `{ coverage, claims_total, claims_with_evidence, drift_count }` |
| `verbatim-match(source, excerpt, locator)` | as named | `{ match: boolean, drift_kind: enum }` |
| `merge-partial-matrices(partials)` | `partials: TraceMatrix[]` | full `TraceMatrix` |

---

## Drift kinds

Returned by `verbatim-match`:
- `paraphrase` — text differs in meaning-equivalent words
- `truncated` — partial match
- `typo` — minor diff (case/punctuation; Levenshtein < threshold)
- `wrong-locator` — text exists in source but at different location
- `not-found` — text absent

---

## Caching

Per-run normalized-source cache (file content keyed by checksum). Same evidence cited many times → one read.

---

## Hard rules

- Verbatim excerpt is auto-extracted; agents do NOT type excerpts manually (prevents drift)
- Source must be under `input/` or `shared-artifacts/`
- Locator validity checked at every cite

---

## Used by

- every artifact-producing agent in every system
- skill: `analysis-extraction` / `scenario-expansion` / etc.
- gate: `traceability-gate`
- validator: `traceability-validator`
