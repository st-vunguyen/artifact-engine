# Traceability Gate

> **Gate ID:** `traceability-gate`
> **Purpose:** verify that every claim in the artifact set has cited evidence, and that evidence is verbatim and reachable.

The traceability gate enforces the engine's evidence-driven principle. It is the gate most likely to catch fabrication.

---

## 1. Inputs

```ts
type TraceabilityGateInput = {
  scope: { phase_id, scoped_dir, run_id }
  produced: ProducedFile[]
  trace_matrix_path: string                    // shared-artifacts/traceability/<feature>.<system>.matrix.json
  config: {
    coverage_pass_threshold: number            // default 0.95
    coverage_conditional_threshold: number     // default 0.85
    enforce_verbatim_excerpts: boolean         // default true
    allow_low_confidence_count: number         // default Infinity (advisory only)
  }
}
```

---

## 2. Outputs

Standard `GateResult`. Findings prefixed `TR-`.

```ts
type TraceabilitySummary = {
  claims_total: number
  claims_with_evidence: number
  claims_unevidenced_with_reason: number
  claims_unevidenced_blocking: number
  evidence_coverage: number                    // 0..1
  weak_confidence_count: number
  excerpt_drift_count: number                  // verbatim mismatches
  unresolvable_locators_count: number
  status: "pass" | "conditional-pass" | "fail"
}
```

---

## 3. Checks Performed

### TR-01 — Trace matrix exists and validates against contract
The matrix file is present, parses, and conforms to `traceability-contract.md`. Missing matrix → fail.

### TR-02 — Coverage threshold
```
coverage = claims_with_evidence / (claims_total - claims_unevidenced_with_reason)
```
- coverage ≥ pass_threshold → pass
- conditional_threshold ≤ coverage < pass_threshold → conditional-pass (advisory)
- coverage < conditional_threshold → fail

### TR-03 — Verbatim excerpt verification
For each Evidence entry:
- Open `source` file
- Resolve locator (line_range / cell_ref / page / section_anchor)
- Confirm `excerpt` appears verbatim (allowing whitespace normalization)
- Mismatch → fail (excerpt-drift)

### TR-04 — Locator validity
- `source` exists
- `line_range` is within file bounds
- `cell_ref` parses and resolves
- `page` exists
- `section_anchor` resolves
Invalid locator → fail (unresolvable-locator)

### TR-05 — Unevidenced claims handling
For each TraceRow with `evidence: []`:
- If `unevidenced_reason ∈ ("gap-declared", "assumption-declared")` → ok (counted in `claims_unevidenced_with_reason`)
- Else → fail (uncited-claim)

### TR-06 — Confidence distribution
Count of `confidence: "low"` claims is reported. If `> allow_low_confidence_count`, advisory only.

### TR-07 — Anchor resolution
For each TraceRow's `claim_anchor`, resolve the anchor in `claim_artifact`. Failure → fail (unresolvable-anchor).

---

## 4. Outcomes

| Conditions | Verdict |
|---|---|
| TR-01..05 all pass; coverage ≥ pass_threshold | pass |
| TR-01..05 all pass; conditional_threshold ≤ coverage < pass_threshold | conditional-pass |
| Any of TR-01, TR-03, TR-04, TR-05, TR-07 fail | fail |
| TR-02 below conditional_threshold | fail |

---

## 5. Algorithm

```
1. Open trace_matrix
2. For each row:
     - if evidence == [] check unevidenced_reason (TR-05)
     - else for each Evidence:
         - check source exists (TR-04)
         - resolve locator (TR-04)
         - read excerpt at locator
         - compare verbatim (TR-03)
         - record verdict
3. Compute summary
4. Apply thresholds (TR-02)
5. Emit findings + result
```

---

## 6. Excerpt Verbatim Comparison

Normalization rules (in order):
1. Strip BOM
2. Collapse `\r\n` → `\n`
3. Collapse runs of horizontal whitespace to a single space
4. Trim leading/trailing whitespace per line

After normalization, the excerpt MUST appear as a contiguous substring of the source's normalized text within the locator window. Otherwise: drift.

Drift kinds:
- `paraphrase` — text different but conveying similar meaning
- `truncated` — partial match
- `typo` — minor difference (case, punctuation)
- `wrong-locator` — text exists in the source but at a different location

The gate emits the kind in findings to help the agent fix.

---

## 7. Reporting

Findings are emitted at row level:

```json
{
  "rule": "TR-03",
  "level": "fail",
  "row_id": "claim-042",
  "artifact": "runtime/.../03-generation/business-flow.md",
  "anchor": "flow-table:S07",
  "evidence_index": 1,
  "drift_kind": "paraphrase",
  "expected": "Order is created when payment succeeds.",
  "found_at_locator": "When payment is captured the order becomes active.",
  "remediation": "Re-quote the source verbatim or move this claim to a Gap entry."
}
```

---

## 8. Configuration

```yaml
gate_config:
  traceability-gate:
    coverage_pass_threshold: 0.95
    coverage_conditional_threshold: 0.85
    enforce_verbatim_excerpts: true
    allow_low_confidence_count: Infinity
```

Workflows MAY raise (never lower) the thresholds.

---

## 9. Performance

Verbatim verification reads source files. With cached file content per run, typical cost: O(claims) text searches. For 200 claims across 10 source files: < 5 seconds.

---

## 10. Recovery Hint

When traceability-gate fails on coverage, a useful recovery is `retry-with-altered-prompt` with `alteration: stricter-evidence`. The agent re-attempts with explicit "no claim without ≥2 cited sources" framing.

When traceability-gate fails on verbatim drift, retry with `alteration: literal-quoting`.

These are common patterns; workflows declare them.

---

## 11. Anti-Patterns

| Pattern | Why bad |
|---|---|
| Removing low-confidence claims to inflate coverage | Detected via comparison to prior runs (drift). |
| Citing the same Evidence for many unrelated claims | Doesn't pass verbatim check; targeted citations required. |
| Auto-promoting "assumption-declared" rows that should be claims | Verifier audit catches this in conditional-pass review. |

---

## 12. Boundaries

The traceability gate DOES NOT:
- Judge claim correctness (just citation existence and verbatim match)
- Detect contradictions (consistency-gate)
- Enforce domain rubrics (quality-depth-gate)
- Check completeness of structure (completeness-gate)

It is the citation enforcer.
