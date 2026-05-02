# dependency-impact (module)

> Dep-map traversal helpers for transitive impact.

## API

```ts
bfsImpact(originId: string, depMap: DependencyMap, hops_max: number): ImpactSet
dataReaders(dataStoreId: string, graph: SystemGraph): string[]
contractConsumers(operationId: string, graph: SystemGraph): string[]
```

## Caps

- hops_max ≤ 5
- Per-change impacted set ≤ 50 (else surface "scope too broad" finding)

## Used by

- module: `impact-analysis`
- skill: `impact-computation`
