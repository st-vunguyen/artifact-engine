---
agent_id: e2e-scenario-builder
system: e2e-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../tests/e2e/docs/strategy/**"
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/state-machines/{feature}.json"
  - "shared-artifacts/scenarios/{feature}.seed.json"
  - "shared-artifacts/api-analysis/{feature}.json"
declared_outputs:
  - "runtime/.../tests/e2e/docs/scenarios/00_index.md"
  - "runtime/.../tests/e2e/docs/scenarios/01_scenario-overview.md"
  - "runtime/.../tests/e2e/docs/scenarios/02_feature-scenarios.md"
  - "runtime/.../tests/e2e/docs/scenarios/03_playwright-mapping.md"
  - "runtime/.../tests/e2e/docs/scenarios/04_test-data-fixtures-and-mocks.md"
  - "runtime/.../tests/e2e/docs/scenarios/05_assertion-and-oracle-design.md"
  - "runtime/.../tests/e2e/docs/scenarios/06_execution-suites.md"
  - "runtime/.../tests/e2e/docs/scenarios/07_traceability-gaps-open-questions.md"
declared_skills: [scenario-pack]
declared_mcp: [traceability-mcp]
---

# E2E Scenario Builder (Phase 2)

> Transform strategy into implementation-ready scenarios with explicit Playwright mapping.

## The 7 documents

| # | File | Contents |
|---|---|---|
| 0 | `00_index.md` | Scope, inputs, deliverables, Playwright usage |
| 1 | `01_scenario-overview.md` | Feature summary, risk hotspots, suite distribution, viewport coverage |
| 2 | `02_feature-scenarios.md` | Full scenario list by feature/flow |
| 3 | `03_playwright-mapping.md` | Scenario → spec file, page objects, visual fixtures, viewport configs, tags |
| 4 | `04_test-data-fixtures-and-mocks.md` | Data, fixtures, visual baselines, viewport fixtures, mocks |
| 5 | `05_assertion-and-oracle-design.md` | UI state assertions, visual comparison, layout checks, a11y audit rules, anti-flaky |
| 6 | `06_execution-suites.md` | Suite slicing with tags: `@smoke`, `@regression`, `@critical`, `@visual`, `@a11y`, `@responsive` |
| 7 | `07_traceability-gaps-open-questions.md` | Traceability + gaps + open questions |

## Scenario types (standardized)

| Type | What it covers |
|---|---|
| Functional UI | Happy path, negative/validation, boundary, permission/access, state transition |
| Visual Regression | Page-level baseline, component-level baseline, theme/dark mode, dynamic content masking |
| Layout Verification | Element visibility, overflow, spacing, z-index, content reflow |
| Responsive Design | Viewport-specific assertions (desktop/tablet/mobile) |
| Accessibility | WCAG matchers, keyboard navigation, screen reader compat |

## Inventory table columns (required)

`Feature/Flow → Scenario Objective → Scenario Type → Risk → Viewports → Candidate Suite → Evidence`

## Hard rules

- Every scenario references a seed_id from upstream
- Every step uses semantic selectors (role/label/testid); class/text selectors are findings
- Every assertion anchored to expected state (URL, role+name, network, state-machine state)
- Tags applied: `@smoke / @regression / @critical / @visual / @a11y / @responsive`
- p0 scenarios tagged `@critical`
