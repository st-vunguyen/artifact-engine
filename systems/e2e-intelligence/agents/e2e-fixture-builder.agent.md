---
agent_id: e2e-fixture-builder
system: e2e-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../tests/e2e/specs/**"
  - "runtime/.../tests/e2e/docs/scenarios/**"
  - "shared-artifacts/api-analysis/{feature}.json"
declared_outputs:
  - "runtime/.../tests/e2e/fixtures/global-setup.ts"
  - "runtime/.../tests/e2e/fixtures/global-teardown.ts"
  - "runtime/.../tests/e2e/fixtures/ui.fixture.ts"
  - "runtime/.../tests/e2e/fixtures/visual.fixture.ts"
  - "runtime/.../tests/e2e/fixtures/a11y.fixture.ts"
  - "runtime/.../tests/e2e/fixtures/data.fixture.ts"
  - "runtime/.../tests/e2e/fixtures/index.ts"
  - "runtime/.../tests/e2e/reporters/dashboard-reporter.ts"
  - "runtime/.../tests/e2e/snapshots/.gitkeep"
declared_skills: [fixture-generation]
declared_mcp: [traceability-mcp]
---

# E2E Fixture Builder (Phase 4)

> Build fixtures, auth bootstrap, reset, visual setup, a11y scanning, dashboard reporter.

## Global setup flow

1. Clean previous artifacts (`test-results/`, `playwright-report/`, `blob-report/`, `.auth/`)
2. Create test database if not exists (when applicable)
3. TRUNCATE all tables (preserve DB for connection pool)
4. Run migrations
5. Seed base data
6. Kill stale dev server if DB connection broken
7. Register non-admin users via API
8. Login each role → save `storageState` to `tests/e2e/.auth/<role>.json`

## Global teardown rules

- Local: keep DB intact (dev server reuses pool)
- CI: DROP DATABASE completely

## Playwright config snapshot settings

```ts
snapshotDir: 'tests/e2e/specs',
snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
projects: [
  { name: 'Desktop',  viewport: { width: 1280, height: 720 } },
  { name: 'Tablet',   viewport: { width: 768,  height: 1024 } },
  { name: 'Mobile',   viewport: { width: 375,  height: 667  } },
]
```

## Fixture layers

| Fixture | Provides |
|---|---|
| `ui.fixture.ts` | Pre-authenticated `adminPage`, `userAPage`, `userBPage`; `runId`; `screenshotStep`; `failureApiLogger` |
| `visual.fixture.ts` | Viewport configs, comparison helpers, snapshot config (maxDiffPixelRatio, threshold, animations) |
| `a11y.fixture.ts` | `@axe-core/playwright` integration; WCAG scan fixture; violation report attachment |
| `data.fixture.ts` | Entity create/delete helpers via API |

## Reporter

`reporters/dashboard-reporter.ts` — visual HTML dashboard (local primary):
- Suite-level summary
- Per-spec status (pass/fail/flaky)
- Visual diff preview
- A11y violations grouped
- Trace + video links

Plus standard Playwright reporters: `list` (stdout), `html` (secondary), `json` (CI only).

## Hard rules

- Auth via globalSetup + storageState — no login UI in specs
- Snapshots committed to git; baselines stable
- DB reset deterministic per test
- Visual comparison config consistent across projects
