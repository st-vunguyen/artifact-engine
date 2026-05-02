# Business Flow Artifacts (System Rule)

> Domain rule. Extends `core/shared-rules/artifact-quality-rules.md` with business-flow-specific structure.

---

## 1. Required Artifact Set

A complete business-flow run produces:

```
01-source/normalized/*.md
01-source/manifest.json

02-analysis/business-flow-document.md          ← canonical 17-section
02-analysis/permissions.json
02-analysis/risk.json
02-analysis/scenario-seeds.md
02-analysis/state-machine.preliminary.json

03-generation/business-flow-mermaid.md
03-generation/flowchart.mmd
03-generation/swimlane.mmd
03-generation/state-diagram.mmd
03-generation/state-machine.json               ← finalized

04-traceability/<feature>.matrix.json

05-verification/report.md
05-verification/report.json
```

Missing any → completeness-gate fails.

---

## 2. The 17 Sections (canonical, in order)

| # | Section heading | Required |
|---|---|---|
| 1 | `## 1. Scope` | yes |
| 2 | `## 2. Source Inventory` | yes |
| 3 | `## 3. Summary` | yes |
| 4 | `## 4. Flow Table` | yes (≥1 row) |
| 5 | `## 5. Narrative` | yes |
| 6 | `## 6. Decisions and Exceptions` | yes |
| 7 | `## 7. Traceability` | yes |
| 8 | `## 8. Open Questions` | yes (may be empty list) |
| 9 | `## 9. Assumptions` | yes (may be empty) |
| 10 | `## 10. Gap Taxonomy` | yes |
| 11 | `## 11. State Machine` | yes (≥2 states + ≥1 transition for non-trivial features) |
| 12 | `## 12. Permissions` | yes (or "no access controls in scope" with evidence) |
| 13 | `## 13. Async Events` | yes (or "no async in scope" with evidence) |
| 14 | `## 14. Risk Hotspots` | yes |
| 15 | `## 15. Scenario Seeds` | yes (coupled with §14) |
| 16 | `## 16. Contradictions` | yes (may be empty) |
| 17 | `## 17. Validation Report` | yes |

Always start with `MODE=technical` on a line by itself.

---

## 3. Per-Section Quality Bars

### Section 4 — Flow Table
- Every row has columns: Step | Actor | Action | Decision | System | Outcome | Evidence
- ≥1 row required
- Action is imperative ("Submit cart", not "Submitting")
- Evidence column has clickable cite (file path + L# range)
- One action per row (no comma-separated multi-actions)

### Section 11 — State Machine
- ≥2 states for non-trivial features
- Every transition has a trigger (event, action, condition)
- Every state has on_enter/on_exit if side-effects exist
- Initial + terminal states declared

### Section 12 — Permissions
- Matrix with: Actor | Action | Resource | Allowed | Conditions
- Covers every actor in Section 4

### Section 14 — Risk Hotspots
- Every risk has: id, category, severity, evidence, mitigation hint
- Severity computed via likelihood × impact matrix (per `risk-contract.md`)

### Section 15 — Scenario Seeds
- Kinds: happy-path | edge-case | abuse-failure | regression
- **Coupling rule:** every Section 14 risk with severity ≥ high MUST have ≥1 abuse-failure seed referencing it via `links_to.risk_ids`

### Section 17 — Validation Report
- sections_present: 17
- sections_missing: []
- evidence_coverage: <0..1>
- gaps: <int>
- contradictions: <int>
- risk_to_seed_coverage: <0..1>

---

## 4. Coupling Rules

| Rule | Where | Enforced by |
|---|---|---|
| Risk↔Seed | §14 ↔ §15 | consistency-gate (CN-coupling-01) |
| State↔Transition | §11 | consistency-gate (CN-coupling-02) |
| Actor↔Permission | §4 ↔ §12 | consistency-gate (CN-coupling-03) |
| Frontmatter↔Body counts | frontmatter ↔ §10/§16/§17 | consistency-gate (CN-04) |

---

## 5. Gap and Assumption Discipline

When the source is silent:

- Use **Gap** entry (Section 10) with: id, category, topic, severity, what-to-ask
- Use **Assumption** entry (Section 9) with: id, statement, justification, risk-if-wrong

Forbidden:
- "TBD", "TODO", "see chat" — caught by completeness-validator

---

## 6. Identifier Discipline

- Flow steps: `S01`, `S02`, ... (zero-padded)
- States: kebab slugs (`pending`, `payment-failed`)
- Risks: `R01`
- Gaps: `G01`
- Scenarios: `SS01`
- Permissions rows: `P01`
- Async events: `AE01`
- Contradictions: `C01`

---

## 7. Forbidden Patterns

| Pattern | Why |
|---|---|
| Section heading without content | Stub language |
| Flow row missing evidence | Evidence rule |
| State machine not referenced in Mermaid | Cross-artifact inconsistency |
| Multiple actions per row | Granularity |
| Unicode emoji in artifact body | Naming conventions |
| Marketing language ("seamless", "robust") | Naming conventions |

---

## 8. Verification Rubric Reference

The quality-depth-gate runs `bf-17-section` rubric with required items:
- bf-r-01..17 (one per section)
- bf-r-coupling: risk↔seed
- bf-r-state-coherence: state machine integrity
- bf-r-mermaid-icons: every Mermaid node uses validated icon tokens

The full rubric is in `core/shared-rules/...` referenced from this file.

---

## 9. Cross-System Use

Once published, downstream systems consume:

| Consumer | Section consumed |
|---|---|
| system-intelligence | §4 (touchpoints), §13 (events) — to build system graph |
| risk-intelligence | §14 (preliminary risks) — to enrich with blast-radius |
| test-strategy-intelligence | §3, §4, §10, §14, §15 — for scope and priorities |
| api-testing-intelligence | §11, §15, §10 — for scenario expansion |
| e2e-intelligence | §4, §11, §15 — for journey extraction |

---

## 10. Why This Discipline Exists

Without it, business flows from AI become essays — confidently fluent, structurally inconsistent, evidentially weak. The 17-section structure forces the agent to think in tables, surface gaps, and cite sources. Downstream systems can then trust the model and produce reliable test plans.
