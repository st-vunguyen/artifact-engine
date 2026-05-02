---
agent_id: e2e-code-builder
system: e2e-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../tests/e2e/docs/scenarios/**"
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/state-machines/{feature}.json"
  - "shared-artifacts/api-analysis/{feature}.json"
declared_outputs:
  - "runtime/.../tests/e2e/config/index.ts"
  - "runtime/.../tests/e2e/core/BasePage.ts"
  - "runtime/.../tests/e2e/core/BaseComponent.ts"
  - "runtime/.../tests/e2e/core/index.ts"
  - "runtime/.../tests/e2e/helpers/wait-helpers.ts"
  - "runtime/.../tests/e2e/helpers/visual-helpers.ts"
  - "runtime/.../tests/e2e/helpers/a11y-helpers.ts"
  - "runtime/.../tests/e2e/pages/index.ts"
  - "runtime/.../tests/e2e/pages/*.page.ts"
  - "runtime/.../tests/e2e/specs/*.spec.ts"
  - "runtime/.../playwright.config.ts"
declared_skills: [code-generation]
declared_mcp: [traceability-mcp]
---

# E2E Code Builder (Phase 3)

> Generate Playwright test code from approved scenarios with page objects, helpers, specs.

## Required project structure

```
tests/e2e/
├── config/index.ts              # baseUrl, credentials, routes, viewports, timeouts, generateRunId()
├── core/
│   ├── BasePage.ts              # Abstract base, element registry, navigation, assertions
│   ├── BaseComponent.ts         # Reusable UI component base
│   └── index.ts
├── helpers/
│   ├── wait-helpers.ts          # waitForPageReady() — avoids networkidle hang
│   ├── visual-helpers.ts        # checkOverflow, checkCutoffText, checkElementVisibility, checkBoundingBox
│   └── a11y-helpers.ts          # runAxeScan, formatViolations, filterByImpact
├── pages/
│   ├── login.page.ts            # Extends BasePage; semantic element registration
│   ├── <domain>-<feature>.page.ts
│   └── index.ts                 # Barrel export
└── specs/
    ├── auth-login.spec.ts       # Domain-grouped
    ├── <domain>-<feature>-ui.spec.ts
    ├── <domain>-<feature>-visual.spec.ts
    ├── <domain>-<feature>-a11y.spec.ts
    └── ...
```

## Naming

- Page object: `<domain>.page.ts`
- Spec: `<feature>-<type>.spec.ts` where type ∈ {ui, visual, a11y, responsive}
- All locators registered semantically in `BasePage`

## Hard rules

- Imports resolve; typecheck passes
- No duplicate login UI in specs (auth via globalSetup + storageState)
- Visual comparison utilities used (`toHaveScreenshot()`)
- A11y matchers used (`@axe-core/playwright`)
- Tags applied per scenario doc
- Every locator is semantic (role/label/testid)
- Page objects extend `BasePage` and register their elements

## Output mapping

For every scenario in `02_feature-scenarios.md`:
1. Identify referenced page objects from `03_playwright-mapping.md`.
2. If page object doesn't exist, generate it.
3. Generate spec file referencing the page object.
4. Apply tags from `06_execution-suites.md`.
