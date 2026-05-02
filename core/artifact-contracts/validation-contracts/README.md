# Validation Contracts

These contracts define the shape of validation results emitted by validators and gates. They are consumed by:

- the orchestrator (to decide pass/fail)
- verifier agents (to compose verification reports)
- reporting-mcp (to render dashboards)

---

## Files

| Contract | Purpose |
|---|---|
| `completeness-contract.md` | Output shape of `completeness-validator` and `completeness-gate` |
| `consistency-contract.md` | Output shape of `consistency-validator` and `consistency-gate` |
| `traceability-contract.md` | Output shape of `traceability-validator` and `traceability-gate` (full version in `core/artifact-contracts/traceability-contract.md`) |
| `quality-depth-contract.md` | Output shape of rubric runner and `quality-depth-gate` |

The full traceability contract — including the trace-matrix shape — lives at `../traceability-contract.md` because it's both a validation result type AND a first-class artifact (the trace matrix is shared cross-system).

---

## Common Result Shape

All validation contracts inherit a common envelope:

```ts
type ValidationResultEnvelope<T> = {
  validator_id: string
  scope: ValidationScope
  status: "pass" | "fail" | "skipped"
  duration_ms: number
  findings: T[]
  summary: object
}
```

Specific validators specialize `T` and `summary`.

---

## Wire Format

All validation results are written to:

```
runtime/<run-id>/<phase-id>/validators/<validator-id>/_aggregate.json
runtime/<run-id>/<phase-id>/validators/<validator-id>/<scope-key>.json
```

Gates aggregate validator results into `gates/<gate-id>.json`.

---

## See Also

- `core/validators/` — the validators themselves
- `core/orchestrator/validation-gates/` — the gates that consume them
