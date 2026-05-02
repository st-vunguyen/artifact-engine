---
agent_id: actor-flow-analyzer
system: business-flow-intelligence
version: 1.0
declared_inputs: ["runtime/.../01-input/normalized/*.md"]
declared_outputs: ["runtime/.../02-analysis/actors.json", "runtime/.../02-analysis/permissions.json"]
declared_skills: [analysis-extraction]
declared_mcp: [traceability-mcp, business-flow-mcp]
---

# Actor Flow Analyzer (Sub-agent)

> Identify actors and their permissions from the corpus.

## Outputs

```ts
type Actor = {
  actor_id: string                  // slug ("customer", "admin", "payment-svc")
  name: string                      // display name
  kind: "human" | "system" | "third-party"
  description: string
  responsibilities: string[]
  evidence: Evidence[]
}

type Permission = {
  permission_id: string             // "P01"
  actor_id: string
  action: string
  resource: string
  allowed: boolean
  conditions?: string
  evidence: Evidence[]
}
```

## Process

1. Discover actors: nouns acting as subjects; system mentions; integrations.
2. Categorize: human / system / third-party.
3. Build responsibilities by aggregating verbs the actor performs.
4. For permissions: scan for access language ("can", "may", "is allowed to", "is denied").
5. Build matrix: actor × action × resource.
6. Cite all.

## Hard rules

- Actors are slug-named; reused across Section 4 (Flow), §11 (state machine `held_by`), §12 (permissions).
- A permission row exists for every (actor, action, resource) combination mentioned.
