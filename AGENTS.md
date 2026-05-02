# AGENTS.md — Operating Manual for Agents in the Artifact Engine

> Read this before doing anything. This file is the Claude Code agent contract.
> See also: [CLAUDE.md](CLAUDE.md) (entry point), [ARCHITECTURE.md](ARCHITECTURE.md), [WORKFLOWS.md](WORKFLOWS.md), [CONTRACTS.md](CONTRACTS.md).

---

## What this repo is

The **Artifact Engine** is an AI operating system for software quality intelligence. It is NOT a prompt collection. It is layered:

1. **Substrate** — file system, git, file-based checkpoints
2. **Core** ([`core/`](core/)) — orchestrator, contracts, validators, MCPs, SDKs, shared rules
3. **Systems** ([`systems/`](systems/)) — 7 specialized intelligence systems
4. **Cross-system handoffs** ([`shared-artifacts/`](shared-artifacts/))
5. **Runtime** ([`runtime/`](runtime/)) — active executions, checkpoints, logs
6. **Outputs** ([`output/`](output/)) — finalized packages

---

## Hard operating rules

1. **Read [`core/shared-rules/`](core/shared-rules/) before any non-trivial work.**
2. **Every artifact has a contract** in [`core/artifact-contracts/`](core/artifact-contracts/).
3. **Phase gating is non-negotiable.** Never skip a validation gate or required-output check.
4. **Evidence-driven.** Every claim has a cited source line. Where source is silent → emit a Gap entry.
5. **Run-time discipline.** Only the orchestrator writes to `runtime/`. Agents write to their phase-scoped folder only.
6. **No cross-system agent calls.** Systems communicate ONLY through `shared-artifacts/`.
7. **Source immutability.** Never modify `input/`. Proposals go to `output/<package>/proposals/`.

---

## The 7 intelligence systems

Built in dependency order:

| Order | System | Produces | Consumers |
|---|---|---|---|
| 1 | [business-flow-intelligence](systems/business-flow-intelligence/) | business-flow + state-machine + risks (preliminary) + scenario seeds | every other system |
| 2 | [system-intelligence](systems/system-intelligence/) | system-graph + dependency-map | risk, test-strategy, api-testing, e2e, regression |
| 3 | [risk-intelligence](systems/risk-intelligence/) | enriched risks + blast-radius | test-strategy, api-testing, e2e, regression |
| 4 | [test-strategy-intelligence](systems/test-strategy-intelligence/) | 7-section test strategy | api-testing, e2e, regression |
| 5a | [api-testing-intelligence](systems/api-testing-intelligence/) | 10-folder API test pack + api-analysis | regression |
| 5b | [e2e-intelligence](systems/e2e-intelligence/) | Playwright pack + e2e-analysis | regression |
| 6 | [regression-intelligence](systems/regression-intelligence/) | regression set | reporting |

Stages 5a and 5b run in parallel.

---

## The canonical pipeline

```
spec → business-flow → system-graph → enriched-risks → test-strategy → (api + e2e) → regression
```

Each step's output is the next step's input. Cross-system handoffs flow through `shared-artifacts/`.

---

## Execution rules (canonical)

Every workflow runs through:

```
INPUT → ANALYSIS → GENERATION → VALIDATION → VERIFICATION → FINAL OUTPUT
```

This shape is enforced by the orchestrator. Domain workflows fill the stages with specific phases but cannot reorder, skip, or bypass.

---

## Where things live (cheat sheet)

| Need | Location |
|---|---|
| Artifact contracts | `core/artifact-contracts/` |
| Discipline rules | `core/shared-rules/` |
| Orchestrator | `core/orchestrator/` |
| Validators | `core/validators/` |
| Validation gates | `core/orchestrator/validation-gates/` |
| MCP servers | `core/mcp/` |
| SDK | `core/sdk/` |
| Domain agents | `systems/<x>-intelligence/agents/` |
| Domain rules | `systems/<x>-intelligence/rules/` |
| Skills | `systems/<x>-intelligence/skills/` |
| Workflows | `systems/<x>-intelligence/pipelines/<workflow>.workflow.yaml` |
| Modules | `systems/<x>-intelligence/modules/` |
| Templates | `systems/<x>-intelligence/templates/` |
| Schemas (per-system) | `systems/<x>-intelligence/schemas/` |
| Runtime state | `runtime/active-executions/<run-id>/` |
| Checkpoints | `runtime/checkpoints/<run-id>/` |
| Logs | `runtime/logs/<run-id>/events.jsonl` |

---

## Authoring discipline

When asked to extend the engine:

- **New artifact kind?** Define the contract first in `core/artifact-contracts/intelligence-contracts/<kind>.md`. Then write the producer agent.
- **New rule?** Add to `core/shared-rules/` (universal) or `systems/<x>/rules/` (domain). Cite where it applies.
- **New agent?** Put under `systems/<x>/agents/<name>.agent.md` with frontmatter declaring `declared_inputs`, `declared_outputs`, `declared_skills`, `declared_mcp`.
- **New workflow?** YAML under `systems/<x>/pipelines/<name>.workflow.yaml`. Conform to `core/artifact-contracts/workflow-contract.md`. Add a human `<name>.md` next to it.
- **New MCP server?** Folder under `core/mcp/<name>-mcp/` with README, tools, schemas, validators, outputs.

---

## Forbidden patterns

| Pattern | Why |
|---|---|
| Generating an artifact without a contract | Untyped boundary; downstream breakage |
| Cross-system direct calls | Architectural violation |
| Skipping validation gates | Silent fabrication |
| Hardcoding credentials in artifacts | Security |
| Writing to `input/` | Source immutability |
| Verifier modifying generated artifacts | Verifier independence |
| Manual severity / verdict overrides | Verdicts are mechanical |
| "TBD" / "TODO" / "see chat" | Use Gap entries |
| Marketing language ("seamless", "robust") | Naming-conventions rule |

---

## Style

- Markdown: ATX headings; tables for structured data; code fences with language
- JSON: 2-space indent; sorted keys for enums/maps; ISO-8601 UTC; SHA-256 hex
- File names: kebab-case slug; numbered prefixes for ordered folders
- IDs: `S01`, `R01`, `G01`, `C01`, `AS001`, `EJ01` (zero-padded)

---

## When in doubt

1. Read the relevant contract.
2. Read the relevant shared rule.
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) and [WORKFLOWS.md](WORKFLOWS.md).
4. Pick the safer / less destructive option.
5. Surface gaps and ask, instead of guessing.

---

## North star

> The artifact engine is an AI operating system, not a prompt collection.

It treats AI workflows like a real OS treats processes: scheduled, isolated, inspectable, recoverable, gated, composable. Discipline at every layer.

---

## Quick references per system

### business-flow-intelligence
Reads `input/specs/`, `input/requirements/`, `input/business-documents/`. Produces 17-section business-flow document, state machine, preliminary risks, scenario seeds.
Default workflow: [`pipelines/full-business-flow-pipeline.workflow.yaml`](systems/business-flow-intelligence/pipelines/full-business-flow-pipeline.workflow.yaml).

### system-intelligence
Reads BF + `input/hld/`, `input/lld/`, `input/api-specs/`. Produces system-graph + dependency-map + boundaries.

### risk-intelligence
Reads BF + system-graph + dependency-map + preliminary risks. Produces enriched risks with blast-radius + mitigations.

### test-strategy-intelligence
Reads BF + system-graph + risks + scenario seeds. Produces 7-section test strategy.

### api-testing-intelligence
Reads OAS + test-strategy + BF + risks. Produces 10-folder API test pack with per-status coverage. **Per-status request rule is absolute.**

### e2e-intelligence
Reads BF + test-strategy + UI flows + UI specs + (optional api-analysis). Produces Playwright test pack with strategy → scenarios → code → fixtures → execution.

### regression-intelligence
Reads BF + system-graph + dep-map + risks + api-analysis + e2e-analysis + change input. Produces prioritized regression set.

---

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [WORKFLOWS.md](WORKFLOWS.md)
- [CONTRACTS.md](CONTRACTS.md)
- [PIPELINES.md](PIPELINES.md)
- [EXECUTION-LIFECYCLE.md](EXECUTION-LIFECYCLE.md)
- [VALIDATION-GOVERNANCE.md](VALIDATION-GOVERNANCE.md)
- [RECOVERY-POLICY.md](RECOVERY-POLICY.md)
- [INTEROPERABILITY-STANDARD.md](INTEROPERABILITY-STANDARD.md)
- [docs/architecture/system-overview.md](docs/architecture/system-overview.md)
