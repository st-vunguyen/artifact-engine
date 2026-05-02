# system-intelligence

> **Role:** build the structural model — services, modules, integrations, data flows, boundaries.
> **Position:** stage 2. Consumes business-flow + raw HLD/LLD/api-specs. Produces system-graph.

---

## What it produces

| Artifact | Path | Contract | Consumers |
|---|---|---|---|
| System graph | `shared-artifacts/system-graphs/<feature>.json` + `.md` + `.diagram.mmd` | `system-graph-contract@1.0` | risk, test-strategy, api-testing, e2e, regression |
| Dependency map | `shared-artifacts/dependency-maps/<feature>.json` | `system-graph-contract@1.0` (projection) | regression-intelligence (primary), test-strategy |

---

## What it consumes

```
shared-artifacts/business-flows/<feature>.md       (required)
input/hld/<feature>/...                            (encouraged)
input/lld/<feature>/...                            (encouraged)
input/api-specs/<feature>/...                      (when REST APIs are in scope)
```

The business-flow's Section 4 (touchpoints) and Section 13 (async events) are primary inputs.

---

## Canonical workflow

```
01-input        : intake corpus (HLD/LLD/api-specs/business-flow)
02-analysis     : component + integration extraction
03-generation   : Mermaid system diagram + dependency map projection
04-validation   : graph integrity + connectivity
05-verification : evidence + cross-flow alignment
06-publish      : promote
```

Pipeline: [pipelines/build-system-graph.workflow.yaml](pipelines/build-system-graph.workflow.yaml)

---

## Agents

| Agent | Purpose |
|---|---|
| [system-graph-builder](agents/system-graph-builder.agent.md) | Primary: extract components + integrations from HLD/LLD + business-flow |
| [dependency-mapper](agents/dependency-mapper.agent.md) | Project the graph into a focused dependency map |
| [boundary-detector](agents/boundary-detector.agent.md) | Identify trust boundaries, scope edges |
| [system-graph-verifier](agents/system-graph-verifier.agent.md) | Verify graph integrity + connectivity + alignment with business-flow |

---

## Rules

| Rule | Discipline |
|---|---|
| [graph-integrity](rules/graph-integrity.md) | No orphan components; every integration's endpoints exist; graph connected |
| [boundary-discipline](rules/boundary-discipline.md) | Boundary kinds; what each implies; mutual exclusivity |
| [evidence-grounding](rules/evidence-grounding.md) | Every component cited; HLD/LLD precedence over inferred |

---

## Skills

| Skill | Purpose |
|---|---|
| [graph-extraction](skills/graph-extraction/SKILL.md) | Multi-source extraction of components/integrations |
| [dependency-projection](skills/dependency-projection/SKILL.md) | Build dependency-only map |

---

## Modules

- `modules/dependency-mapper/` — heuristic mapping of in-/out-edges
- `modules/architecture-analyzer/` — pattern detection (event-driven, microservices, etc.)
- `modules/integration-mapper/` — HTTP/queue/db integration extraction
- `modules/system-boundary-detector/` — identify trust + scope boundaries

---

## Outputs

```
output/system-analysis-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 01-source/normalized/
├── 02-analysis/system-graph.json
├── 03-mermaid/system-graph.diagram.mmd
├── 04-traceability/
└── 05-verification/
```

---

## Why it exists

Without a system graph, downstream systems either:
- Re-derive structure ad hoc (causing drift), or
- Operate at the business level only (missing infra impact).

The graph centralizes structural knowledge. Risk-intelligence uses it for blast-radius. Regression uses it for change impact. API-testing uses it to plan mocks. E2E uses it to plan integration points.
