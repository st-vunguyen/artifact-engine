# Traceability Standards

> Pointer to the canonical contract + rule.

- Contract: [core/artifact-contracts/traceability-contract.md](../../core/artifact-contracts/traceability-contract.md)
- Rule: [core/shared-rules/evidence-and-traceability.md](../../core/shared-rules/evidence-and-traceability.md)

## Quick rules

1. Every claim has ≥1 cited Evidence, OR an explicit unevidenced_reason ∈ {gap-declared, assumption-declared}.
2. Every Evidence has source + locator + verbatim excerpt (auto-extracted by `traceability-mcp`).
3. Every run produces a trace matrix at `shared-artifacts/traceability/<feature>.<system>.matrix.json`.
4. Coverage thresholds: pass ≥ 0.95, conditional 0.85–0.95, fail < 0.85. Workflows MAY raise; never lower.
5. Verbatim drift kinds: paraphrase, truncated, typo, wrong-locator, not-found.

## Allowed locator forms

- `line_range: [number, number]`
- `cell_ref: "Sheet1!B12"` (spreadsheets)
- `page: number` (PDFs)
- `section_anchor: "#permissions"` (structured docs)

At least ONE locator must be present per Evidence.

## See also

- [traceability-mcp](../../core/mcp/traceability-mcp/README.md)
- [traceability-validator](../../core/validators/traceability-validator/README.md)
- [traceability-gate](../../core/orchestrator/validation-gates/traceability-gate.md)
