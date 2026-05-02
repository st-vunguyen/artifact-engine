# state-machine-builder (module)

> Build the state machine from extracted states + transitions.

## Purpose

From corpus state-language ("status", "state", "phase") → structured `StateMachine` per `business-flow-contract.md` §5.

## API

```ts
buildStateMachine(corpus: NormalizedCorpus, transitions: TransitionRaw[]): StateMachine
detectOrphans(sm: StateMachine): string[]             // state ids with no incoming + non-initial
checkInitialTerminal(sm: StateMachine): { ok: boolean, issues: string[] }
canonicalize(sm: StateMachine): StateMachine          // sort states/transitions for stability
```

## Hard rules

- ≥1 initial declared
- ≥1 terminal (or explicit "no terminal" with reason)
- Every transition references declared states
- Every transition has non-empty trigger
- IDs slug-stable across reruns

## Used by

- agent: `state-transition-extractor`
- skill: `analysis-extraction` (sub-skill `extract-states`)
