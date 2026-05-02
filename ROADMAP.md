# ROADMAP.md — Artifact Engine

> Build order, milestones, and what comes next.

---

## v0.1 — Foundation (current)

**Status:** complete (this commit)

- ✅ Architecture documented (`architecture/`, `ARCHITECTURE.md`)
- ✅ All artifact contracts (`core/artifact-contracts/`)
- ✅ All shared rules (`core/shared-rules/`)
- ✅ Orchestrator design (router, execution-engine, checkpoint, recovery, validation-gates, workflow-engine)
- ✅ All 4 validators
- ✅ All 5 SDKs
- ✅ All 8 MCP server specs
- ✅ All 7 systems with agents / rules / skills / modules / pipelines / templates / schemas
- ✅ Root governance (CLAUDE, AGENTS, WORKFLOWS, ARCHITECTURE, CONTRACTS, PIPELINES, EXECUTION-LIFECYCLE, VALIDATION-GOVERNANCE, RECOVERY-POLICY, INTEROPERABILITY-STANDARD)
- ✅ docs/ layered (vision, architecture, standards, playbooks)
- ✅ .claude/ (bootstrap, commands, execution, context)

This release is **architecture + design + specifications**. No runtime code yet.

---

## v0.2 — Reference Runtime (next)

**Goals:** ship a minimum runnable orchestrator + one end-to-end pipeline.

- [ ] Reference orchestrator implementation (TypeScript, Node ≥18)
  - workflow parser
  - phase runner
  - checkpoint manager
  - recovery engine
  - validation gates (4)
- [ ] Reference MCP servers (4 priority): spec-parser, traceability, verification, reporting
- [ ] business-flow-intelligence: end-to-end runnable
- [ ] CI: workflow lint + contract validation on every PR

**Deliverable:** `pnpm run start --workflow business-flow-full-pipeline --feature checkout` produces a complete artifact pack from `input/specs/checkout/`.

---

## v0.3 — Two More Systems

- [ ] system-intelligence (graph extraction)
- [ ] risk-intelligence (enrichment)
- [ ] Remaining MCPs: state-machine, dependency-analysis, risk-analysis, business-flow

**Deliverable:** chained pipeline `BF → system → risk` runs end-to-end.

---

## v0.4 — Test Strategy + Execution Tracks

- [ ] test-strategy-intelligence
- [ ] api-testing-intelligence (10-folder pack, per-status rule, 7-dimension rubric)
- [ ] e2e-intelligence (Playwright pack, two-pass execution)

**Deliverable:** spec → test packs end-to-end.

---

## v0.5 — Regression + Reporting Polish

- [ ] regression-intelligence (full)
- [ ] regression-analysis-mcp
- [ ] rule-analysis-mcp + artifact-analysis-mcp
- [ ] Executive summary roll-ups
- [ ] CLI + watcher

**Deliverable:** change-driven regression sets + cross-system executive reports.

---

## v0.6 — Interactive Operator

- [ ] Interactive orchestrator (ask-user prompts)
- [ ] Hot checkpoints for long phases
- [ ] Slack / web UI for runs
- [ ] Rich dashboards

---

## v1.0 — Production-grade

- [ ] Multi-tenant isolation
- [ ] Cross-feature aggregation
- [ ] Memory model (known risks, known patterns, prior incidents)
- [ ] Pluggable agent runtimes (Claude / GPT / local models)
- [ ] Comprehensive test coverage on engine itself

---

## Future systems (designed-for)

| Future system | Reads | Produces | Why |
|---|---|---|---|
| `performance-intelligence` | BF + api-testing scenarios | shared-artifacts/performance/ | Derive load profiles from real flows |
| `security-intelligence` | OpenAPI + BF | shared-artifacts/security/threats.json | Threat model from flow + spec |
| `accessibility-intelligence` | UI flows + BF | shared-artifacts/a11y/ | A11y test plans from journeys |

The contracts and orchestrator already accommodate these — only need a new producer/consumer matrix entry.

---

## Out of scope

- Replacing existing CI/CD
- Direct production deployment of generated tests (CI runs them)
- AI agent training / fine-tuning
- Replacing humans (the engine pairs with them)

---

## Versioning policy

- Breaking changes to contracts → bump major + migration guide
- Minor additions → backward-compatible
- Reference implementation versions independently from contracts

See [docs/standards/](docs/standards/) for the discipline that governs each release.
