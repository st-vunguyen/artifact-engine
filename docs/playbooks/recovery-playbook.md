# Recovery Playbook

> What to do when a run blocks or fails.

## Decision tree

```
Run is BLOCKED
   │
   ├─ Cause: agent_error (transient)?
   │     → retry budget remaining? → orchestrator auto-retries
   │     → exhausted? → see "stop-and-report"
   │
   ├─ Cause: validation_failed?
   │     → artifact wrong; agent must rewrite. retry doesn't help.
   │     → action: read verifier findings; fix; rerun the phase
   │
   ├─ Cause: gate_failed?
   │     → like validation_failed; the artifact didn't meet the bar
   │     → action: see verifier report; address findings; rerun
   │
   ├─ Cause: missing_input?
   │     → upstream artifact not in shared-artifacts/
   │     → action: run upstream workflow first, OR provide missing input
   │
   ├─ Cause: mcp_unavailable?
   │     → infra issue; engine retries with backoff
   │     → if persistent → check MCP server health
   │
   └─ Cause: ask-user prompt?
         → user input required; resume after providing answer
```

## Resume modes

```
pnpm run resume --run-id <run-id>                  # auto (latest checkpoint)
pnpm run resume --run-id <run-id> --from <phase>   # explicit phase
pnpm run resume --run-id <run-id> --from-latest    # confirm latest
```

## When NOT to resume

- Terminal state (SUCCEEDED, FAILED, CANCELLED) — start fresh
- Workflow definition changed (`workflow-changed` blocker) — revert or fresh
- Registry drift without override flag — pin versions or fresh
- Files in `runtime/<run-id>/` were manually edited — fresh

## Force-fresh

```
pnpm run start --workflow <id> --feature <slug> --fresh
```

(Does NOT skip gates; just allocates a new run-id.)

## Common recovery scenarios

### Agent low coverage (≥ 1 attempt)

The retry engine triggers `retry-with-altered-prompt: stricter-evidence`. Watch:
```
{ "type": "run.recovery_started", "phase_id", "kind": "agent_low_coverage", ... }
```

If still failing after 2 attempts → coverage rule is too strict OR source is genuinely sparse. Inspect trace matrix.

### Per-status coverage failure (api-testing)

Recovery: `retry-with-altered-prompt: explicit-per-status`. If still failing, the OAS may not declare statuses cleanly — check `01-review/openapi-quality/lint-findings.md`.

### Visual baseline missing (e2e)

Engine returns blocker. Resolution: generate baselines, commit, re-run.

### Cross-system stale-reference

`consistency-gate` fails on `cross-system-inconsistent`. The producer regenerated; consumer needs to re-run against new version. Resolution: re-run consumer; the orchestrator picks up the new version.

## See also

- [RECOVERY-POLICY.md](../../RECOVERY-POLICY.md)
- [debugging-playbook.md](debugging-playbook.md)
