# e2e-intelligence

> **Role:** produce executable Playwright E2E test pack — strategy, scenarios, page objects, fixtures, dashboards.
> **Position:** stage 5 (parallel with api-testing). Consumes business-flow + test-strategy + system-graph + risks + scenario seeds + UI flows.

---

## What it produces

| Artifact | Path | Contract | Consumers |
|---|---|---|---|
| E2E analysis | `shared-artifacts/e2e-analysis/<feature>.md` + `.json` | `e2e-contract@1.0` | regression, reporting |
| Journey graph | `shared-artifacts/e2e-analysis/<feature>.journey-graph.mmd` | (visual) | reporting |
| Page object map | `shared-artifacts/e2e-analysis/<feature>.poms.json` | `e2e-contract@1.0` | regression |
| E2E scenarios | `shared-artifacts/scenarios/<feature>.e2e.json` | `scenario-contract@1.0` | regression |

Plus the runtime test pack in `output/e2e-packages/<feature>/` — Playwright code, fixtures, baselines, reports.

---

## What it consumes

```
shared-artifacts/business-flows/<feature>.md        (required)
shared-artifacts/test-strategies/<feature>.md       (required)
shared-artifacts/state-machines/<feature>.json     (required)
shared-artifacts/risks/<feature>.json               (required)
shared-artifacts/scenarios/<feature>.seed.json      (required)
shared-artifacts/api-analysis/<feature>.json       (optional; used to align journey API touchpoints)
input/ui-specs/<feature>/...                        (encouraged)
input/ui-flows/<feature>/...                        (encouraged)
```

---

## Canonical 5-phase Playwright pipeline (mirrors e2e-testing-tool reference)

```
phase-1 — strategy:    01-create-strategy
phase-2 — scenarios:   02-create-scenarios
phase-3 — code:        03-create-test-code
phase-4 — fixtures:    04-create-fixtures
phase-5 — execute:     05-execute-and-report (optional: requires app to test)
```

Plus orchestrator phases (input, validation, verification, publish).

Pipeline: [pipelines/full-e2e-pipeline.workflow.yaml](pipelines/full-e2e-pipeline.workflow.yaml)

---

## UI/UX testing layers (per priority assignment)

| Layer | What it tests | Default priority |
|---|---|---|
| Functional UI | User journey correctness, form submissions, navigation | p0 critical journeys |
| Visual Regression | Pixel-level screenshot comparison | p1 stable design |
| Layout Integrity | Element position, spacing, overflow, z-index | p1 complex layouts |
| Responsive Design | Viewport breakpoints (desktop/tablet/mobile) | p1 all p0/p1 flows |
| Accessibility | WCAG 2.1 AA compliance, keyboard, screen reader | p0 public pages |
| UI Performance | Load time, jank, responsiveness | p1 critical paths |

Avoid duplicate coverage — assign one layer as primary per risk.

---

## Agents

| Agent | Purpose |
|---|---|
| [automation-qc](agents/automation-qc.agent.md) | Top-level orchestrator (UI/UX QC expert) |
| [e2e-strategy-builder](agents/e2e-strategy-builder.agent.md) | Phase 1: 7-document strategy pack |
| [e2e-scenario-builder](agents/e2e-scenario-builder.agent.md) | Phase 2: scenario inventory + Playwright mapping |
| [e2e-code-builder](agents/e2e-code-builder.agent.md) | Phase 3: Playwright spec files + page objects |
| [e2e-fixture-builder](agents/e2e-fixture-builder.agent.md) | Phase 4: fixtures, auth bootstrap, reset, visual baselines, a11y scan |
| [e2e-executor](agents/e2e-executor.agent.md) | Phase 5: execute + dashboard report (when app available) |
| [e2e-verifier](agents/e2e-verifier.agent.md) | Final gate: raw vs curated, failure triage |

---

## Rules

| Rule | Discipline |
|---|---|
| [e2e-automation](rules/e2e-automation.md) | Playwright POM, semantic selectors, two-pass execution |
| [visual-regression](rules/visual-regression.md) | Snapshot config, masking dynamic content, baselines committed |
| [accessibility](rules/accessibility.md) | WCAG matchers, axe-core integration, severity classification |
| [responsive-design](rules/responsive-design.md) | Viewport matrix, breakpoint coverage |
| [failure-triage](rules/failure-triage.md) | Framework vs system bug classification |

---

## Skills

| Skill | Purpose |
|---|---|
| [strategy-pack](skills/strategy-pack/SKILL.md) | 7-document strategy generation |
| [scenario-pack](skills/scenario-pack/SKILL.md) | Scenario inventory + Playwright mapping |
| [code-generation](skills/code-generation/SKILL.md) | Playwright spec + page object code |
| [fixture-generation](skills/fixture-generation/SKILL.md) | Auth bootstrap, data fixtures, visual baselines, a11y scans |
| [execution-and-triage](skills/execution-and-triage/SKILL.md) | Run tests + classify failures |

---

## Modules

- `modules/journey-builder/` — convert business-flow + scenario seeds → user journeys
- `modules/state-flow-analysis/` — state machine → state-anchored assertions
- `modules/multi-system-flow-analysis/` — cross-system touchpoint identification
- `modules/user-behavior-simulation/` — derive realistic interaction patterns

---

## Templates

`templates/playwright-pack/` — the canonical Playwright project skeleton:
- `config/index.ts`, `core/BasePage.ts`, `core/BaseComponent.ts`
- `fixtures/` (global-setup, ui, visual, a11y, data)
- `helpers/` (wait-helpers, visual-helpers, a11y-helpers)
- `pages/` (page object skeleton)
- `reporters/dashboard-reporter.ts`
- `playwright.config.ts`

---

## Outputs (e2e-packages)

```
output/e2e-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── tests/e2e/
│   ├── config/
│   ├── core/
│   ├── docs/
│   │   ├── strategy/
│   │   ├── scenarios/
│   │   └── reports/<run-slug>/
│   ├── fixtures/
│   ├── helpers/
│   ├── pages/
│   ├── reporters/
│   ├── snapshots/        ← visual baselines (committed)
│   ├── specs/
│   └── .auth/             ← storageState (gitignored)
└── playwright.config.ts
```

The output is intended to be copied into the application repo's `tests/e2e/` directory.

---

## Why this is part of the engine

Without integration:
- E2E ran on free-form prompts, with framework discipline encoded inside prompts.
- Scope, priorities, viewport matrix, a11y level were re-discovered each time.

With the engine:
- Strategy + scenarios come from upstream (test-strategy + scenario seeds).
- Visual + a11y + responsive layers are explicit, not assumed.
- Two-pass execution (non-visual then visual) is enforced.
- Failure triage (framework vs system bug) is structural.
- Reports reconcile raw test outputs against curated findings.
