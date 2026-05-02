# Completeness Gate

> **Gate ID:** `completeness-gate`
> **Purpose:** verify that every required output exists and every contract-required section/field is populated.

A completeness check is the cheapest gate. Skipping it is the most common reason AI workflows ship "looks-right-but-empty" artifacts.

---

## 1. Inputs

```ts
type CompletenessGateInput = {
  scope: { phase_id, scoped_dir, contract?: string }
  required_outputs: string[]                  // glob patterns from workflow phase
  contracts: ContractDefinition[]             // for each artifact in scope
  config: {
    allow_empty_optional_sections: boolean    // default: false
    extra_paths_allowed: boolean              // default: true (extra files OK)
  }
}
```

---

## 2. Outputs

```ts
type GateResult = {
  gate_id: "completeness-gate"
  status: "pass" | "fail"
  duration_ms: number
  findings: Finding[]
  blocker?: Blocker
  details: string
}
```

```ts
type Finding = {
  level: "info" | "warn" | "fail"
  rule: string                                // e.g., "required-output-missing"
  artifact: string
  detail: string
  remediation?: string
}
```

---

## 3. Checks Performed

### C-01 — Required outputs exist
For each glob in `required_outputs`, scan `scoped_dir` and accumulated artifacts. Each glob must match ≥1 file. Empty match → fail.

### C-02 — Required sections present
For each artifact under a contract that defines `required_sections`, verify those sections are present at the declared heading levels. Missing section → fail.

### C-03 — Required fields populated
For each artifact under a contract with `required_fields`, verify each is non-null, non-empty. Empty field → fail (unless the field is opt-out via "Not applicable for this feature because <reason>" pattern from `business-flow-contract`).

### C-04 — Required frontmatter complete
For markdown artifacts: frontmatter exists, all contract-required keys present.
For JSON artifacts: top-level metadata fields present per contract.

### C-05 — No empty arrays where contract requires content
e.g., business-flow flow_table must have ≥1 row; permissions matrix may be empty (with explicit "no access controls" note); risks may be empty (with explicit "no high-impact risks identified" note).

The contract declares which empties are permitted.

---

## 4. Outcomes

| Outcome | Verdict |
|---|---|
| Any C-01 fails | fail (blocker: missing-required-output) |
| Any C-02 fails | fail (blocker: missing-required-section) |
| Any C-03 fails | fail (blocker: empty-required-field) |
| Any C-04 fails | fail (blocker: invalid-frontmatter) |
| Any C-05 fails | fail (blocker: empty-required-collection) |
| All pass + warnings only | pass with advisories |

---

## 5. Blocker Schema

```ts
type Blocker = {
  blocker_id: string
  reason: string
  affected_artifacts: string[]
  remediation: string
  raised_by: "completeness-gate"
}
```

Example:

```json
{
  "blocker_id": "completeness-001",
  "reason": "missing-required-section: section 11 (State Machine) absent in business-flow.md",
  "affected_artifacts": ["runtime/.../03-generation/business-flow.md"],
  "remediation": "Re-run 02-analysis with State Machine extraction; verify the agent emitted Section 11."
}
```

---

## 6. Configuration

Workflows configure the gate per-phase:

```yaml
phases:
  - id: 03-generation
    gates: ["completeness-gate"]
    gate_config:
      completeness-gate:
        allow_empty_optional_sections: false
```

---

## 7. Cumulative Mode

Sometimes a phase produces only part of a multi-file artifact pack; completeness across phases is needed. The gate supports cumulative mode:

```yaml
gate_config:
  completeness-gate:
    cumulative: true
    cumulative_required_outputs:
      - "shared-artifacts/business-flows/<feature>.md"
      - "shared-artifacts/state-machines/<feature>.json"
      - "shared-artifacts/risks/<feature>.json"
```

In cumulative mode the gate scans accumulated produced artifacts (not just `scoped_dir`).

---

## 8. Performance

Completeness checks are O(N) over file paths and O(M) over contract sections. Typical run: < 1 second per gate invocation. The gate is designed to be cheap because it runs frequently.

---

## 9. Integration With Verifier Agent

The verifier agent reads gate results from `runtime/.../<phase>/gates/completeness-gate.json` and incorporates them as `category: "completeness"` checks in its verification report.

The gate is mechanical; the verifier may add semantic completeness checks (e.g., "section is present but says 'TBD'" — which is a quality-depth-gate concern).

---

## 10. Anti-Patterns

| Pattern | Why bad |
|---|---|
| "Required output exists but is empty" | Completeness checks file existence + populated content where the contract demands. |
| "Required section is just the heading" | C-03 catches empty content. |
| Workflow declares fewer required outputs than the contract demands | Audit by validator-of-validators (lint at workflow registration). |
| Auto-creating empty stubs to satisfy the gate | Gate verifies populated content; stubs are caught. |

---

## 11. Boundaries

The completeness gate DOES NOT:
- Verify claim correctness (that's traceability-gate + verifier)
- Check for contradictions (consistency-gate)
- Apply domain rubrics (quality-depth-gate)

It only checks "is the structure there and filled in."
