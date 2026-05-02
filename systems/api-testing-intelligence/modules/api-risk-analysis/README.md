# api-risk-analysis (module)

> Map risks to API operations.

## API

```ts
mapRisksToOperations(risks: Risk[], oasSnapshot: OasSnapshot): OperationRiskMap
prioritizeOperations(map: OperationRiskMap): { p0: string[], p1: string[], p2: string[] }
selectAbuseFailureScenarios(risks: Risk[], operations: Operation[]): ScenarioSeed[]
```

## Output

```ts
type OperationRiskMap = Record<operationId, {
  linked_risk_ids: string[]
  max_severity: SeverityLevel
  abuse_failure_seeds: string[]
}>
```

## Used by

- agent: `api-scenario-builder`
- skill: `scenario-expansion`
