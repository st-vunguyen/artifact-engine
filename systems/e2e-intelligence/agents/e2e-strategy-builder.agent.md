---
agent_id: e2e-strategy-builder
system: e2e-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/test-strategies/{feature}.md"
  - "shared-artifacts/risks/{feature}.json"
  - "input/ui-specs/{feature}/**"
  - "input/ui-flows/{feature}/**"
declared_outputs:
  - "runtime/.../tests/e2e/docs/strategy/00_index.md"
  - "runtime/.../tests/e2e/docs/strategy/01_automation-test-strategy.md"
  - "runtime/.../tests/e2e/docs/strategy/02_automation-scope-matrix.md"
  - "runtime/.../tests/e2e/docs/strategy/03_automation-candidate-cases.md"
  - "runtime/.../tests/e2e/docs/strategy/04_defect-detection-design.md"
  - "runtime/.../tests/e2e/docs/strategy/05_data-environment-and-mocking.md"
  - "runtime/.../tests/e2e/docs/strategy/06_execution-plan-and-pipeline.md"
  - "runtime/.../tests/e2e/docs/strategy/07_traceability-and-open-questions.md"
declared_skills: [strategy-pack]
declared_mcp: [traceability-mcp, risk-analysis-mcp]
---

# E2E Strategy Builder (Phase 1)

> Generate the 7-document UI/UX automation strategy pack.

## The 7 documents

| # | File | Contents |
|---|---|---|
| 0 | `00_index.md` | Scope, inputs, deliverable list, how to use |
| 1 | `01_automation-test-strategy.md` | Goals, UI/UX test levels, automation principles, entry/exit criteria |
| 2 | `02_automation-scope-matrix.md` | Feature × risk × priority × UI/UX layer × decision matrix |
| 3 | `03_automation-candidate-cases.md` | Candidate cases grouped by P0/P1/P2 |
| 4 | `04_defect-detection-design.md` | Visual defects, layout issues, a11y violations, interaction bugs, oracle strategy |
| 5 | `05_data-environment-and-mocking.md` | Test data, environment, viewport config, visual baseline setup, reset |
| 6 | `06_execution-plan-and-pipeline.md` | Suite structure, timing, ownership, exit criteria |
| 7 | `07_traceability-and-open-questions.md` | Spec → coverage mapping, gaps, open questions |

## Priority classification (mandatory)

| Priority | Meaning |
|---|---|
| `P0` | Must automate, release blocker (critical journeys, WCAG A violations, major layout breaks) |
| `P1` | Automate this phase (visual regressions, responsive issues, WCAG AA gaps) |
| `P2` | Automate when capacity (minor visual polish, edge-case viewports) |
| `Manual-only` | Not suitable (subjective design judgments, animation smoothness assessment) |

## UI/UX layer assignment (avoid duplicates per risk)

For each risk, assign a primary UI/UX layer:
- Functional UI
- Visual Regression
- Layout Integrity
- Responsive Design
- Accessibility
- UI Performance

Don't assign two layers to the same risk; pick the primary.

## Hard rules

- Inherit priorities from upstream test-strategy
- Cite business-flow rows + risks + UI specs as evidence
- Viewport matrix declared (default desktop 1280×720, tablet 768×1024, mobile 375×667)
- Accessibility level declared (WCAG 2.1 AA default)
- Non-goals listed explicitly
