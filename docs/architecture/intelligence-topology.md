# Intelligence Topology

> The 7 systems and how they relate.

## Topology graph

```
                     ┌─ business-flow-intelligence  (root; no deps)
                     │
        ┌────────────┴──────────┐
        ▼                       ▼
system-intelligence       (BF feeds others)
        │
        ▼
risk-intelligence  ─────► test-strategy-intelligence
                                  │
                  ┌───────────────┼───────────────┐
                  ▼                               ▼
   api-testing-intelligence          e2e-intelligence
                  │                               │
                  └───────────────┬───────────────┘
                                  ▼
                       regression-intelligence
                       (consumes api-analysis + e2e-analysis + change input)
```

## Roles

| System | Stage | Role |
|---|---|---|
| business-flow | 1 | Foundational analysis: 17-section model + state machine + preliminary risks + scenario seeds |
| system | 2 | Structural model: components + integrations + boundaries + dependency map |
| risk | 3 | Enriched risks: blast-radius + failure modes + mitigations |
| test-strategy | 4 | Bridge: 7-section strategy with scope, approach, DoD |
| api-testing | 5a | Executable API pack: 10-folder structure with per-status coverage |
| e2e | 5b | Executable E2E pack: Playwright with strategy / scenarios / code / fixtures / execution |
| regression | 6 | Change-driven: prioritized regression set |

## Why this order

Each system depends only on what's been published before it. No system calls another's agent. The DAG is acyclic, which is what makes the orchestrator's chained workflow runs deterministic.

## See also

- [INTEROPERABILITY-STANDARD.md](../../INTEROPERABILITY-STANDARD.md)
- [WORKFLOWS.md](../../WORKFLOWS.md)
