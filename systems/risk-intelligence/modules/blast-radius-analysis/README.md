# blast-radius-analysis (module)

> Graph traversal helpers for impact computation per risk.

## API

```ts
computeBlastRadius(risk: Risk, graph: SystemGraph, depMap: DependencyMap): BlastRadiusEntry
bfsImpact(originId: string, depMap: DependencyMap, hops_max: number): { direct, transitive_1, transitive_2plus }
crossReferenceFlowSteps(impactedComponents: string[], bf: BusinessFlow): string[]
crossReferenceOperations(impactedComponents: string[], apiAnalysis: ApiAnalysis): string[]
```

## Algorithm

```
origin = risk.affected.component_id || derive from integration / step
direct = { origin }
transitive_1 = depMap.neighbors(origin, hops=1)
transitive_2plus = depMap.neighbors(origin, hops=2..hops_max)
score = (direct + 0.7*transitive_1 + 0.4*transitive_2plus) / total_nodes
```

Capped at `hops_max ≤ 5`.

## Output

```ts
type BlastRadiusEntry = {
  risk_id: string
  origin: { component_id?, integration_id?, flow_step_id? }
  impacted: { components_direct, components_transitive, flow_steps, api_operations, journeys }
  hops_max: number
  blast_radius_score: number       // 0..1
}
```

## Used by

- agent: `blast-radius-analyzer`
