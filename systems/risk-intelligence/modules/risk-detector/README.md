# risk-detector (module)

> Heuristics for risk discovery from system-graph + business-flow.

## API

```ts
detectByCategory(category: RiskCategory, graph: SystemGraph, bf: BusinessFlow): RiskCandidate[]
detectAll(graph: SystemGraph, bf: BusinessFlow, prelim: Risk[]): RiskCandidate[]
mergeWithPreliminary(prelim: Risk[], detected: RiskCandidate[]): Risk[]
```

## Per-category heuristics

| Category | Trigger |
|---|---|
| concurrency | Multi-writer to same data store; race-condition-prone integration |
| data-integrity | Cross-component writes without transaction boundary |
| async-failure | Async event with no documented retry/dead-letter |
| external-dependency | External SLA below feature requirement |
| operability | Component centrality > threshold without health-check |
| security | Public-boundary component with no auth policy |
| performance | High-fan-in component on critical path |
| compliance | Tenant-scoped boundary without tenant key |

## Output

`RiskCandidate[]` → enriched into `Risk[]` per `risk-contract@1.0`.

## Used by

- agent: `risk-detector`
- skill: `risk-extraction`
