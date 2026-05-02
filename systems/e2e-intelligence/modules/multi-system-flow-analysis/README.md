# multi-system-flow-analysis (module)

> Identify cross-system touchpoints in journeys.

## Purpose

When a journey crosses system boundaries (UI → API → external), map each step to the system component it interacts with. Tag the step with `links_to.api_operation_ids` so api-analysis cross-references.

## API

```ts
mapJourneyToComponents(journey: Journey, graph: SystemGraph): ComponentMapping
identifyApiTouchpoints(journey: Journey, apiAnalysis: ApiAnalysis): ApiTouchpoint[]
detectIntegrationGaps(journey: Journey, graph: SystemGraph): Gap[]
```

## Output

```ts
type ApiTouchpoint = {
  journey_step_id: string
  operationId: string
  expected_status: number
}
```

## Used by

- agent: `e2e-scenario-builder`
- consumer: `regression-intelligence` (when API operation changes, identify e2e journeys impacted)
