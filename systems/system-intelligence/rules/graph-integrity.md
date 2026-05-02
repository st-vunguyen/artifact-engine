# Graph Integrity (System Rule)

> Domain rule. The hard requirements for a publishable system graph.

## Rules

1. **No orphan components.** Every declared Component must be in ≥1 Boundary or ≥1 Integration edge.
2. **Connected graph.** From any Component, you can reach a Boundary or External via integration edges.
3. **Edge endpoints declared.** Every Integration's `from` and `to` must reference a declared Component or External.
4. **No cycles in dependencies.** Cyclic dependencies are surfaced as findings (not blockers, since some systems do have intentional cycles via queues, but they require explicit acknowledgment).
5. **At least one Boundary.** A graph with zero boundaries is rejected (every system has at least an internal boundary).
6. **Externals classified.** Every External has `kind` ∈ {saas, third-party-api, marketplace, regulator, infra}.
7. **Component kinds known.** Each Component's `kind` ∈ {service, module, ui, worker, library, data-store, queue, cache}.

## Why

A graph that's structurally invalid produces unreliable downstream artifacts. Risk-intelligence cannot compute blast-radius on a disconnected graph; regression-intelligence cannot trace impact when edge endpoints are missing.

## Enforcement

- `consistency-validator` checks rules 3–7 mechanically.
- `dependency-analysis-mcp.connectivity-check` enforces rules 1, 2.
- Cycles (rule 4) are advisories with explanation.
