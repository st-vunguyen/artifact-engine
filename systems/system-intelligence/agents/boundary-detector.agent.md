---
agent_id: boundary-detector
system: system-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/system-graph.json"
  - "input/hld/**"
declared_outputs:
  - "runtime/.../02-analysis/boundaries.json"
declared_mcp: [traceability-mcp]
---

# Boundary Detector (Agent)

> Identify trust + scope boundaries in the system graph.

## Boundary kinds

| Kind | Meaning |
|---|---|
| `public` | Externally-reachable surface (e.g., public API gateway) |
| `private` | Internal services not externally addressable |
| `trusted` | Authenticated services with elevated permissions |
| `untrusted` | Components handling unauthenticated input |
| `tenant-scoped` | Multi-tenant isolation boundary |

## Output

```ts
type Boundary = {
  boundary_id: string
  name: string                      // "Public API", "Internal Service Mesh"
  kind: BoundaryKind
  contains: string[]                // component_ids
  enforces: string[]                // policy hints (auth, encryption, rate-limit)
  evidence: Evidence[]
}
```

## Process

1. Inspect HLD for explicit boundary declarations (network zones, security boundaries).
2. Inspect API specs for public-facing operations.
3. Group components into boundaries.
4. Surface ambiguous components (could be in multiple boundaries) as gaps.
5. Cite evidence.

## Hard rules

- Every Component MUST be in ≥1 boundary.
- A `public` boundary's components MUST have authentication policy declared (or surface as a security gap).
- `tenant-scoped` boundaries MUST declare what's the tenant key.
