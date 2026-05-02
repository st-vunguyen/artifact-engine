# System Overview (Architecture)

> The 30-second mental model.

```
┌─────────────────────────────────────────────────────────────────┐
│                      ARTIFACT ENGINE                            │
│  shared execution intelligence + shared capabilities            │
│                                                                 │
│   orchestrator   contracts   validators   SDK   MCP   rules     │
└─────────────────────────────────────────────────────────────────┘
              ▲                ▲                ▲
              │                │                │
   ┌──────────┴───────┐ ┌──────┴───────┐ ┌──────┴───────┐
   │ business-flow-   │ │ system-      │ │ risk-        │
   │ intelligence     │ │ intelligence │ │ intelligence │
   └──────────────────┘ └──────────────┘ └──────────────┘
   ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
   │ test-strategy-   │ │ api-testing- │ │ e2e-         │
   │ intelligence     │ │ intelligence │ │ intelligence │
   └──────────────────┘ └──────────────┘ └──────────────┘
                       ┌──────────────┐
                       │ regression-  │
                       │ intelligence │
                       └──────────────┘
```

The engine answers HOW work runs. Systems answer WHAT to produce.

Cross-system handoffs through `shared-artifacts/` only.

For the full architecture, see [ARCHITECTURE.md](../../ARCHITECTURE.md) and [architecture/system-design.md](../../architecture/system-design.md).
