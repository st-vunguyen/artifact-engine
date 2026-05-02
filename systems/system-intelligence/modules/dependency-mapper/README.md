# dependency-mapper (module)

> Heuristic mapping of in/out edges between components.

## API

```ts
mapDependencies(graph: SystemGraph): DependencyMap
computeFanInOut(graph: SystemGraph): { fan_in, fan_out, degree }
computeCentrality(graph: SystemGraph, kind: "degree" | "betweenness"): Record<component_id, number>
annotateCriticality(map: DependencyMap, risks: Risk[]): DependencyMap
```

## Heuristics for criticality

- Boundary cross (public ↔ private) → +1
- SLA on integration declared → +1
- Happy-path dependency → +1
- Linked to risk severity ≥ high → +2

Map values: low / medium / high / critical.

## Output

`shared-artifacts/dependency-maps/<feature>.json`

## Used by

- agent: `dependency-mapper`
- skill: `dependency-projection`
