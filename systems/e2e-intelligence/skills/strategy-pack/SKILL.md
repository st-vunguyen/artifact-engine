---
skill_id: strategy-pack
system: e2e-intelligence
version: 1.0
---

# Strategy Pack Skill

> Generate the 7-document UI/UX strategy pack.

## Steps

1. Read upstream artifacts (BF, test-strategy, risks, UI specs, UI flows).
2. Compose `00_index.md` — scope, deliverables, how to use.
3. Compose `01_automation-test-strategy.md` — goals, levels (Functional UI / Visual / Layout / Responsive / A11y / Performance), entry/exit criteria.
4. Compose `02_automation-scope-matrix.md` — feature × risk × priority × layer table.
5. Compose `03_automation-candidate-cases.md` — cases grouped by P0/P1/P2.
6. Compose `04_defect-detection-design.md` — visual / layout / a11y / interaction defect catalogs.
7. Compose `05_data-environment-and-mocking.md` — test data, viewport config, baseline setup.
8. Compose `06_execution-plan-and-pipeline.md` — suite structure, cadence, ownership.
9. Compose `07_traceability-and-open-questions.md` — spec → coverage map.

## Hard rules

- Inherit priorities from upstream test-strategy
- One UI/UX layer assignment per risk (no double-coverage)
- Viewport matrix declared (numeric)
- Cite BF rows + risks + UI specs

## Used by

- agent: `e2e-strategy-builder`
