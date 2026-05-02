# Dependency Graph

> Workflow-level dependencies through `consumes_shared` declarations.

## Workflow-level DAG

| Workflow | Consumes | Produces |
|---|---|---|
| `business-flow-full-pipeline` | input/specs, requirements, business-documents | business-flow, state-machine, risks (preliminary), scenario-seeds |
| `system-graph-pipeline` | business-flow, hld, lld, api-specs | system-graph, dependency-map |
| `enrich-risks-pipeline` | business-flow, risks, system-graph, dependency-map, scenario-seeds | risks (enriched), blast-radius |
| `test-strategy-pipeline` | business-flow, risks, system-graph, scenario-seeds, dependency-map | test-strategy, system-overview |
| `api-test-full-pipeline` | api-specs, business-flow, test-strategy, system-graph, risks, scenario-seeds | api-analysis, api-coverage, oas-snapshot, api-scenarios |
| `e2e-full-pipeline` | business-flow, test-strategy, state-machine, risks, scenario-seeds, api-analysis (optional), ui-specs, ui-flows | e2e-analysis, journey-graph, poms, e2e-scenarios |
| `regression-analysis-pipeline` | business-flow, system-graph, dependency-map, risks, api-analysis, e2e-analysis, api-scenarios, e2e-scenarios, change-input | regression-analysis |

## DAG visualization

```
business-flow-full-pipeline
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
system   enrich   test-strategy (waits for risk + system)
   │     risks
   └─┬─────┘
     │
     └────► test-strategy
                  │
       ┌──────────┼──────────┐
       ▼                     ▼
   api-test               e2e
       │                     │
       └─────────┬───────────┘
                 ▼
           regression
```

## Detection

The orchestrator detects this DAG from each workflow's `consumes_shared` and `produces_shared`. Cycles refused at registration time.

## See also

- [INTEROPERABILITY-STANDARD.md](../../INTEROPERABILITY-STANDARD.md)
- [intelligence-topology.md](intelligence-topology.md)
