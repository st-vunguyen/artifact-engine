# Debugging Playbook

> When the engine doesn't behave: where to look, in order.

## 1. State first

```
runtime/active-executions/<run-id>/run.state.json
```

Look at `state` and per-phase `phases.<phase-id>`. The state machine is described in [EXECUTION-LIFECYCLE.md](../../EXECUTION-LIFECYCLE.md).

## 2. Blockers

```
runtime/active-executions/<run-id>/run.blockers.json
```

Each blocker tells you: kind, reason, affected_artifacts, remediation, raised_by.

## 3. Events log

```
runtime/logs/<run-id>/events.jsonl
```

Append-only chronological. Filter by phase id or event type.

## 4. Per-phase artifacts

```
runtime/active-executions/<run-id>/<phase-id>/
```

Inspect what the agent actually produced. Compare against the workflow's `required_outputs`.

## 5. Validators / Gates output

```
runtime/active-executions/<run-id>/<phase-id>/validators/<id>/_aggregate.json
runtime/active-executions/<run-id>/<phase-id>/gates/<id>.json
```

These tell you exactly which check failed and why.

## 6. Verifier report

```
runtime/active-executions/<run-id>/05-verification/report.md
runtime/active-executions/<run-id>/05-verification/report.json
```

Check verdict + checks_failed + blockers + advisory_findings.

## 7. Trace matrix

```
shared-artifacts/traceability/<feature>.<system>.matrix.json
```

If verdict is `fail` due to coverage, walk the matrix for `claims_unevidenced_blocking` rows.

---

## Common scenarios

### "Phase 04-collection failed: missing-required-output"

The agent didn't produce all `05-postman/*.json` files. Check:
- Agent's `<phase-id>.log` for runtime errors
- Agent's `error.json` if present
- Workflow's `required_outputs` glob — does it match what the agent intended?

### "Verdict is fail, coverage 0.78"

Below the 0.85 threshold. Recovery should be `retry-with-altered-prompt: stricter-evidence`. If it didn't retry, check workflow's `recovery_strategies.agent_low_coverage`.

### "Per-status coverage missing on api-testing"

Run `api-report-verifier`'s output. The 7-dimension rubric items will indicate which operations × statuses lack scenarios. Recovery: `retry-with-altered-prompt: explicit-per-status`.

### "Visual baselines missing on e2e"

E2E executor preflight requires baselines. Run `pnpm exec playwright test --update-snapshots`, commit, then re-run.

### "Resume refused: workflow-changed"

The workflow definition changed since the original run. Either revert or start fresh.

### "Resume refused: registry-drift"

Agent / MCP / validator / gate version changed. Re-run with `--allow-registry-drift` (sysadmin only) or pin versions.

---

## When all else fails

1. Read the verifier report.
2. Read the blockers.
3. Re-read the relevant rule in `core/shared-rules/`.
4. Re-read the contract for the failing artifact.
5. Surface a Gap rather than guessing.

## See also

- [recovery-playbook.md](recovery-playbook.md)
- [validation-playbook.md](validation-playbook.md)
- [EXECUTION-LIFECYCLE.md](../../EXECUTION-LIFECYCLE.md)
