# impact-analysis (module)

> High-level impact reasoning combining changes + system-graph + dep-map + risks.

## API

```ts
analyzeImpact(changes: Change[], graph: SystemGraph, depMap: DependencyMap, risks: Risk[]): ImpactRow[]
classifyImpact(target: string, originIds: string[], depMap: DependencyMap): "direct" | "transitive-1" | "transitive-2plus" | "data" | "contract"
buildReasoningChain(target: string, originIds: string[], depMap: DependencyMap): string
```

## Used by

- agent: `impact-analyzer`
- skill: `impact-computation`
