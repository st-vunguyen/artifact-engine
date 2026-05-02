# System Design — Artifact Engine

> **One-line:** Artifact Engine is a shared AI execution platform that runs phase-gated, evidence-backed, artifact-producing workflows. Specialized intelligence systems (business-flow, api-testing, e2e) plug into it as domain layers.

---

## 1. Mental Model

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
   │ business-flow-   │ │ api-testing- │ │ e2e-         │
   │ intelligence     │ │ intelligence │ │ intelligence │
   │ (domain)         │ │ (domain)     │ │ (domain)     │
   └──────────────────┘ └──────────────┘ └──────────────┘
```

The engine answers two questions:

1. **HOW does work get executed?** (orchestrator, checkpoints, recovery, validation gates)
2. **WHAT is the shape of the work products?** (artifact contracts, shared artifacts, traceability)

Domain systems answer:

1. **WHAT is the domain producing?** (business flows, test scenarios, journeys)
2. **WHAT does "good" look like for that domain?** (domain rules, domain skills, domain verifiers)

The boundary is enforced by **artifact contracts**. Anything that crosses the core/system boundary must be a typed artifact validated against a contract.

---

## 2. Layered Architecture

### Layer 0 — Substrate
- File system (`input/`, `runtime/`, `shared-artifacts/`, `output/`)
- Git (audit history)
- File-based checkpoints

### Layer 1 — Core Platform (`core/`)
- **orchestrator/** — phase execution, routing, checkpoints, recovery, validation gates
- **artifact-contracts/** — typed schemas for every cross-boundary artifact
- **shared-rules/** — evidence/traceability/quality/naming discipline that ALL systems follow
- **validators/** — pluggable validators consumed by validation gates
- **sdk/** — helpers domain systems use (`artifact-sdk`, `workflow-sdk`, `validation-sdk`, `execution-sdk`)
- **mcp/** — shared MCP capabilities (spec parsing, traceability, verification, reporting, state machines)

### Layer 2 — Specialized Systems (`systems/`)
Each system has the same shape:

```
systems/<name>-intelligence/
├── agents/      ← domain agents (orchestrator + specialists + verifier)
├── rules/       ← domain-specific rules (extends, never duplicates, shared-rules)
├── skills/      ← domain skills (consume MCP + SDK)
├── pipelines/   ← workflow definitions (declarative, executed by orchestrator)
├── artifacts/   ← in-flight working artifacts
└── outputs/     ← finalized deliverables
```

### Layer 3 — Cross-System Artifacts (`shared-artifacts/`)
Outputs that flow between systems. Example: `business-flow.md` produced by business-flow-intelligence is consumed by api-testing-intelligence and e2e-intelligence.

### Layer 4 — Runtime State (`runtime/`)
Active executions, checkpoints, recovery state, logs. Ephemeral but structured.

---

## 3. Hard Architectural Rules

| # | Rule | Why |
|---|------|-----|
| 1 | Domain systems MUST NOT call each other directly. | Coupling explosion; only collaborate via shared-artifacts + contracts. |
| 2 | Domain systems MUST NOT duplicate orchestration, checkpointing, validation, or retry logic. | That logic lives in `core/orchestrator/`. Reimplementing it = drift. |
| 3 | Every cross-boundary artifact MUST conform to a contract in `core/artifact-contracts/`. | Without typed boundaries you cannot evolve either side independently. |
| 4 | Every claim in a generated artifact MUST be traceable to source evidence (file + line). | Evidence-driven, not generation-driven. |
| 5 | Phase N+1 cannot start until Phase N's required outputs exist AND pass validation gates. | Hard gating prevents fabrication and silent failures. |
| 6 | Shared rules in `core/shared-rules/` apply to ALL systems. Domain rules can EXTEND but never CONTRADICT. | Single source of truth for execution discipline. |
| 7 | The orchestrator is the only thing that mutates `runtime/`. Agents/skills are pure with respect to runtime state. | Single writer = recoverability. |
| 8 | Sources in `input/` are immutable. Proposed corrections live in `output/` or `shared-artifacts/`. | Audit trail; never silently rewrite the user's spec. |

---

## 4. What This Architecture Eliminates

Compared to "3 separate prompt collections," this design eliminates:

- ❌ Duplicate phase orchestration (each system reimplementing run-phase-N)
- ❌ Duplicate checkpoint logic
- ❌ Duplicate validation gates
- ❌ Duplicate retry / recovery logic
- ❌ Duplicate evidence/traceability checking
- ❌ Duplicate artifact validators
- ❌ Inconsistent verification depth across systems
- ❌ Untyped artifact handoffs between systems
- ❌ Silent contradictions when systems analyze the same source

---

## 5. What This Architecture Enables

- ✅ Add a 4th system (e.g. `performance-intelligence`) without touching core
- ✅ Upgrade orchestration once, all systems benefit
- ✅ Cross-system artifact reuse (business-flow.md feeds api-testing.md feeds e2e.md)
- ✅ Uniform recovery/resume semantics — interrupt any pipeline, resume cleanly
- ✅ Uniform "evidence-first" discipline at every level
- ✅ Centralized verification gates that block low-quality outputs

---

## 6. Build Order (DO NOT SKIP)

1. **`core/artifact-contracts/`** — define WHAT flows. Without this, nothing else has structure.
2. **`core/shared-rules/`** — define HOW the system thinks. Without this, agents drift.
3. **`core/orchestrator/`** — define HOW work runs. Without this, nothing executes uniformly.
4. **`core/validators/` + `core/orchestrator/validation-gates/`** — define WHAT GOOD LOOKS LIKE.
5. **`core/mcp/`** (spec-parser-mcp, traceability-mcp, verification-mcp first) — shared capabilities.
6. **`core/sdk/`** — convenience layer the systems consume.
7. **`systems/business-flow-intelligence/`** — first domain system (it produces the canonical business model).
8. **`systems/api-testing-intelligence/`** — consumes business-flow + OpenAPI; produces test packs.
9. **`systems/e2e-intelligence/`** — consumes business-flow + UI flows; produces user journeys.

Each layer builds on the layer below. Skipping a layer = technical debt that compounds.

---

## 7. Anti-Patterns This Design Refuses

- "Quick prototype each system, refactor later." → No. Refactor never happens; you ship 3 incompatible silos.
- "Let agents talk to each other directly." → No. Only artifacts cross boundaries.
- "Put business logic in core because it's reusable." → No. Reusable execution logic only. Domain knowledge stays in systems.
- "Skip the validation gate, it's slow." → No. Without gates, the system fabricates confidently.
- "We'll add traceability later." → No. Traceability is foundational; retrofit is impossible at scale.

---

## 8. Cross-Cutting Concerns (handled by core, never re-implemented)

| Concern | Where it lives |
|---------|----------------|
| Workflow routing | `core/orchestrator/router/` |
| Phase execution | `core/orchestrator/execution-engine/` |
| Checkpoint / resume | `core/orchestrator/checkpoint-system/` |
| Failure recovery | `core/orchestrator/recovery-system/` |
| Quality gates | `core/orchestrator/validation-gates/` |
| Artifact validation | `core/validators/` |
| Spec parsing | `core/mcp/spec-parser-mcp/` |
| Traceability | `core/mcp/traceability-mcp/` |
| Cross-source verification | `core/mcp/verification-mcp/` |
| Reporting | `core/mcp/reporting-mcp/` |
| Evidence discipline | `core/shared-rules/evidence-and-traceability.md` |
| Naming | `core/shared-rules/naming-conventions.md` |

If a system needs one of these and "just does it themselves," that is an architectural violation.

---

## 9. North Star

> **The artifact engine is an AI operating system, not a prompt collection.**

It treats AI workflows the way a real OS treats processes:
- scheduled (orchestrator)
- isolated (contracts)
- inspectable (traceability)
- recoverable (checkpoints)
- gated (validation)
- composable (SDK + MCP)

Domain intelligence is the user-space program. The engine is the kernel.
