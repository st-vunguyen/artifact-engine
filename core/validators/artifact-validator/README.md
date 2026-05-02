# artifact-validator

> **Validator ID:** `artifact-validator`
> **Purpose:** validate any artifact's frontmatter, schema conformance, and naming-convention compliance against its declared contract.

This is the most-used validator. Every artifact-producing phase invokes it.

---

## 1. What it Checks

1. **Frontmatter present** — for `.md` artifacts; `__meta__` block for `.json` artifacts.
2. **Frontmatter required keys** — per contract.
3. **Frontmatter value types** — `contract` is a contract id string, `generated_at` is ISO-8601 UTC, `checksum` is `sha256:<hex>`, etc.
4. **Schema conformance** — validates the body of the artifact against the contract's JSON schema or markdown section structure.
5. **Naming conventions** — file path slug-safe, ids zero-padded, etc. (per `core/shared-rules/naming-conventions.md`).
6. **Encoding + line endings** — UTF-8, LF.
7. **Checksum match** — recomputes and verifies if frontmatter declares one.

---

## 2. Interface

```ts
interface ArtifactValidator {
  validate(file_path: string, contract_id: string): ArtifactValidationResult
  validateFrontmatter(file_path: string, contract_id: string): FrontmatterResult
  validateSchema(file_path: string, contract_id: string): SchemaResult
  validateNaming(file_path: string): NamingResult
}

type ArtifactValidationResult = {
  status: "pass" | "fail"
  findings: Finding[]
}

type Finding = {
  rule: string                       // "frontmatter-key-missing", "schema-type-mismatch", ...
  level: "fail" | "warn"
  detail: string
  path?: string                      // JSON pointer / heading anchor where failure occurred
  remediation?: string
}
```

---

## 3. Contract Resolution

Given a `contract_id` like `business-flow-contract@1.0`:

1. Resolve to `core/artifact-contracts/business-flow-contract.md`.
2. Extract the JSON schema and required-section list (each contract publishes both in machine-readable form).
3. Apply checks.

When contract not found → fail with reason `unknown-contract`.

---

## 4. Output Files

The validator writes its result to:

```
runtime/.../<phase-id>/validators/artifact-validator/<artifact-basename>.json
```

Aggregated by phase as:

```
runtime/.../<phase-id>/validators/artifact-validator/_aggregate.json
```

---

## 5. Usage by Gates

The completeness-gate and quality-depth-gate read aggregate results to decide pass/fail. Phase runners invoke this validator automatically when a phase declares `validators: ["artifact-validator"]` or whenever required outputs are produced.

---

## 6. Implementation Notes

- Idempotent: validating the same artifact twice produces identical results (modulo timestamps).
- No mutation: read-only on artifacts.
- Fast: typical artifact validation < 100ms.

---

## 7. Anti-Patterns

| Pattern | Why bad |
|---|---|
| Skipping artifact-validator on "trusted" artifacts | All artifacts are validated — no trust circle. |
| Auto-fixing frontmatter | Read-only; agents fix their own outputs. |
| Validating against the producer's expected contract instead of declared contract | Validator reads `frontmatter.contract`, not external assumption. |

---

## 8. Boundaries

The artifact-validator does NOT:
- Verify claim correctness (traceability-validator)
- Detect contradictions (consistency-validator)
- Apply rubrics (rule-analysis-mcp via quality-depth-gate)
