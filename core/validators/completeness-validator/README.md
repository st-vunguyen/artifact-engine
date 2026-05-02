# completeness-validator

> **Validator ID:** `completeness-validator`
> **Purpose:** verify that an artifact has all the required structural elements populated, beyond just being present.

The completeness-gate uses this validator. The validator is the implementation; the gate is the policy wrapper.

---

## 1. What it Checks

1. **Required outputs exist** — each glob in the workflow's `required_outputs` matches ≥1 file.
2. **Required sections present** — for `.md` artifacts, each required heading exists at the contract-declared level.
3. **Required fields populated** — for JSON artifacts, each required field is non-null and non-empty.
4. **Tables non-empty where required** — e.g., flow_table has ≥1 row when the contract requires it.
5. **No "TBD" / "TODO" / "see discussion"** — these are caught as completeness failures, not advisories.
6. **Section content is substantive** — minimum length thresholds (per contract; e.g., narrative > 200 chars).

---

## 2. Interface

```ts
interface CompletenessValidator {
  validate(scope: ValidationScope, contract: ContractDefinition, config: Config): CompletenessResult
  checkRequiredOutputs(scope, required_outputs): OutputCheckResult
  checkRequiredSections(file_path, contract): SectionCheckResult
  checkRequiredFields(file_path, contract): FieldCheckResult
  detectStubLanguage(file_path): StubResult            // TBD / TODO / "see discussion"
}
```

---

## 3. Output

```
runtime/.../<phase-id>/validators/completeness-validator/_aggregate.json
runtime/.../<phase-id>/validators/completeness-validator/<artifact>.json
```

Aggregate:

```json
{
  "status": "pass | fail",
  "missing_outputs": ["scenarios/regression.json"],
  "missing_sections": [{ "artifact": "business-flow.md", "section": "## State Machine" }],
  "empty_required_fields": [{ "artifact": "risks/checkout.json", "path": "$[0].mitigations" }],
  "stub_language_findings": [{ "artifact": "business-flow.md", "line": 412, "snippet": "TBD - confirm with PM" }]
}
```

---

## 4. Stub Language Detection

The validator scans for:

- "TBD", "TODO", "FIXME"
- "see chat", "see discussion", "see slack"
- "[placeholder]", "<placeholder>"
- "lorem ipsum"
- bare `???`

These are completeness failures (not advisories) because they indicate the agent didn't finish.

The proper alternative is a Gap entry (per business-flow-contract §8) — it encodes "we don't know yet" structurally.

---

## 5. Section Length Thresholds

Some contracts declare minimum substance:

```yaml
# inside business-flow-contract metadata
required_sections:
  - { name: "Summary", min_chars: 150 }
  - { name: "Narrative", min_chars: 400 }
  - { name: "State Machine", min_states: 2, min_transitions: 1 }
```

The validator enforces these.

---

## 6. Configuration

```yaml
gate_config:
  completeness-gate:
    completeness-validator:
      detect_stub_language: true
      enforce_min_chars: true
```

---

## 7. Performance

Scanning artifacts for sections, fields, and stub language is O(file size). Typical: < 2 seconds for a full run.

---

## 8. Output Use

The completeness-gate aggregates this validator's findings and emits the gate verdict. The verifier may add semantic completeness checks (e.g., "section is present but doesn't actually describe what it should").

---

## 9. Boundaries

Does NOT:
- Verify claim correctness (traceability-validator)
- Detect contradictions (consistency-validator)
- Apply rubrics (quality-depth-gate / rule-analysis-mcp)
- Mutate artifacts
