---
skill_id: execution-and-triage
system: e2e-intelligence
version: 1.0
---

# Execution + Triage Skill

> Run Playwright suite; triage failures; produce reports.

## Steps

### Preflight
1. Verify config (baseURL, testDir, globalSetup, reporters, projects).
2. Check app reachable.
3. `pnpm exec playwright test --list` → confirm discovery.
4. Visual baseline pre-check (`find tests/e2e -name "*.png" | head -20`); if empty, run `--update-snapshots` first.

### Two-pass execution (when @visual exists)
- Pass 1: `pnpm exec playwright test --grep-invert @visual`
- Pass 2: `pnpm exec playwright test --grep @visual`

### Per failure: triage
1. Inspect trace, video, screenshot.
2. Classify: framework / system / inconclusive.
3. Framework → fix in `tests/e2e/`; rerun.
4. System → file in tracker; document in `02_system-bugs.md` with evidence.
5. Inconclusive → document in `05_pipeline-summary.md`.

### Rerun policy
- Max 2 reruns per failure post-fix.

### Reports
- `00_index.md` — run metadata
- `01_test-results-summary.md` — pass/fail/skip + duration + viewport coverage
- `02_system-bugs.md` — confirmed bugs with evidence
- `03_audit-gaps.md` — spec deviations
- `04_framework-fixes.md` — framework fixes applied
- `05_pipeline-summary.md` — conclusion

## Hard rules

- Curated reports backed by raw evidence
- System bug claims require visual evidence
- No app-code modifications

## Used by

- agent: `e2e-executor`
