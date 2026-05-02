# Business Flow Contract

> **Contract ID:** `business-flow-contract@1.0`
> **Producer:** `business-flow-intelligence`
> **Consumers:** `api-testing-intelligence`, `e2e-intelligence`, `reporting-mcp`

The business-flow artifact is the canonical model of a feature's process: actors, steps, decisions, transitions, permissions, async events, and gaps. It is the foundation that downstream systems consume.

---

## 1. Artifact Files

A business-flow artifact for feature `<feature>` consists of:

```
shared-artifacts/business-flows/<feature>.md           ← human-readable, 17 sections
shared-artifacts/business-flows/<feature>.json         ← structured, machine-readable
shared-artifacts/state-machines/<feature>.json         ← state machine extract
shared-artifacts/state-machines/<feature>.mmd          ← Mermaid stateDiagram-v2
```

The `.md` is the source-of-truth document. The `.json` files are derived projections (the engine generates them from the document during the publish phase).

---

## 2. Required Frontmatter (`<feature>.md`)

```yaml
---
contract: business-flow-contract@1.0
producer: business-flow-intelligence
producer_run_id: <run-id>
feature: <feature-slug>
sources:
  - input/specs/<file>      # every source file used
generated_at: <ISO-8601>
checksum: sha256:<hex>
evidence_coverage: <0..1>   # fraction of claims with ≥1 cited source line
gaps: <int>                 # explicit gap items inside
contradictions: <int>       # explicit contradiction items inside
domain_pack: <slug>         # commerce | identity | finance | content | ops | other
---
```

If any frontmatter field is missing or malformed, consumers MUST refuse the artifact.

---

## 3. Required Sections (the canonical 17)

Every `<feature>.md` MUST contain these sections, in this order, with these heading levels (`##`):

| # | Section | Purpose |
|---|---|---|
| 1 | Scope | What's in/out, target audience, why this flow exists |
| 2 | Source Inventory | Every input file with line ranges referenced |
| 3 | Summary | One-paragraph description of the flow |
| 4 | Flow Table | Step-by-step table: actor, action, system, evidence |
| 5 | Narrative | Prose walkthrough; cites flow rows |
| 6 | Decisions | Decision points: condition, branches, evidence |
| 7 | Traceability | Step → source-line map (full coverage) |
| 8 | Open Questions | Things the spec doesn't answer |
| 9 | Assumptions | Inferred-but-not-stated facts (clearly labeled) |
| 10 | Gap Taxonomy | Categorized gaps (input, validation, error, perm, async, …) |
| 11 | State Machine | States, transitions, guards, side-effects |
| 12 | Permissions | Actor × action × resource matrix |
| 13 | Async Events | Triggers, listeners, retry/dead-letter |
| 14 | Risk Hotspots | Risky areas + severity + recommended mitigation |
| 15 | Scenario Seeds | Happy / edge / abuse / regression seeds (consumed by api-testing + e2e) |
| 16 | Contradictions | Cross-source contradictions (NOT silently resolved) |
| 17 | Validation Report | Self-assessment: completeness, evidence coverage, open issues |

A section may be empty *only* if it explicitly states "Not applicable for this feature because <reason>" with evidence. An entirely missing section is a gate failure.

---

## 4. Flow Table Row Schema

```ts
type FlowRow = {
  step_id: string         // "S01", "S02", ... unique within flow
  actor: string           // "Customer", "Backend", "Payment Service", ...
  action: string          // imperative, e.g., "Submits payment form"
  system: string          // "Web app", "Order API", "Stripe", ...
  preconditions?: string
  postconditions?: string
  evidence: Evidence[]    // ≥1 required; gap rows must use kind="gap" instead
  notes?: string
}

type Evidence = {
  source: string          // path under input/
  line_range: [number, number]
  excerpt: string         // ≤200 chars
  confidence: "high" | "medium" | "low"
}
```

A flow table MUST be a Markdown table. The schema applies to its underlying semantics; the rendering may use horizontal cells.

---

## 5. State Machine Schema (`<feature>.json` state-machine field & `state-machines/<feature>.json`)

```ts
type StateMachine = {
  states: State[]
  transitions: Transition[]
  initial: string             // state id
  terminal: string[]          // state ids
}

type State = {
  id: string                  // "pending", "approved", "cancelled", ...
  description: string
  on_enter?: string[]         // side-effects
  on_exit?: string[]
  evidence: Evidence[]
}

type Transition = {
  from: string                // state id
  to: string                  // state id
  trigger: string             // event or action
  guard?: string              // condition (e.g., "amount > 0")
  side_effects?: string[]
  evidence: Evidence[]
}
```

Validation rules:
- No orphan states (every state reachable from `initial` via some transition path).
- Every terminal state has no outgoing transitions.
- Every transition's `from` and `to` reference a declared state.
- Every transition has ≥1 `evidence` entry.

---

## 6. Scenario Seed Schema (Section 15)

```ts
type ScenarioSeed = {
  seed_id: string             // "SS01"
  kind: "happy-path" | "edge-case" | "abuse-failure" | "regression"
  title: string
  preconditions: string[]
  steps: string[]             // narrative
  expected: string
  links_to:
    risk_ids?: string[]       // back-link to risk hotspots
    flow_step_ids?: string[]  // back-link to flow rows
  evidence: Evidence[]
}
```

**Coupling rule (enforced):** every Risk Hotspot with severity `high` or `critical` MUST have ≥1 `kind: "abuse-failure"` ScenarioSeed referencing it via `links_to.risk_ids`.

---

## 7. Permissions Matrix (Section 12)

```ts
type Permission = {
  actor: string               // role / persona
  action: string
  resource: string
  allowed: boolean
  conditions?: string         // e.g., "owner only", "during business hours"
  evidence: Evidence[]
}
```

---

## 8. Gap Taxonomy (Section 10)

```ts
type Gap = {
  gap_id: string              // "G01"
  category: "input-validation" | "error-handling" | "permission" | "async-failure" |
            "data-integrity" | "ui-state" | "performance" | "security" | "other"
  topic: string
  why_unknown: string
  what_to_ask: string         // pointed question for the stakeholder
  severity: "info" | "minor" | "major" | "critical"
  evidence?: Evidence[]       // optional: anchor the absence
}
```

---

## 9. Contradictions (Section 16)

```ts
type Contradiction = {
  contradiction_id: string    // "C01"
  topic: string
  source_a: Evidence
  source_b: Evidence
  conflict: string            // describe the disagreement
  resolution: "unresolved" | "ask-stakeholder" | "rule-supersedes" | "deprecated-source"
  recommended_action: string
}
```

Silent resolution (picking one and dropping the other) is forbidden.

---

## 10. Validation Report (Section 17)

```ts
type ValidationReport = {
  sections_present: 17
  sections_missing: string[]    // MUST be []
  evidence_coverage: number     // 0..1
  flow_rows: number
  flow_rows_with_evidence: number
  gaps: number
  contradictions: number
  state_machine: { states: number, transitions: number, orphans: number }
  scenario_seeds: { happy: number, edge: number, abuse: number, regression: number }
  risk_to_seed_coverage: number // 0..1; high/critical risks with ≥1 abuse seed
}
```

---

## 11. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter, 17 sections present, schemas |
| `consistency-validator` | state-machine integrity, risk↔seed coupling, contradiction discipline |
| `traceability-validator` | every flow row + state + transition + permission has evidence |
| `completeness-validator` | gap taxonomy exists, validation report self-consistent |

---

## 12. Versioning

- 1.0 — initial release
- 1.x — backward-compatible additions (new optional fields, new gap categories)
- 2.0 — breaking (e.g., section reordering, removing a section)

Consumers should declare `accepts: business-flow-contract@^1.0`.
