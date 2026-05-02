# traceability-validator

> **Validator ID:** `traceability-validator`
> **Purpose:** verify the trace matrix and per-artifact citations conform to the traceability contract.

This is the engine's evidence-discipline enforcement. It is invoked alongside the traceability-gate.

---

## 1. What it Checks

1. **Matrix presence + schema** — `shared-artifacts/traceability/<feature>.<system>.matrix.json` exists and conforms to `traceability-contract.md`.
2. **Per-row evidence shape** — every Evidence has source, locator, excerpt, confidence.
3. **Locator validity** — source file exists; line range within bounds; cell_ref / page / section_anchor resolve.
4. **Verbatim excerpt** — the excerpt text appears at the locator (whitespace-normalized).
5. **Anchor validity** — every TraceRow's `claim_anchor` resolves in the `claim_artifact`.
6. **Coverage computation** — recompute coverage from the matrix; compare to declared frontmatter (consistency).
7. **Unevidenced reason validity** — rows with `evidence: []` MUST have a valid `unevidenced_reason`.

---

## 2. Interface

```ts
interface TraceabilityValidator {
  validate(matrix_path: string, artifacts: ProducedFile[]): TraceabilityResult
  validateRow(row: TraceRow): RowResult
  resolveLocator(evidence: Evidence): LocatorResult
  verbatimMatch(source_text: string, excerpt: string, locator): boolean
}
```

---

## 3. Output

```
runtime/.../<phase-id>/validators/traceability-validator/<row-id>.json     (per row)
runtime/.../<phase-id>/validators/traceability-validator/_aggregate.json
```

Aggregate:

```json
{
  "status": "pass | fail",
  "rows_total": 142,
  "rows_pass": 138,
  "rows_fail": 4,
  "evidence_coverage": 0.972,
  "drift_count": 1,
  "unresolvable_locator_count": 0,
  "unauthorized_unevidenced_count": 3
}
```

---

## 4. Source File Caching

A typical run cites the same files many times. The validator caches normalized source text per file across the run; verbatim checks lookup the cache.

Invalidation: cache is per-run; new run re-reads.

---

## 5. Excerpt Verbatim Algorithm

```
function verbatimMatch(source, excerpt, locator):
  window = source[locator.start..locator.end]
  norm_source = normalize(window)
  norm_excerpt = normalize(excerpt)
  if norm_excerpt is contiguous substring of norm_source → true
  else if norm_excerpt is fuzzy-match (Levenshtein < threshold) → emit drift_kind: typo
  else if norm_excerpt found elsewhere in source → emit drift_kind: wrong-locator
  else if norm_excerpt is paraphrase of norm_source segment → emit drift_kind: paraphrase
  else → emit drift_kind: not-found
```

The validator's job is to classify the drift; the recovery engine decides what to do.

---

## 6. Output Schema (per row)

```json
{
  "row_id": "claim-042",
  "status": "fail",
  "rule": "TR-03-verbatim",
  "drift_kind": "paraphrase",
  "expected": "Order is created when payment succeeds.",
  "found_at_locator": "When payment is captured the order becomes active.",
  "evidence_index": 0
}
```

---

## 7. Performance

For 200 rows × ~2 evidence entries × file-cached lookups: typical < 5 seconds. The verbatim check is the bottleneck; aggressive caching essential.

---

## 8. Output Use

The traceability-gate uses the aggregate to compute coverage and decide pass/fail. The verifier surfaces drift findings in REPORT.md as `category: "traceability"` checks.

---

## 9. Boundaries

Does NOT:
- Decide if a claim is *true* (verifier agent)
- Mutate artifacts
- Add citations agents missed
