# Artifact Engine

> **An AI operating system for software quality intelligence.**
> Not a prompt collection. A layered, contract-driven, recoverable execution platform that turns raw specs into reliable test packs, end-to-end.

---

## What it does

Given a feature spec (Markdown, Word, PDF, OpenAPI, UI flows, …), the Artifact Engine produces — through a chained pipeline — a complete quality intelligence package:

1. A **business flow** (17 sections, state machine, risks, scenario seeds)
2. A **system graph** (services, integrations, boundaries, dependency map)
3. An **enriched risk register** (blast-radius, failure modes, mitigations)
4. A **test strategy** (7 sections: scope, approach, risks, dependencies, DoD)
5. An **API test pack** (Postman, env, status-case data, performance, security; 10-folder canonical layout, per-status coverage)
6. An **E2E test pack** (Playwright; strategy → scenarios → code → fixtures → execution; visual + a11y + responsive)
7. A **regression set** (change-driven, prioritized, budget-honoring)

Every artifact is **contract-typed**, **evidence-cited verbatim**, **phase-gated**, **checkpointed**, **resumable**, and **inspectable**.

---

## What makes it different

| Concern | Free-form prompt collection | Artifact Engine |
|---|---|---|
| Communication | Free-text between prompts | Typed contracts in `shared-artifacts/` |
| Validation | Manual review | 4 automated gates (completeness, consistency, traceability, quality-depth) |
| Evidence | "Trust the model" | Every claim cites verbatim source line |
| Recovery | Re-run from scratch | Checkpoint + resume per phase |
| Cross-system | Copy-paste / ad hoc | Producer/consumer matrix with versioning |
| Verification | Generator self-checks | Independent verifier agent per system |
| Determinism | Best effort | Idempotent phases, frozen workflow per run |

---

## Layered architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ARTIFACT ENGINE (kernel)                   │
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

Full architecture: [ARCHITECTURE.md](ARCHITECTURE.md).

---

## The canonical pipeline

```
spec → business-flow → system-graph → enriched-risks → test-strategy → (api + e2e) → regression
```

Each step's output is the next step's typed input. No system calls another's agent. Cross-system handoffs flow through `shared-artifacts/` only.

See [WORKFLOWS.md](WORKFLOWS.md) and [PIPELINES.md](PIPELINES.md).

---

## Where things live

| Need | Location |
|---|---|
| Engine kernel | [`core/`](core/) |
| Specialized systems | [`systems/`](systems/) |
| Cross-system handoffs | [`shared-artifacts/`](shared-artifacts/) |
| Active execution state | [`runtime/`](runtime/) |
| User-provided sources | [`input/`](input/) |
| Finalized packages | [`output/`](output/) |
| Layered docs | [`docs/`](docs/) |
| Agent bootstrap | [`.claude/`](.claude/) |
| High-level architecture | [`architecture/`](architecture/) |

---

## Key documents

- [CLAUDE.md](CLAUDE.md) — agent operating manual entry point
- [AGENTS.md](AGENTS.md) — full operating manual
- [ARCHITECTURE.md](ARCHITECTURE.md) — layered architecture
- [WORKFLOWS.md](WORKFLOWS.md) — pipelines + chained execution
- [PIPELINES.md](PIPELINES.md) — per-system workflow index
- [CONTRACTS.md](CONTRACTS.md) — all artifact contracts
- [EXECUTION-LIFECYCLE.md](EXECUTION-LIFECYCLE.md) — run state machine
- [VALIDATION-GOVERNANCE.md](VALIDATION-GOVERNANCE.md) — gates + verifiers
- [RECOVERY-POLICY.md](RECOVERY-POLICY.md) — failure handling
- [INTEROPERABILITY-STANDARD.md](INTEROPERABILITY-STANDARD.md) — cross-system protocol
- [ROADMAP.md](ROADMAP.md) — milestones
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to extend

---

## Slash commands (when running with the Claude Code harness)

```
/run-business-flow         — run business-flow-full-pipeline
/run-system-intelligence   — build system graph + dep map
/run-risk-analysis         — enrich risks
/run-test-strategy         — produce 7-section test strategy
/run-api-testing           — produce 10-folder API test pack
/run-e2e-analysis          — produce Playwright E2E pack
/run-regression-analysis   — compute regression set from changes
/run-full-quality-suite    — chain all of the above
```

See [`.claude/commands/`](.claude/commands/).

---

## Status

**v0.1 — Foundation (current).** This release is **architecture + design + specifications**. No runtime code yet.

Reference runtime targeted for v0.2 ([ROADMAP.md](ROADMAP.md)).

The design is comprehensive enough that any team can:
- Implement the orchestrator from `core/orchestrator/` specs
- Implement MCP servers from `core/mcp/<name>-mcp/README.md` specs
- Implement validators from `core/validators/<name>/README.md` specs
- Implement SDKs from `core/sdk/<name>/README.md` specs
- Implement system agents from `systems/<x>/agents/<id>.agent.md` specs
- Compose workflows from `systems/<x>/pipelines/*.workflow.yaml`

---

## North star

> The artifact engine treats AI workflows the way an OS treats processes: scheduled, isolated, inspectable, recoverable, gated, composable. Discipline at every layer.

Domain intelligence is the user-space program. The engine is the kernel.

---

## License

See [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
