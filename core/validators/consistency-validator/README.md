# consistency-validator

> **Validator ID:** `consistency-validator`
> **Purpose:** verify cross-artifact alignment, coupling rules, and frontmatter↔body coherence.

Where artifact-validator checks one artifact in isolation, consistency-validator checks the whole produced set together.

---

## 1. What it Checks

1. **Cross-reference resolution** — every id referenced in artifact A exists in artifact B.
2. **Coupling rules** — risk↔seed, state↔transition, actor↔permission, scenario↔risk, scenario↔OAS.
3. **Frontmatter↔body counts** — `evidence_coverage`, `gaps`, `contradictions` declared in frontmatter match recomputed values.
4. **Cross-system stale-reference** — when consuming a shared-artifact, ids referenced exist in the consumed version.
5. **Producer uniqueness** (when validating the publish step) — no two systems writing same shared kind.

---

## 2. Interface

```ts
interface ConsistencyValidator {
  validate(scope: ValidationScope): ConsistencyResult
  validateCoupling(scope, rule_set): CouplingResult
  validateCrossReferences(scope): CrossRefResult
  validateFrontmatterBodyAlignment(file_path): FrontmatterAlignmentResult
}

type ValidationScope = {
  run_id: string
  produced: ProducedFile[]
  shared_inputs: ResolvedSharedRef[]
}
```

---

## 3. Coupling Rules (catalog)

```ts
const couplingRules = [
  {
    id: "risk-seed-coupling",
    description: "Every risk severity ≥ high has ≥1 abuse-failure scenario seed referencing it",
    sources: ["risks/*.json", "business-flow.md#section-15", "scenarios/*.seed.json"]
  },
  {
    id: "state-transition-integrity",
    description: "Every transition's from/to states are declared",
    sources: ["state-machines/*.json"]
  },
  {
    id: "actor-permission-coverage",
    description: "Every actor in flow_table has at least one permissions row",
    sources: ["business-flow.md#section-4", "business-flow.md#section-12"]
  },
  {
    id: "scenario-OAS-conformance",
    description: "Every API scenario endpoint matches an OAS path+method",
    sources: ["scenarios/*.api.json", "input/api/openapi.yaml"]
  },
  {
    id: "scenario-seed-traceability",
    description: "Every api/e2e scenario references a seed_id from the seeds artifact",
    sources: ["scenarios/*.seed.json", "scenarios/*.api.json", "scenarios/*.e2e.json"]
  }
]
```

The list is extensible; systems add domain-specific coupling rules in their rules folder, and the validator picks them up via system registration.

---

## 4. Output

```
runtime/.../<phase-id>/validators/consistency-validator/<rule-id>.json
runtime/.../<phase-id>/validators/consistency-validator/_aggregate.json
```

Aggregate format mirrors GateResult:

```json
{
  "status": "pass | fail",
  "by_rule": { "risk-seed-coupling": "pass", "state-transition-integrity": "fail" },
  "findings": [...]
}
```

---

## 5. Cross-System Validation

When `shared_inputs` is non-empty, the validator additionally checks that any reference in the run's produced artifacts to ids from those shared inputs still resolves. This detects stale-reference issues when the producer's artifact has been re-published since the consumer started.

---

## 6. Performance

- Build an index of (artifact, id) pairs once per run.
- Resolve references via index lookup (O(1) per reference).
- Coupling rules typically O(N) per rule.

Total cost for a typical run: < 5 seconds.

---

## 7. Output Use

The consistency-gate consumes the aggregate file directly. The verifier may pull individual rule outputs into its `category: "consistency"` checks for surfacing in REPORT.md.

---

## 8. Boundaries

Does NOT:
- Verify individual claim correctness
- Modify artifacts
- Apply domain rubrics (rule-analysis-mcp does)

It only checks cross-artifact alignment.
