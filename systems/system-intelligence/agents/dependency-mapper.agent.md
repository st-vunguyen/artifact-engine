---
agent_id: dependency-mapper
system: system-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/system-graph.json"
declared_outputs:
  - "runtime/.../03-generation/dependency-map.json"
declared_mcp: [dependency-analysis-mcp]
---

# Dependency Mapper (Agent)

> Project the system graph into a focused, lighter dependency map.

## Output

```json
{
  "feature": "<slug>",
  "nodes": ["component_id", ...],
  "edges": [
    { "from": "ui-checkout", "to": "svc-orders", "kind": "sync-http", "criticality": "high" }
  ],
  "fan_in": { "svc-orders": 3 },
  "fan_out": { "svc-orders": 2 },
  "centrality_top": ["svc-orders", "svc-payment"]
}
```

## Process

1. Read system-graph.json.
2. For each Component, count fan-in (incoming edges) and fan-out (outgoing edges).
3. Compute centrality (betweenness or simple in+out).
4. Annotate edges with `criticality` (computed via `dependency-analysis-mcp.criticality`).
5. Write dependency-map.json.

## Use

The map is consumed by:
- **regression-intelligence** — to compute blast-radius of changes
- **test-strategy-intelligence** — to prioritize coverage at high-centrality nodes

## Hard rules

- Map MUST agree with system-graph (subset of nodes/edges).
- `criticality` is monotonic with centrality (higher centrality → higher criticality, modulo other factors).
