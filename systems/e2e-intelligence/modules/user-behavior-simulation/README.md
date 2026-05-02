# user-behavior-simulation (module)

> Derive realistic interaction patterns for journey steps.

## API

```ts
deriveBehavior(actor: Actor, journey: Journey): UserBehavior
sampleTimings(): Timings              // realistic delays between actions
chooseInputData(field: FieldSpec): string
```

## Patterns

- Form submission: typing pace, focus changes, blur events
- Navigation: click → wait for load → assert
- Error recovery: see error → fix input → resubmit
- Abandonment (abuse-failure): half-fill form → navigate away → return

## Output

```ts
type UserBehavior = {
  pace: "fast" | "normal" | "slow"
  patterns: BehaviorPattern[]
  recovery_strategy: "retry" | "abandon" | "support"
}
```

## Used by

- skill: `code-generation` (informs spec timing + retry patterns)
