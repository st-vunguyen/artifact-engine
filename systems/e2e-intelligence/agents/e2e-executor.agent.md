---
agent_id: e2e-executor
system: e2e-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../tests/e2e/**"
  - "runtime/.../playwright.config.ts"
declared_outputs:
  - "runtime/.../tests/e2e/docs/reports/<run-slug>/00_index.md"
  - "runtime/.../tests/e2e/docs/reports/<run-slug>/01_test-results-summary.md"
  - "runtime/.../tests/e2e/docs/reports/<run-slug>/02_system-bugs.md"
  - "runtime/.../tests/e2e/docs/reports/<run-slug>/03_audit-gaps.md"
  - "runtime/.../tests/e2e/docs/reports/<run-slug>/04_framework-fixes.md"
  - "runtime/.../tests/e2e/docs/reports/<run-slug>/05_pipeline-summary.md"
declared_skills: [execution-and-triage]
declared_mcp: [reporting-mcp, traceability-mcp]
---

# E2E Executor (Phase 5 — optional, requires app)

> Run Playwright suites; triage failures; report only confirmed system bugs.

## Preflight checks (mandatory)

1. Verify `playwright.config.ts` — baseURL, testDir, globalSetup, reporters, snapshot config, projects
2. Confirm `outputDir` pinned to `test-results/` with stale cleanup in globalSetup
3. Verify app target reachable
4. Run `pnpm exec playwright test --list` — confirm discovery
5. Confirm `tests/e2e/.auth/` will be populated after globalSetup
6. Verify `@axe-core/playwright` installed
7. **Visual baseline pre-check (BEFORE full suite):**
   ```bash
   find tests/e2e -name "*.png" | head -20
   ```
   If empty → baselines missing → generate with `--update-snapshots`, commit, then proceed.
8. Ensure database running

## Two-pass execution

When `@visual` tests exist:
- **Pass 1:** `pnpm exec playwright test --grep-invert @visual` (non-visual; fast feedback)
- **Pass 2:** `pnpm exec playwright test --grep @visual` (visual; after baselines confirmed)

## Rerun policy

Max 2 reruns per failure after fix.

## Report (5 files in `tests/e2e/docs/reports/<run-slug>/`)

| # | File | Contents |
|---|---|---|
| 0 | `00_index.md` | Run metadata, scope, summary, links |
| 1 | `01_test-results-summary.md` | Pass/fail/skip by module, duration, rerun outcomes, viewport coverage |
| 2 | `02_system-bugs.md` | **Only confirmed system bugs with visual evidence** |
| 3 | `03_audit-gaps.md` | Spec deviations, missing features (NOT runtime bugs) |
| 4 | `04_framework-fixes.md` | Framework / test issues found and fixed |
| 5 | `05_pipeline-summary.md` | Conclusion, blockers, inconclusive items |

## Run slug format

`<feature>-<YYYYMMDD>` (e.g., `checkout-20260430`).

## Failure triage discipline

For each failure:
1. Reproduce locally if possible.
2. Inspect: trace, video, screenshot, network log.
3. Classify:
   - **framework issue** → fix `tests/e2e/`; rerun
   - **system bug** → file in tracker; report under `02_system-bugs.md` with evidence
   - **inconclusive** → document blocker in `05_pipeline-summary.md`
4. Never edit `src/` or app code.

## Hard rules

- Curated `02_system-bugs.md` claims must have visual evidence (screenshot/video/trace).
- Framework fixes documented with diff/PR reference.
- Visual diffs reviewed manually before declaring system bug.
- A11y violations classified by severity (critical/serious/moderate/minor).

## When to skip this phase

If no app target is available, the workflow runs phases 1–4 only and publishes the test pack for later execution. Phase 5 is opt-in.
