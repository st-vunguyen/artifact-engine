# Quality Depth Gate

> **Gate ID:** `quality-depth-gate`
> **Purpose:** apply domain rubrics to artifacts to verify they reach required depth, not just shape.

Where completeness asks "is the structure populated?" and traceability asks "are claims cited?", quality-depth asks "is the analysis deep enough?"

This gate runs domain rubrics defined in each system's rules.

---

## 1. Inputs

```ts
type QualityDepthGateInput = {
  scope: { phase_id, scoped_dir, run_id, system }
  produced: ProducedFile[]
  rubrics: Rubric[]                            // resolved from system rules
  config: {
    fail_on_required_below_threshold: boolean
    fail_on_optional_below_threshold: boolean
  }
}

type Rubric = {
  rubric_id: string
  applies_to: string                           // contract_id or artifact_kind
  required: RubricItem[]
  optional: RubricItem[]
  thresholds?: {
    required_pass_pct?: number                 // default 1.0 (all required must pass)
    optional_pass_pct?: number                 // default 0.0 (advisory only)
  }
}

type RubricItem = {
  item_id: string
  description: string
  check: RubricCheck                           // declarative or function ref
  evidence_required: boolean                   // gate provides extracted evidence
}
```

---

## 2. Outputs

Standard `GateResult`. Findings prefixed `QD-`.

```ts
type RubricResult = {
  rubric_id: string
  required_pass_count: number
  required_total: number
  optional_pass_count: number
  optional_total: number
  required_pass_pct: number
  optional_pass_pct: number
  failed_required: RubricItemResult[]
  failed_optional: RubricItemResult[]
}
```

---

## 3. Domain Rubrics (concrete examples)

### Business Flow — 17-section rubric

```yaml
rubric_id: bf-17-section
applies_to: business-flow-contract
required:
  - { item_id: bf-r-01, description: "Section 1 (Scope) present + non-empty" }
  - { item_id: bf-r-02, description: "Section 4 (Flow Table) has ≥1 row" }
  - { item_id: bf-r-04, description: "Section 11 (State Machine) has ≥2 states + ≥1 transition" }
  - { item_id: bf-r-05, description: "Section 14 (Risk Hotspots) — every high/critical risk has ≥1 abuse seed" }
  - { item_id: bf-r-08, description: "Section 17 (Validation Report) self-consistent" }
  - ... (one per section)
optional:
  - { item_id: bf-o-01, description: "Section 9 (Assumptions) — assumptions count ≤ 25% of total claims" }
  - { item_id: bf-o-02, description: "Section 13 (Async Events) — every event has retry policy" }
```

### API Testing — 7-dimension Postman rubric

```yaml
rubric_id: api-postman-7d
applies_to: postman-collection
required:
  - { item_id: api-r-01, description: "Per-status request coverage: every operation × every documented status" }
  - { item_id: api-r-02, description: "Naming convention: requests named per operationId pattern" }
  - { item_id: api-r-03, description: "Response examples populated for all responses[]" }
  - { item_id: api-r-04, description: "Test scripts present for every request" }
  - { item_id: api-r-05, description: "Auth env vars wired in collection-level auth" }
  - { item_id: api-r-06, description: "Error triggers (negative cases) per error response" }
  - { item_id: api-r-07, description: "Collection-level pre-request / test scripts present" }
optional:
  - { item_id: api-o-01, description: "Folder structure mirrors OpenAPI tags" }
```

### E2E — Journey graph rubric

```yaml
rubric_id: e2e-journey-graph
applies_to: e2e-journey-pack
required:
  - { item_id: e2e-r-01, description: "Every journey has ≥1 entry node and ≥1 outcome node" }
  - { item_id: e2e-r-02, description: "Every step has a role-based selector or testid" }
  - { item_id: e2e-r-03, description: "Every assertion anchored to expected state (URL, role+name, network, state-machine state)" }
  - { item_id: e2e-r-04, description: "Every fixture cited is reachable" }
  - { item_id: e2e-r-05, description: "Every regression journey cites a prior incident" }
  - { item_id: e2e-r-06, description: "Viewport coverage declared (or explicit 'desktop only' with reason)" }
```

---

## 4. Rubric Resolution

Rubrics live in `systems/<system>/rules/` and `core/shared-rules/`. The gate finds applicable rubrics by matching:
- artifact `contract` field
- or workflow declares the rubric explicitly

Multiple rubrics may apply to the same artifact (e.g., a generic "markdown discipline" + a domain-specific rubric).

---

## 5. Algorithm

```
For each rubric R applying to scope:
  For each item in R.required:
    Run check
    Record pass/fail with evidence
  For each item in R.optional:
    Run check
    Record pass/fail
  Compute pcts.

If any required.failure_count > 0 → fail (blocker: rubric-required-failed)
If optional pass_pct < threshold (when configured to fail) → fail (blocker: rubric-optional-below-threshold)
Else → pass (with advisories for optional failures)
```

---

## 6. Check Implementation

A rubric check can be:

1. **Declarative** — described in YAML, executed by a generic interpreter:
   ```yaml
   check:
     kind: "section-non-empty"
     section: "## State Machine"
     min_chars: 200
   ```
2. **MCP-driven** — invokes `core/mcp/rule-analysis-mcp/`:
   ```yaml
   check:
     kind: "mcp"
     server: "rule-analysis-mcp"
     tool: "evaluate-rubric-item"
     args: { item_id: "bf-r-04", artifact_path: "{artifact}" }
   ```
3. **Function-ref** — registered function:
   ```yaml
   check:
     kind: "function"
     ref: "core/validators/consistency-validator/check-state-machine-coherence"
   ```

The interpreter resolves and runs each check uniformly.

---

## 7. Outcomes

| Conditions | Verdict |
|---|---|
| All required items pass | pass |
| Any required item fails | fail (blocker) |
| Optional pass_pct ≥ threshold | pass (with advisories) |
| Optional pass_pct < threshold (when configured) | fail |

---

## 8. Configuration

```yaml
gate_config:
  quality-depth-gate:
    rubrics:
      - rubric_id: bf-17-section
      - rubric_id: bf-mermaid-icon-grounding
    fail_on_required_below_threshold: true
    fail_on_optional_below_threshold: false
```

---

## 9. Reporting

Findings include the failed rubric item, the rule reference, the artifact, and the extracted evidence (where the check looked):

```json
{
  "rule": "QD-bf-r-04",
  "level": "fail",
  "rubric": "bf-17-section",
  "item": "Section 11 (State Machine) has ≥2 states + ≥1 transition",
  "artifact": "runtime/.../03-generation/business-flow.md",
  "evidence": "section found with 1 state, 0 transitions",
  "remediation": "State Machine extraction is too thin; rerun analysis with explicit transition extraction or surface as gap if source doesn't describe state changes."
}
```

---

## 10. Recovery Coupling

Quality-depth failures often suggest specific alterations:
- Rubric on coverage → `retry-with-altered-prompt: stricter-evidence`
- Rubric on depth → `retry-with-altered-prompt: smaller-batch` (depth per item)
- Rubric on coupling (e.g., risk↔seed) → `retry-with-altered-prompt: request-disambiguation`

Workflows can declare these per-failure-kind.

---

## 11. Anti-Patterns

| Pattern | Why bad |
|---|---|
| Marking a required rubric item optional to "pass faster" | Hides depth issues; defeats the gate. |
| Empty rubrics for a system | Quality-depth gate effectively unused; surfaces in audit. |
| Rubric items that pass on cosmetics ("section heading exists") | Should be in completeness-gate; quality-depth checks substance. |

---

## 12. Boundaries

The quality-depth gate DOES NOT:
- Verify citation correctness (traceability-gate)
- Check structural completeness (completeness-gate)
- Enforce cross-artifact consistency (consistency-gate)

It runs domain rubrics — the substantive depth check.
