# dependency-analysis-mcp

> **MCP server.** System graph + dependency map analysis: connectivity, centrality, blast-radius, criticality.

---

## Purpose

Used by system-intelligence (build the graph), risk-intelligence (compute blast-radius), regression-intelligence (compute change impact). Centralizes graph algorithms.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `connectivity-check(graph)` | `SystemGraph` | `{ connected: boolean, orphans: string[], issues: Issue[] }` |
| `centrality(graph, kind)` | `graph, "degree" \| "betweenness"` | `Record<component_id, number>` |
| `criticality(map)` | `DependencyMap` | `Record<edge_id, "low"\|"medium"\|"high"\|"critical">` |
| `blast-radius(origin, depMap, hops_max)` | `{ origin: string, depMap, hops_max?: number }` | `BlastRadiusEntry` |
| `data-readers(dataStoreId, graph)` | as named | `string[]` (component_ids) |
| `contract-consumers(operationId, graph)` | as named | `string[]` |
| `topological-sort(graph)` | `SystemGraph` | `string[]` (component_ids in order) |
| `detect-cycles(graph)` | `SystemGraph` | `Cycle[]` |

---

## Algorithms

- **Connectivity** — BFS/DFS to confirm every component reachable from a Boundary or External
- **Centrality** — degree (fan_in + fan_out) by default; betweenness available for richer scoring
- **Criticality** — composite from boundary-cross + SLA + happy-path + risk linkage
- **Blast-radius** — BFS over dependency-map; capped at `hops_max ≤ 5`

---

## Hard rules

- `hops_max ≤ 5` enforced on `blast-radius`
- Returned scores normalized to [0, 1]
- Orphans returned as a list (caller decides how to handle)

---

## Used by

- agent: `system-graph-builder`, `dependency-mapper`, `blast-radius-analyzer`, `impact-analyzer`
- skill: `dependency-projection`, `impact-computation`
