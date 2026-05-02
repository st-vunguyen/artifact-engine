# regression-selection (module)

> Rule engine: apply selection rules → regression set.

## API

```ts
applyRules(rules: SelectionRule[], impacts: ImpactRow[], scenarios: ScenarioIndex): Selection[]
deduplicate(selections: Selection[]): Selection[]
applyBudget(selections: Selection[], budgetSeconds: number): { kept: Selection[], trimmed: TrimDecision[] }
```

## Trim order (when over budget)

1. Drop p2
2. Drop p1 (except `always-run-smoke`)
3. Never drop p0
4. Never drop `incident-replay`

If even p0 exceeds budget → stop-and-report.

## Used by

- agent: `regression-selector`
- skill: `regression-selection`
