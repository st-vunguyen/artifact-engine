# scope-analysis (module)

> Decompose feature into testable scopes from BF + system-graph.

## API

```ts
deriveScopes(bf: BusinessFlow, graph: SystemGraph, risks: Risk[]): ScopeRow[]
assignPriority(scope: ScopeRow, risks: Risk[], bf: BusinessFlow): "p0" | "p1" | "p2" | "p3"
deriveInOutScope(scope: ScopeRow, graph: SystemGraph): { in_scope, out_of_scope }
```

## Heuristics

- One scope per major flow cluster (BF §4 grouping)
- One scope per system component touched by the flow
- One scope per state-machine cluster (initial → terminal path)
- Priority: linked to high-severity risk → p0; on happy path → p0; major edge → p1; ...

## Output

`ScopeRow[]` per `test-strategy-contract.md` §4.

## Used by

- agent: `scope-analyzer`
