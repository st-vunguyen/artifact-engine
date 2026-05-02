# Execution Playbook

> How to run a workflow.

## Single-system run

```
# business-flow only
pnpm run start --workflow business-flow-full-pipeline --feature <slug>

# system-graph only
pnpm run start --workflow system-graph-pipeline --feature <slug>

# api test pack only (requires upstream artifacts present)
pnpm run start --workflow api-test-full-pipeline --feature <slug>
```

## Chained run (full quality suite)

```
pnpm run start --command run-full-quality-suite --feature <slug>
```

The orchestrator schedules:
1. business-flow-full-pipeline
2. system-graph-pipeline
3. enrich-risks-pipeline
4. test-strategy-pipeline
5. api-test-full-pipeline + e2e-full-pipeline (parallel)
6. regression-analysis-pipeline (if change input present)

## Modes

```
--mode quick        smoke + p0 only
--mode deep         all priorities (default)
--mode enterprise   exhaustive + non-functional
--mode regression   targeted impacted scope
--mode incident     targeted failure path + adjacent
```

## Resume

```
pnpm run resume --run-id <run-id>                # auto: latest checkpoint
pnpm run resume --run-id <run-id> --from <phase> # explicit
```

## Verify-only

```
pnpm run verify --feature <slug>                 # all systems
pnpm run verify --feature <slug> --system api    # one system
```

## Inputs required

```
input/specs/<feature>/                   ← required for BF
input/api-specs/<feature>/openapi.yaml   ← required for api-testing
input/ui-specs/<feature>/                ← encouraged for e2e
input/ui-flows/<feature>/                ← encouraged for e2e
input/hld/<feature>/                     ← encouraged for system-intelligence
input/lld/<feature>/                     ← encouraged for system-intelligence
input/raw-imports/changes.<id>.md        ← required for regression
```

## Watching outputs

```
runtime/active-executions/<run-id>/run.state.json    # current state
runtime/logs/<run-id>/events.jsonl                    # full lifecycle
output/<system>-packages/<feature>/REPORT.md          # final report
```

## Cancel

```
pnpm run cancel --run-id <run-id>
```

## See also

- [WORKFLOWS.md](../../WORKFLOWS.md)
- [debugging-playbook.md](debugging-playbook.md)
- [recovery-playbook.md](recovery-playbook.md)
