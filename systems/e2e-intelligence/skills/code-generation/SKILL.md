---
skill_id: code-generation
system: e2e-intelligence
version: 1.0
---

# Code Generation Skill

> Generate Playwright TypeScript code from approved scenarios.

## Steps

1. Read scenario pack + Playwright mapping doc.
2. Generate `tests/e2e/config/index.ts` — baseUrl, credentials, routes, viewports, timeouts, `generateRunId()`.
3. Generate `tests/e2e/core/BasePage.ts` + `BaseComponent.ts` — registry pattern, navigation, common assertions.
4. Generate `tests/e2e/helpers/`:
   - `wait-helpers.ts` (`waitForPageReady` avoiding networkidle hang)
   - `visual-helpers.ts` (`checkOverflow`, `checkCutoffText`, `checkElementVisibility`, `checkBoundingBox`)
   - `a11y-helpers.ts` (`runAxeScan`, `formatViolations`, `filterByImpact`)
5. For each page object referenced in scenarios, generate `tests/e2e/pages/<domain>.page.ts`:
   - Extends `BasePage`
   - Registers semantic locators (role/label/testid)
   - Methods for page-level actions
6. For each scenario, generate `tests/e2e/specs/<feature>-<type>.spec.ts`:
   - Imports page objects from `pages/` barrel
   - Uses fixtures (`test.use({ storageState })`)
   - Applies tags via `test.describe.parallel('@critical', ...)`
7. Generate `tests/e2e/pages/index.ts` (barrel export).
8. Generate `playwright.config.ts` with viewport projects + reporters.

## Hard rules

- TypeScript types resolve; no `any` without justification
- Imports use barrel (no deep path)
- Locators are semantic (role/label/testid)
- No login UI in specs
- No `page.waitForTimeout(...)` — use `waitForPageReady()`

## Used by

- agent: `e2e-code-builder`
