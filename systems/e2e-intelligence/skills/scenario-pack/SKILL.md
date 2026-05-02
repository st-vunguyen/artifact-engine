---
skill_id: scenario-pack
system: e2e-intelligence
version: 1.0
---

# Scenario Pack Skill

> Generate the 7-document scenario pack with explicit Playwright mapping.

## Steps

1. Read strategy pack + BF + state-machine + scenario seeds + api-analysis.
2. Compose `01_scenario-overview.md` — feature summary + risk hotspots + suite distribution.
3. For each seed, expand into one or more scenarios, classified by type:
   - Functional UI (happy / negative / boundary / permission / state-transition)
   - Visual Regression (page / component / theme / dynamic-masked)
   - Layout (visibility / overflow / spacing / z-index / reflow)
   - Responsive (per-viewport assertions)
   - Accessibility (WCAG matchers + keyboard + screen-reader)
4. Build `02_feature-scenarios.md` — full inventory.
5. Build `03_playwright-mapping.md` — scenario → spec file → page objects → fixtures → tags.
6. Build `04_test-data-fixtures-and-mocks.md` — what data, what fixtures, what mocks.
7. Build `05_assertion-and-oracle-design.md` — assertion strategies + anti-flaky patterns.
8. Build `06_execution-suites.md` — suite slicing with tags.
9. Build `07_traceability-gaps-open-questions.md` — spec → coverage + gaps.

## Inventory columns

`Feature/Flow → Scenario Objective → Scenario Type → Risk → Viewports → Candidate Suite → Evidence`

## Hard rules

- Every scenario references a seed_id
- Every step uses semantic selector
- Every assertion anchored to expected state
- Tags applied (smoke/critical/regression/visual/a11y/responsive)
- p0 → `@critical`

## Used by

- agent: `e2e-scenario-builder`
