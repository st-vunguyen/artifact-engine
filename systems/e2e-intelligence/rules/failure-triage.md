# Failure Triage (System Rule)

> Framework vs system bug classification.

## The triage tree

For every failed test:

```
1. Reproduce failure locally (or via CI artifacts)
2. Inspect: trace, video, screenshot, network log
3. Classify:
   ├── Is the test asset itself wrong?
   │     YES → framework issue → fix tests/e2e/, rerun
   │     NO  → continue
   ├── Is the failure due to environment (DB state, auth, fixture)?
   │     YES → framework issue → fix fixtures, rerun
   │     NO  → continue
   ├── Is the failure reproducible against the application?
   │     YES → system bug → file in tracker, report under 02_system-bugs.md
   │     NO  → inconclusive → document in 05_pipeline-summary.md
```

## Boundaries

- **Allowed to modify:** `tests/e2e/`, `playwright.config.ts`, baselines
- **Forbidden to modify:** `src/`, `prisma/`, `package.json`, `.env`, `docker-compose.yml`

If a test failure requires app-code change, that's a system bug — file the bug; do not "patch the test to make it pass."

## Evidence requirements per classification

### Framework issue
- Diff/PR reference for the fix
- Confirmation via rerun (passes after fix)
- Recorded in `04_framework-fixes.md`

### System bug
- Visual evidence (screenshot, video, trace)
- Reproduction steps (manual + automated)
- Environment context (browser, viewport, auth state)
- Recorded in `02_system-bugs.md`
- Tracker reference (Jira/Linear/GitHub Issue)

### Inconclusive
- Hypothesis on why
- Logs / partial evidence
- Recorded in `05_pipeline-summary.md` with "needs reproduction" tag

## Rerun policy

- Max 2 reruns per failure after fix
- 3rd consecutive fail without classification → escalate to inconclusive

## Forbidden

- Marking a failure "system bug" without visual evidence
- Patching app code to make tests pass
- Re-running indefinitely without classification
- Suppressing visual diffs that haven't been manually reviewed
