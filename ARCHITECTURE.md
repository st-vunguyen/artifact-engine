# ARCHITECTURE.md — Artifact Engine

> The architecture in one document. For deeper detail, see `docs/architecture/` and `architecture/`.

---

## North star

> The artifact engine is an AI operating system for software quality intelligence — not a prompt collection.

It treats AI workflows like a real OS treats processes:
- **scheduled** — orchestrator
- **isolated** — typed contracts
- **inspectable** — traceability + events log
- **recoverable** — checkpoints + resume
- **gated** — validation gates
- **composable** — SDK + MCP

Domain intelligence is the user-space program. The engine is the kernel.

---

## Layered architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ARTIFACT ENGINE (kernel)                   │
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

                              cross-system handoffs
                              ─────────────────────
                                 shared-artifacts/
```

---

## Three core questions

The engine answers two; the systems answer two.

| Engine answers | Systems answer |
|---|---|
| **HOW does work get executed?** (orchestrator, checkpoints, recovery, gates) | **WHAT is the domain producing?** (business flows, test scenarios, journeys) |
| **WHAT is the shape of work products?** (artifact contracts, shared artifacts, traceability) | **WHAT does "good" look like for that domain?** (domain rules, skills, verifiers) |

---

## Layer by layer

### Layer 0 — Substrate
- File system (`input/`, `runtime/`, `shared-artifacts/`, `output/`)
- Git (audit history)
- File-based checkpoints

### Layer 1 — Core Platform (`core/`)

| Subsystem | Path | Role |
|---|---|---|
| Orchestrator | [core/orchestrator/](core/orchestrator/) | Phase execution, routing, checkpoints, recovery, validation gates |
| Artifact contracts | [core/artifact-contracts/](core/artifact-contracts/) | Typed schemas for every cross-boundary artifact |
| Shared rules | [core/shared-rules/](core/shared-rules/) | Discipline that ALL systems follow |
| Validators | [core/validators/](core/validators/) | Pluggable validators (artifact / consistency / traceability / completeness) |
| SDK | [core/sdk/](core/sdk/) | Helpers for systems (artifact / workflow / validation / execution / reporting) |
| MCP | [core/mcp/](core/mcp/) | Shared capabilities (parsing / traceability / verification / reporting / state-machine / ...) |

### Layer 2 — Specialized Systems (`systems/`)

7 systems. Same shape:

```
systems/<name>-intelligence/
├── README.md
├── agents/      ← domain agents
├── rules/       ← domain rules (extends shared-rules)
├── skills/      ← domain skills (consume MCP + SDK)
├── modules/     ← in-process helpers
├── templates/   ← deliverable templates
├── schemas/     ← per-system schemas
├── pipelines/   ← workflow definitions
├── artifacts/   ← in-flight working artifacts (runtime)
└── outputs/     ← finalized deliverables (runtime)
```

### Layer 3 — Cross-system Artifacts (`shared-artifacts/`)
Outputs that flow between systems. Typed against contracts.

### Layer 4 — Runtime State (`runtime/`)
Active executions, checkpoints, recovery state, logs. Ephemeral but structured.

### Layer 5 — Output (`output/`)
Finalized packages. Signed (manifest + index). Versioned. Inspectable.

---

## Hard architectural rules

| # | Rule | Why |
|---|---|---|
| 1 | Domain systems MUST NOT call each other directly | Coupling explosion |
| 2 | Domain systems MUST NOT duplicate orchestration / checkpointing / validation / recovery | Drift; that logic lives in `core/orchestrator/` |
| 3 | Every cross-boundary artifact MUST conform to a contract | Untyped boundaries break independent evolution |
| 4 | Every claim MUST be traceable to source evidence | Evidence-driven, not generation-driven |
| 5 | Phase N+1 cannot start until Phase N's outputs exist + pass gates | Hard gating prevents fabrication and silent failures |
| 6 | Shared rules in `core/shared-rules/` apply to ALL systems | Single source of truth |
| 7 | The orchestrator is the only thing that mutates `runtime/` | Single writer = recoverability |
| 8 | Sources in `input/` are immutable | Audit trail; no silent rewrites |

---

## What the architecture eliminates

Compared to "3 separate prompt collections":

- ❌ Duplicate phase orchestration
- ❌ Duplicate checkpoint logic
- ❌ Duplicate validation gates
- ❌ Duplicate retry / recovery logic
- ❌ Duplicate evidence/traceability checking
- ❌ Untyped artifact handoffs between systems
- ❌ Silent contradictions when systems analyze the same source

## What the architecture enables

- ✅ Add a 4th system without touching core
- ✅ Upgrade orchestration once, all systems benefit
- ✅ Cross-system artifact reuse (BF → test-strategy → api/e2e)
- ✅ Uniform recovery / resume semantics
- ✅ Uniform "evidence-first" discipline
- ✅ Centralized verification gates

---

## Build order (canonical)

1. `core/artifact-contracts/` — typed shapes
2. `core/shared-rules/` — discipline
3. `core/orchestrator/` — execution
4. `core/validators/` + `core/orchestrator/validation-gates/`
5. `core/mcp/` (spec-parser, traceability, verification first)
6. `core/sdk/`
7. `systems/business-flow-intelligence/`
8. `systems/system-intelligence/`
9. `systems/risk-intelligence/`
10. `systems/test-strategy-intelligence/`
11. `systems/api-testing-intelligence/` + `systems/e2e-intelligence/` (parallel)
12. `systems/regression-intelligence/`

Each layer builds on those below. Skipping = compounding tech debt.

---

## See also

- [docs/architecture/system-overview.md](docs/architecture/system-overview.md)
- [docs/architecture/execution-lifecycle.md](docs/architecture/execution-lifecycle.md)
- [docs/architecture/workflow-engine.md](docs/architecture/workflow-engine.md)
- [docs/architecture/artifact-flow.md](docs/architecture/artifact-flow.md)
- [docs/architecture/intelligence-topology.md](docs/architecture/intelligence-topology.md)
- [docs/architecture/dependency-graph.md](docs/architecture/dependency-graph.md)
- [docs/architecture/recovery-architecture.md](docs/architecture/recovery-architecture.md)
- [docs/architecture/validation-architecture.md](docs/architecture/validation-architecture.md)
