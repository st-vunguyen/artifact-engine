# automation-strategy (module)

> Per-priority + per-mode automation thresholds.

## Default thresholds

| Priority | Min `auto + ai` |
|---|---|
| p0 | 60% |
| p1 | 40% |
| p2 | 20% |
| p3 | 0% |

## Per-mode adjustments

| Mode | Effect |
|---|---|
| quick | Skip p2/p3; p0 may run smoke-only |
| deep | Defaults |
| enterprise | +10pp on automation across priorities |
| regression | Run only impacted scopes; auto ≥ 80% |
| incident | Focus on incident-replay; auto ≥ 80% |

## Per test-type

| Test type | Min auto |
|---|---|
| smoke | 90% |
| regression | 90% |
| performance | 100% |
| security | 60% |
| accessibility | 40% |
| visual | 100% |
| exploratory | ≤ 20% |

## API

```ts
applyThresholds(approaches: ApproachRow[], mode: ExecutionMode): ApproachRow[]
```

## Used by

- agent: `strategy-builder`
- skill: `strategy-composition`
