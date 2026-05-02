---
skill_id: fixture-generation
system: e2e-intelligence
version: 1.0
---

# Fixture Generation Skill

> Generate fixture layers, global setup/teardown, dashboard reporter.

## Steps

1. Generate `fixtures/global-setup.ts`:
   - Cleans previous artifacts
   - Truncates tables (preserve DB connection)
   - Runs migrations
   - Seeds base data
   - Registers users via API
   - Logs in each role; saves `storageState` to `.auth/<role>.json`
2. Generate `fixtures/global-teardown.ts`:
   - Local: keep DB
   - CI: drop DB
3. Generate `fixtures/ui.fixture.ts`:
   - Pre-authenticated `adminPage`, `userAPage`, `userBPage`
   - `runId`
   - `screenshotStep(label)` (target highlight)
   - `failureApiLogger`
4. Generate `fixtures/visual.fixture.ts`:
   - Viewport configs
   - Comparison helpers (mask, threshold)
   - Snapshot config
5. Generate `fixtures/a11y.fixture.ts`:
   - `@axe-core/playwright` injection
   - WCAG 2.1 AA scan rules
   - Violation report attachment
6. Generate `fixtures/data.fixture.ts`:
   - Entity create/delete helpers via API
   - Cleanup via test.afterEach
7. Generate `reporters/dashboard-reporter.ts`:
   - Suite summary
   - Per-spec status
   - Visual diff preview
   - A11y violations grouped
   - Trace + video links
8. Generate barrel `fixtures/index.ts`.
9. Add `tests/e2e/snapshots/.gitkeep` to ensure snapshot dir is tracked.

## Hard rules

- Auth via globalSetup + storageState (no login UI in specs)
- Snapshot dir co-located with specs
- No real secrets in fixtures (use env)
- Reporter deterministic (no random IDs in output)

## Used by

- agent: `e2e-fixture-builder`
