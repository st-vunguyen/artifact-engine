# Traceability Contract

> **Contract ID:** `traceability-contract@1.0`
> **Producer:** every system, every artifact-producing phase
> **Consumers:** validation-gates, verifier agents, reporting-mcp, audit

Traceability is the chain that links every generated claim back to a source line in `input/`. Without it, the engine cannot distinguish evidence from invention.

This contract defines:
1. The **Evidence** type used in every other contract.
2. The **Traceability Matrix** artifact emitted per run.

---

## 1. The Evidence Type (universal)

```ts
type Evidence = {
  source: string             // path under input/ or shared-artifacts/
  line_range?: [number, number]
  cell_ref?: string          // for spreadsheets, e.g., "Sheet1!B12"
  page?: number              // for PDFs
  section_anchor?: string    // for structured docs (e.g., "#permissions")
  excerpt: string            // verbatim text from source, ≤200 chars
  confidence: "high" | "medium" | "low"
}
```

Rules:
- `source` MUST be a path the engine can resolve. Outside-paths are forbidden.
- At least ONE locator field (`line_range`, `cell_ref`, `page`, `section_anchor`) MUST be present.
- `excerpt` MUST appear verbatim (allowing whitespace normalization) at the locator. Validators check this.
- `confidence` reflects the verifier's judgment on the citation, not the source's authority.

---

## 2. The Traceability Matrix Artifact

```
shared-artifacts/traceability/<feature>.<system>.matrix.json
```

```json
{
  "contract": "traceability-contract@1.0",
  "system": "business-flow-intelligence",
  "feature": "<feature-slug>",
  "run_id": "<run-id>",
  "generated_at": "<ISO-8601>",
  "checksum": "sha256:<hex>",
  "summary": {
    "claims_total": 142,
    "claims_with_evidence": 138,
    "claims_unevidenced": 4,
    "evidence_coverage": 0.972,
    "sources_referenced": 6,
    "sources_lines_cited": 211,
    "weak_confidence_claims": 9
  },
  "rows": [ /* TraceRow */ ]
}
```

```ts
type TraceRow = {
  claim_id: string                  // unique
  claim_kind: "flow-step" | "decision" | "transition" | "permission" | "async-event" |
              "risk" | "scenario" | "assertion" | "rule" | "other"
  claim_artifact: string            // file path
  claim_anchor?: string             // e.g., section + bullet id
  claim_text: string                // ≤200 chars
  evidence: Evidence[]              // 0..N — 0 means unevidenced
  unevidenced_reason?: "gap-declared" | "assumption-declared" | "missing"  // required if evidence=[]
  notes?: string
}
```

If `evidence: []` AND `unevidenced_reason !== "gap-declared" | "assumption-declared"`, validation FAILS.

---

## 3. Computing `evidence_coverage`

```
evidence_coverage = claims_with_evidence / claims_total
```

Both numerator and denominator exclude rows with `unevidenced_reason: "gap-declared" | "assumption-declared"` — those are explicitly labeled non-claims and don't count.

The orchestrator's traceability-gate uses this metric. Default thresholds (override per workflow):

- pass: `evidence_coverage >= 0.95`
- conditional-pass: `0.85 <= coverage < 0.95`
- fail: `coverage < 0.85`

---

## 4. Cross-Artifact Linking

Every claim references a `claim_artifact` + `claim_anchor`. Anchors are domain-specific:

| Domain | Anchor format |
|---|---|
| business-flow flow row | `flow-table:S01` |
| state-machine transition | `state-machine:transitions[3]` |
| permission row | `permissions:row[5]` |
| risk | `risks:R03` |
| scenario | `scenarios:SS07` |
| assertion (api/e2e) | `assertions:A12` |

The verification-mcp resolves anchors and validates them.

---

## 5. Multi-Source Evidence (consensus)

A single claim may cite MULTIPLE evidence entries. When sources agree, `confidence` may be raised; when they disagree, the producer MUST emit a Contradiction (per `business-flow-contract` §9), not silently merge.

---

## 6. The Excerpt Verbatim Check

The traceability-validator opens `evidence.source`, navigates to the locator, and confirms `evidence.excerpt` appears there (after whitespace normalization). If not:

- **Failure mode 1 — text not found:** the citation is invalid. Block the run.
- **Failure mode 2 — text found, but at a different location:** auto-correct the locator and emit advisory.

Verbatim citation prevents agents from "remembering" sources without rereading them.

---

## 7. Hard Rules

1. Every claim in every artifact MUST appear as a row in the matrix.
2. Every cited `source` MUST exist on disk at the time of the matrix generation.
3. Every cited `line_range` MUST be within the file's line count.
4. `excerpt` length MUST be ≤200 chars; longer ones are truncated with "…".
5. `confidence: "low"` claims MUST appear in the verification report's advisory findings.
6. Producer agents MUST cite while writing, not retrofit citations after.

---

## 8. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | matrix schema, frontmatter |
| `traceability-validator` | excerpt verbatim, locators valid, source files exist |
| `consistency-validator` | claim anchors resolve in their `claim_artifact` |
| `completeness-validator` | every claim represented in the matrix |

---

## 9. Generation Rule

Each phase that writes claims-bearing artifacts emits a partial matrix (`runtime/.../<phase>/trace.partial.json`). The orchestrator's `publish` phase merges partials into the final matrix.

This forces traceability to be an integral part of generation, not an afterthought.

---

## 10. Reporting Hooks

The reporting-mcp uses the matrix to:
- Compute `evidence_coverage` for the executive summary
- List unevidenced claims (rare but always reported)
- Show source line "heat map" (which spec lines are cited most)
- Surface low-confidence claims for stakeholder review

---

## 11. Versioning

- 1.0 — initial.
- 1.x — adding fields to `Evidence` or `TraceRow` (e.g., `language`, `last_modified`).
- 2.0 — changing required locator semantics, removing `confidence`.
