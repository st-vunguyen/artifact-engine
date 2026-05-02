---
skill_id: graph-extraction
system: system-intelligence
version: 1.0
---

# Graph Extraction Skill

> Multi-source extraction of components + integrations from HLD/LLD/api-specs/business-flow.

## Steps

1. Scan HLD for: services, modules, data stores, queues. Each → Component.
2. Scan LLD for finer-grained components (sub-services, libraries).
3. Scan api-specs (OpenAPI) for: each declared server → External or Component (depending on context); each path/operation → endpoint hosted on the relevant Component.
4. Cross-reference business-flow §4 (touchpoints) and §13 (async events) with extracted Components.
5. Compose Integration edges (sync-http, async-event, db-read/write, etc.).
6. Identify externals from api-specs server URLs and HLD third-party mentions.
7. Cite evidence for each entity.

## Hard rules

- Component IDs are stable slug + deterministic.
- Every entity cites at least one source.
- Unmatched BF actors → gap; do not silently invent components.

## Used by

- agent: `system-graph-builder`
