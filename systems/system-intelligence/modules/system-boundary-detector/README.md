# system-boundary-detector (module)

> Identify trust + scope boundaries.

## API

```ts
detectBoundaries(graph: SystemGraph, hld: NormalizedCorpus, apiSpecs: OpenAPI[]): Boundary[]
classifyBoundary(name: string, components: string[]): "public" | "private" | "trusted" | "untrusted" | "tenant-scoped"
deriveEnforces(boundary: Boundary, evidence: Evidence[]): string[]   // policy hints
```

## Heuristics

- API gateway / public host → `public`
- Internal service mesh / RFC1918 → `private`
- Tenant key on endpoints → `tenant-scoped`
- Auth required on entry → `trusted`
- Webhook receivers / public form posts → `untrusted`

## Output

`Boundary[]` per `system-graph-contract.md` §3.

## Used by

- agent: `boundary-detector`
