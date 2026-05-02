# journey-builder (module)

> Convert business-flow + scenario seeds → user journeys.

## API

```ts
buildJourneys(bf: BusinessFlow, seeds: ScenarioSeed[], stateMachine: StateMachine): Journey[]
identifyHappyPath(bf: BusinessFlow, sm: StateMachine): JourneyStep[]
identifyAbuseFailureJourneys(seeds: ScenarioSeed[], risks: Risk[]): Journey[]
```

## Heuristics

- One happy-path journey per BF flow cluster
- One abuse-failure journey per risk severity ≥ high
- One regression journey per cited prior incident
- One smoke journey per p0 scope

## Output

`Journey[]` per `e2e-contract.md` §4.

## Used by

- agent: `e2e-scenario-builder`
- skill: `scenario-pack`
