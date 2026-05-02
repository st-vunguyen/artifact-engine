# actor-extractor (module)

> Identify actors and their roles from the corpus.

## Purpose

Discover human, system, and third-party actors mentioned in the spec; classify them; aggregate their responsibilities.

## API

```ts
extractActors(corpus: NormalizedCorpus): Actor[]
classifyActor(name: string, mentions: Mention[]): "human" | "system" | "third-party"
aggregateResponsibilities(actor: Actor, corpus: NormalizedCorpus): string[]
```

## Heuristics

- Subjects of action verbs → candidate actors
- Pronoun chains resolved to nearest noun antecedent
- "the system" / "the API" / "the service" → kind=system
- Capitalized brand-like names (Stripe, Twilio) → kind=third-party
- Roles ("admin", "merchant", "customer") → kind=human

## Used by

- agent: `actor-flow-analyzer`
- skill: `analysis-extraction` (sub-skill `extract-actors`)
