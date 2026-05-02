# E2E Automation (System Rule)

> Playwright POM, semantic selectors, two-pass execution discipline.

## Page Object Model (mandatory)

- All locators live in page objects under `tests/e2e/pages/`.
- Specs reference page objects, not raw selectors.
- `BasePage` provides element registry, navigation, common assertions.
- Page objects extend `BasePage` and call `registerElements()`.

## Selector discipline

Order of preference:
1. `getByRole(role, { name })` — accessibility-first
2. `getByLabel(text)` — form labels
3. `getByTestId(id)` — when role/label not feasible (`data-testid` attribute)
4. `getByText(text)` — only for read-only display values
5. CSS class / nth-child / XPath — **forbidden** (rejected by verifier)

## Auth discipline

- `globalSetup` performs login per role; saves `storageState` to `tests/e2e/.auth/<role>.json`.
- Specs receive pre-authenticated `page` from fixtures.
- **No login UI in specs** — defeats stability and parallelism.

## Two-pass execution (when @visual exists)

```
pass 1: pnpm exec playwright test --grep-invert @visual
pass 2: pnpm exec playwright test --grep @visual
```

Reasons:
- Visual tests need stable baselines; failing visual masks functional issues.
- Non-visual feedback should be fast.

## Visual baseline pre-check

Before running the suite, verify baselines exist:
```bash
find tests/e2e -name "*.png" | head -20
```
If empty → run with `--update-snapshots`, commit, then proceed.

## Tags (required usage)

Every spec uses tags:
- `@smoke` — sanity check; runs on every commit
- `@critical` — p0 journeys; release blockers
- `@regression` — regression suite
- `@visual` — visual regression
- `@a11y` — accessibility scans
- `@responsive` — viewport-specific

## Forbidden patterns

| Pattern | Why |
|---|---|
| Inline `expect(page.locator('.btn-primary'))` | Class selectors brittle |
| Login UI inside spec body | Not parallel-safe |
| Hard-coded waits (`page.waitForTimeout(5000)`) | Use `waitForPageReady()` |
| Modifying `src/` to make tests pass | Out-of-scope |
| Skipping baseline pre-check | Visual diff false positives |

## Why

Playwright tests fail silently when discipline is loose: flaky locators, login UI, timing waits. The rules above eliminate the common failure modes.
