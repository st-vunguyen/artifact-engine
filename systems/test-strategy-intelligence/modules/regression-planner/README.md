# regression-planner (module)

> Decide always-run / on-change / release / cadence buckets.

## API

```ts
planRegression(scopes: ScopeRow[], approaches: ApproachRow[], depMap: DependencyMap): RegressionPlan
```

## Buckets

- **always_run** — p0 scopes + smoke-tagged
- **on_change_run** — rules: when component X changes, run scopes Y
- **release_candidate_run** — union of p0/p1 + abuse-failure for high-severity risks
- **cadence** — nightly / weekly / pre-release

## Output

```ts
type RegressionPlan = {
  scope_summary: string
  always_run: string[]
  on_change_run: ChangeRule[]
  release_candidate_run: string[]
  cadence: { nightly?, weekly?, pre_release? }
}
```

## Used by

- agent: `regression-planner`
