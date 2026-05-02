# change-risk-analysis (module)

> Classify risk delta from changes.

## Purpose

When a change touches a component linked to existing risks, compute the delta:
- Does the change increase / decrease likelihood?
- Does the change touch the mitigation (potentially weakening it)?
- Does the change introduce new risk categories?

## API

```ts
analyzeRiskDelta(change: Change, riskRegister: Risk[]): RiskDelta[]
```

## Output

```ts
type RiskDelta = {
  change_id: string
  risk_id: string
  delta: "increased" | "decreased" | "unchanged" | "new"
  reasoning: string
  evidence: Evidence[]
}
```

## Used by

- agent: `regression-selector` (selects abuse-failure scenarios for risks with delta=increased/new)
