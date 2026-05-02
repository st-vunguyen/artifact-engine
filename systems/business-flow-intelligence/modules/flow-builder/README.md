# flow-builder (module)

> Compose flow rows for Section 4 (Flow Table) from extracted facts.

## Purpose

Take actors, decisions, transitions, rules → produce ordered flow steps.

## API

```ts
buildFlow(corpus: NormalizedCorpus, actors: Actor[], decisions: Decision[]): FlowRow[]
orderSteps(rows: FlowRow[]): FlowRow[]              // topological by triggers + temporal cues
splitMultiActionRow(row: FlowRow): FlowRow[]        // enforce one-action-per-row
```

## Output

```ts
type FlowRow = {
  step_id: string                    // S01, S02, ...
  actor: string                      // slug
  action: string                     // imperative
  decision_ref?: string              // D01 (when this row's outcome depends on a decision)
  system: string
  preconditions?: string
  postconditions?: string
  outcome: string                    // observable
  evidence: Evidence[]
}
```

## Hard rules

- One actor + one action per row
- Outcome observable (someone or something can detect it)
- Evidence cited verbatim
- Stable IDs across reruns (deterministic from inputs)

## Used by

- skill: `analysis-extraction` (sub-skill `extract-flow-rows`)
