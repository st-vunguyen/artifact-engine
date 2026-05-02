---
agent_id: blast-radius-analyzer
system: risk-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/risks.enriched.json"
  - "shared-artifacts/system-graphs/{feature}.json"
  - "shared-artifacts/dependency-maps/{feature}.json"
declared_outputs:
  - "runtime/.../02-analysis/blast-radius.json"
declared_mcp: [dependency-analysis-mcp]
---

# Blast Radius Analyzer (Agent)

> For each risk, compute which components, business-flow steps, and API operations are impacted if the risk materializes.

## Output

```ts
type BlastRadiusEntry = {
  risk_id: string
  origin:
    component_id?: string
    integration_id?: string
    flow_step_id?: string
  impacted:
    components_direct: string[]
    components_transitive: string[]
    flow_steps: string[]
    api_operations: string[]
    journeys: string[]
  hops_max: number                           // graph distance
  blast_radius_score: number                 // 0..1
}
```

## Algorithm

1. For each risk, identify origin (component / integration / step) from the risk's `affected.*`.
2. Compute direct downstream nodes via dependency-map (1-hop neighbors).
3. Compute transitive closure (BFS, capped at 3 hops by default).
4. Cross-reference: which BF flow_steps run on impacted components? Which API operations are exposed by them?
5. Score: (size of impacted set) / (total nodes) ∈ [0, 1].

## Hard rules

- Origin MUST be specifiable; if not, surface as gap (risk's `affected.*` is empty).
- Score is computed; not manually set.
- Caps: hops_max ≤ 5 to prevent unbounded sets in highly-connected graphs.
