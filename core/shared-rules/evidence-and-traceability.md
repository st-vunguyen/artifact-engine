# Evidence and Traceability — Shared Rule

> **Applies to:** every system, every agent, every artifact-producing phase.
> **Authority:** highest. This rule supersedes any system-local rule that contradicts it.

This rule defines the evidence-discipline that distinguishes the artifact engine from a "prompt that generates plausible text."

---

## 1. The Single Sentence

**No claim without a citation. No citation without a verbatim source line.**

---

## 2. What Counts as a "Claim"

A claim is any statement of fact in a generated artifact. Including:

- "The customer must confirm email before checkout."
- "Endpoint POST /orders returns 422 for missing `currency`."
- "User can transition from `pending` to `cancelled`."
- "This flow has 4 actors."
- "Payment service has a 30s timeout."

Non-claims (no citation needed):
- Section headings
- Structural scaffolding ("see below", "the next section describes…")
- Pure restatement of an explicitly cited claim earlier in the same artifact

---

## 3. Required Evidence Shape

```ts
type Evidence = {
  source: string                   // path under input/ (or shared-artifacts/)
  line_range?: [number, number]
  cell_ref?: string                // for spreadsheets
  page?: number                    // for PDFs
  section_anchor?: string
  excerpt: string                  // verbatim, ≤200 chars
  confidence: "high" | "medium" | "low"
}
```

(Fully defined in `core/artifact-contracts/traceability-contract.md`.)

---

## 4. The Three Evidence-Honest Outputs

When generating, an agent has exactly THREE valid options for any claim:

1. **Cite** — produce the claim with ≥1 evidence entry pointing to the source line.
2. **Gap** — declare the claim absent because the source doesn't say. Use the `Gap` schema (`business-flow-contract.md` §8). Do not invent.
3. **Assumption** — produce the claim, label it `assumption: true`, give a justification, and surface it in the artifact's "Assumptions" section. Used sparingly; assumptions accumulate technical debt.

A 4th option — "produce the claim without citation" — is forbidden. The traceability-validator rejects such artifacts.

---

## 5. Verbatim Excerpt Rule

The `excerpt` MUST appear verbatim at the cited locator. Whitespace normalization (collapsing runs of whitespace, trimming) is allowed; rewording is not.

The traceability-validator opens the source and checks. Failures are blocking.

This is intentional. Agents that "remember" the source's gist tend to drift; agents that re-read and quote stay grounded.

---

## 6. Source Hygiene

- Sources live in `input/` and `shared-artifacts/`. The engine refuses citations to anywhere else.
- Source files MUST be encoded as UTF-8 text or normalized into UTF-8 text by `spec-parser-mcp` before citation. Cite the normalized form, not the binary.
- The line-numbering used for `line_range` is the line number in the **normalized** corpus — `runtime/.../01-input/normalized/...`. The original file's path is recorded in the manifest; agents cite by normalized path so reproducibility is exact.

---

## 7. Forbidden Patterns

| Pattern | Why forbidden |
|---|---|
| `evidence: []` with a confident claim | Fabrication. |
| `excerpt` paraphrases the source | Drift; defeats verbatim check. |
| `source` outside `input/` or `shared-artifacts/` | Untracked, unverifiable. |
| Citing `input/specs/spec.md` without a `line_range` or other locator | "It says so somewhere" — useless for reviewers. |
| Citing the same evidence for 50 unrelated claims | Hand-waving. Each claim needs targeted evidence. |
| Confidence raised because the agent is "sure" | Confidence is set by the *evidence quality*, not the agent's confidence. |

---

## 8. Traceability Matrix Requirement

Every run produces a traceability matrix per `core/artifact-contracts/traceability-contract.md`. The matrix has one row per claim across all artifacts of the run, with all evidence and unevidenced reasons enumerated. The orchestrator's `traceability-gate` reads the matrix.

---

## 9. Coverage Thresholds

The default thresholds are:

- **pass:** evidence_coverage ≥ 0.95
- **conditional-pass:** 0.85 ≤ coverage < 0.95
- **fail:** coverage < 0.85

Any run with coverage < 0.85 is rejected. A run with 0.85 ≤ coverage < 0.95 ships with advisory findings on the unevidenced claims.

Workflows MAY raise (never lower) these thresholds in their workflow contract.

---

## 10. Re-citation on Re-run

Idempotency: if a workflow runs again on the same `input/` with the same producer code, it MUST produce the same evidence trails (down to excerpt text). Drift in citations between runs of unchanged inputs is a defect.

---

## 11. Where This Rule Is Enforced

| Layer | Enforcement |
|---|---|
| Generation | Agents are instructed to cite while writing (not retrofit). |
| Validation | `core/validators/traceability-validator/` checks excerpt verbatim, locator validity, source existence. |
| Verification | Verifier agents read the matrix and the artifacts side by side; flag drift. |
| Gating | `core/orchestrator/validation-gates/traceability-gate.md` — blocks promotion if coverage < threshold. |
| Reporting | `core/mcp/reporting-mcp/` summarizes coverage in REPORT.md. |

---

## 12. Why This Rule Exists

LLM agents are fluent. Fluency without grounding produces confident-sounding falsehoods. Source citation is the cheapest, most reliable way to keep an agent honest. Every line of this rule trades convenience for trustworthiness — that is the trade we want.
