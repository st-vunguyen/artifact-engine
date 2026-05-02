---
skill_id: dependency-projection
system: system-intelligence
version: 1.0
---

# Dependency Projection Skill

> Project the system graph into a focused dependency map for downstream impact analysis.

## Steps

1. Read `system-graph.json`.
2. Filter Integrations to: sync-http, rpc, async-event, db-read, db-write, queue-publish/consume.
3. For each Component, compute:
   - fan_in (incoming integration count)
   - fan_out (outgoing integration count)
   - degree = fan_in + fan_out
4. Compute simple centrality (degree-based; betweenness optional).
5. For each edge, compute `criticality` ∈ low/medium/high/critical based on:
   - boundary cross (public ↔ private = higher)
   - SLA on the integration
   - whether the upstream depends on this for happy-path
6. Write `dependency-map.json`.

## Output

```json
{
  "feature": "<slug>",
  "nodes": ["ui-checkout", "svc-orders", "svc-payment", "ext-stripe"],
  "edges": [
    { "from": "ui-checkout", "to": "svc-orders", "kind": "sync-http", "criticality": "high" }
  ],
  "fan_in":  { "ui-checkout": 0, "svc-orders": 1, "svc-payment": 1, "ext-stripe": 1 },
  "fan_out": { "ui-checkout": 1, "svc-orders": 1, "svc-payment": 1, "ext-stripe": 0 },
  "degree":  { "ui-checkout": 1, "svc-orders": 2, "svc-payment": 2, "ext-stripe": 1 },
  "centrality_top": ["svc-orders", "svc-payment"]
}
```

## Used by

- agent: `dependency-mapper`
- consumer: `regression-intelligence` (computes blast radius from this)
