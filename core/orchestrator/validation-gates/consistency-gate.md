# Consistency Gate

> **Gate ID:** `consistency-gate`
> **Purpose:** ensure cross-artifact alignment within a run and detect undeclared contradictions.

Generated artifacts often refer to each other (state ids, actor names, operationIds, scenario links). Consistency means those references resolve and disagreements are explicit, not silent.

---

## 1. Checks Performed

### CN-01 — Cross-reference resolution
For every reference between artifacts, verify the target exists.

| Reference kind | Source → target | Failure |
|---|---|---|
| Flow row state | `flow.state_id` → state-machine state | unknown-state |
| Flow row actor | `flow.actor` → permissions matrix actor | unknown-actor |
| Risk affected.flow_step_ids | → flow row | unknown-flow-step |
| Scenario seed.links_to.risk_ids | → risk register | unknown-risk |
| Scenario seed.links_to.flow_step_ids | → flow row | unknown-flow-step |
| API scenario.endpoints[].path | → OpenAPI spec | unknown-endpoint |
| E2E step.expected.state_label | → state-machine state | unknown-state |

### CN-02 — Undeclared contradictions
For claims that cite multiple sources:

```
group claims by (subject, predicate)
for each group:
  if sources disagree on the value:
    if a Contradiction entry exists (per business-flow-contract §9) → ok
    else → fail (silent-contradiction)
```

### CN-03 — Coupling rules
- Risk ≥ `high` → must have ≥1 abuse-failure ScenarioSeed in `links_to.risk_ids`
- Risk ≥ `high` → must have ≥1 mitigation
- Every `transitions[].from`/`to` references a declared state
- Every initial state is declared; every terminal state is declared and has no outgoing transitions
- Every Permission entry references actors/actions/resources declared elsewhere in the artifact

### CN-04 — Frontmatter ↔ body alignment
- `evidence_coverage` claimed in frontmatter matches recomputed coverage from traceability matrix
- `gaps` count matches in-document gap entries
- `contradictions` count matches in-document contradiction entries

### CN-05 — Cross-system alignment (when applicable)
When the run consumes a `shared-artifact`:
- Referenced ids in the consumed artifact still exist in the producer's published version
- The contract version matches the consumer's accepted range

---

## 2. Inputs

```ts
type ConsistencyGateInput = {
  scope: { phase_id, scoped_dir, run_id }
  contracts: ContractDefinition[]
  cross_artifacts: ProducedFile[]              // accumulated across run
  shared_inputs: ResolvedSharedRef[]
  config: {
    treat_missing_contradiction_section_as_fail: boolean   // default true
  }
}
```

---

## 3. Outputs

Standard `GateResult` (see `completeness-gate.md` §2). Findings have rule ids prefixed `CN-`.

---

## 4. Detection of Silent Contradictions

The gate uses the traceability matrix:

```
for each TraceRow with multiple Evidence:
  Build claim signature: (artifact + anchor + claim_text_normalized)
  If two evidence entries' excerpt_text disagree on a value (numbers, statuses, names):
    flag as candidate contradiction
For each candidate:
  Look up Contradictions section in the producing artifact
  If a Contradiction entry covers the candidate's subject → ok
  Else → emit finding: silent-contradiction
```

Heuristics for "disagree":
- numerical values differ by > 0
- state ids differ
- boolean values differ
- enum values differ (after normalization)

False positives are tolerable; the gate output goes to the verifier for review.

---

## 5. Coupling Rule Enforcement

The gate has a hardcoded list of cross-contract coupling rules:

```ts
const couplingRules = [
  {
    id: "CN-coupling-01",
    description: "high-severity risks must link to abuse-failure scenarios",
    check: (risks, scenarios) => risks
      .filter(r => r.severity in ["high", "critical"])
      .every(r => scenarios.some(s =>
         s.kind === "abuse-failure" && s.links_to?.risk_ids?.includes(r.risk_id)))
  },
  {
    id: "CN-coupling-02",
    description: "every state-machine transition references declared states",
    check: (sm) => sm.transitions.every(t =>
       sm.states.some(s => s.id === t.from) &&
       sm.states.some(s => s.id === t.to))
  },
  // ...
]
```

Each rule corresponds to a specific blocker kind.

---

## 6. Cross-System Consistency

When a run consumes a shared artifact:

```
for each consumed artifact:
  for each id referenced by the current run that came from this artifact:
    if id not in consumed artifact → fail (stale-reference)
  if consumed artifact's contract version is newer than declared accepted range:
    warn (consumer-stale)
```

---

## 7. Outcomes

| Outcome | Verdict |
|---|---|
| Any CN-01 fails | fail (blocker: cross-reference-broken) |
| Any CN-02 fails | fail (blocker: silent-contradiction) |
| Any CN-03 fails | fail (blocker: coupling-violation) |
| Any CN-04 fails | fail (blocker: frontmatter-body-mismatch) |
| Any CN-05 fails | fail (blocker: cross-system-inconsistent) |
| All pass | pass |

---

## 8. Configuration

```yaml
gate_config:
  consistency-gate:
    treat_missing_contradiction_section_as_fail: true
    relaxed_coupling_rules: []          # rule ids to downgrade to advisory; rare
```

Relaxing a coupling rule is logged and surfaced in REPORT.md.

---

## 9. Performance

Cross-reference resolution is O(N×M) where N is references and M is targets per kind. With indexing, typical run < 5s. Coupling rules are O(N) per artifact.

---

## 10. Integration With Verification

The consistency gate feeds the verifier's `category: "consistency"` checks. The verifier may add deeper semantic consistency analyses (e.g., "two flow rows describe the same step using different actors") that the gate cannot mechanically detect.

---

## 11. Anti-Patterns

| Pattern | Why bad |
|---|---|
| "Pick the first source when sources disagree" | Silent contradiction; gate fails. |
| "Add the missing risk reference automatically" | Gate is read-only; agents must do their own work. |
| Coupling rules turned off because "they're noisy" | The rules exist because cross-cutting bugs hide there. |

---

## 12. Boundaries

The consistency gate DOES NOT:
- Verify individual claim accuracy (traceability-gate)
- Apply domain rubrics (quality-depth-gate)
- Check whether artifacts are well-shaped (completeness-gate)

It only checks "do they agree with each other."
