# state-flow-analysis (module)

> State machine → state-anchored assertions in journeys.

## API

```ts
deriveStateAssertions(sm: StateMachine, journey: Journey): StateAssertion[]
mapJourneyStepToState(step: JourneyStep, sm: StateMachine): string | null
```

## Use

For every JourneyStep with `expected.state_label`, validate that the label exists in the consumed state-machine. If it doesn't → consistency-gate failure.

For every state in the state machine, identify journeys that visit it. States never visited → finding (untested state).

## Output

```ts
type StateAssertion = {
  journey_step_id: string
  expected_state: string
  evidence: Evidence[]
}
```

## Used by

- agent: `e2e-scenario-builder`
- skill: `scenario-pack`
