# Shared Pattern Analysis

> Empirical analysis of the three reference systems (api-testing, business-flow, e2e-playwright) to identify what belongs in the shared core vs. what stays in domain systems.

---

## 1. Method

For each reference system in `docs/`, we asked:

| Question | Maps to |
|---|---|
| What is the input? | INPUT stage contract |
| What is the output? | TIER-3/4 artifacts |
| What's the verification mechanism? | validation-gates + verifier agents |
| What's the execution flow? | phase-runner contract |
| What artifacts pass between phases? | artifact-contracts |

The answers are below. The patterns that appear in **all three** become CORE. The patterns unique to one become DOMAIN.

---

## 2. Per-System Inputs / Outputs

### API Testing
- **Input:** OpenAPI spec, request examples, auth model
- **Analysis output:** OAS snapshot, auth/limits analysis, pagination/filter analysis, contract coverage plan
- **Generation output:** Postman collection, env files, data samples, scenario packs (E2E, contract, integration, regression), JMeter/ZAP configs, performance scenarios
- **Verification:** 7-dimension Postman quality + per-status coverage + raw vs curated reconciliation

### Business Flow
- **Input:** Mixed-format spec corpus (.md, .docx, .pdf, .xlsx, .json)
- **Analysis output:** 17-section canonical analysis (BusinessFlowStep[], StateMachine, PermissionMatrix, AsyncEvent[], RiskScore, ScenarioSeed[], Contradiction[], CrossFlowImpact[])
- **Generation output:** Mermaid flowcharts (TD), swimlanes (LR), state diagrams (v2); icon-token annotation
- **Verification:** all 17 sections present, every flow row has source citation, every Mermaid node grounded, icon tokens validated against `icon-manifest.json`

### E2E Playwright
- **Input:** OpenAPI + UI flow docs + business flow analysis (when present)
- **Analysis output:** journey graph, state-flow extraction, regression-impact map
- **Generation output:** journey scenarios, page-object suggestions, fixture data, data-driven samples
- **Verification:** journey coverage, state-flow correctness, regression-impact completeness

---

## 3. Common Patterns (→ go to CORE)

### Pattern A — Phased execution with required outputs

All three systems define phases with hard-required output sets:

```
Phase N
├── inputs:  [...required]
├── outputs: [...required]
└── gate:    Phase N+1 blocked until outputs exist + pass validation
```

→ **Core home:** `core/orchestrator/execution-engine/phase-runner.md` + `core/orchestrator/router/execution-mapping.md`.

### Pattern B — Evidence-backed claims

All three systems demand source-line citation for every claim. The shapes are slightly different but the discipline is identical.

→ **Core home:** `core/shared-rules/evidence-and-traceability.md` + `core/mcp/traceability-mcp/`.

### Pattern C — Contradiction detection

Both api-testing (`spec contradictions`) and business-flow (`Contradictions section`) explicitly track conflicting source claims rather than silently picking one.

→ **Core home:** `core/mcp/verification-mcp/` (contradiction detection).

### Pattern D — Source immutability + proposal artifacts

api-testing's `result/<slug>/01-review/` and business-flow's `02-analysis/proposals.md` both follow the rule: never mutate the spec; write proposed corrections to a side-channel.

→ **Core home:** `core/shared-rules/evidence-and-traceability.md` + artifact-contracts (proposals as a typed artifact kind).

### Pattern E — Required-files gate

Both api-testing's `00-run-phase-N.prompt.md` and business-flow's `03-full-pipeline.prompt.md` enforce "required files exist" as a gate.

→ **Core home:** `core/orchestrator/validation-gates/completeness-gate.md`.

### Pattern F — Verifier agent (separate from generator)

All three systems pair an orchestrator-or-generator with a *verifier* agent (api-report-verifier, business-flow-verifier, e2e-verifier). The verifier is a second-pass evidence reconciler, not a generator.

→ **Core home:** `core/sdk/execution-sdk/` (verifier agent template) + per-system verifier in `systems/<x>/agents/`.

### Pattern G — Input normalization (line-numbered corpus)

Both api-testing (lints OAS, snapshots, line-anchored references) and business-flow (`spec-intake/SKILL.md` produces a normalized corpus) need this same preprocessing.

→ **Core home:** `core/mcp/spec-parser-mcp/` (multi-format input → line-numbered corpus + manifest).

### Pattern H — Reporting (raw vs curated)

api-testing distinguishes `10-reports/raw/` from curated; business-flow distinguishes raw analysis from final pack. Same pattern.

→ **Core home:** `core/mcp/reporting-mcp/` (report builder with raw + curated layers).

### Pattern I — Risk hotspots → scenario seeds coupling

Business-flow's "risk hotspots → ≥1 abuse-failure scenario seed" rule mirrors api-testing's "every high-risk endpoint → ≥1 abuse scenario." Same coupling.

→ **Core home:** `core/artifact-contracts/risk-contract.md` + `core/artifact-contracts/scenario-contract.md`.

### Pattern J — Traceability matrix

api-testing and business-flow both produce traceability tables. Different domains, same shape.

→ **Core home:** `core/artifact-contracts/traceability-contract.md` + `core/mcp/traceability-mcp/`.

### Pattern K — Quality dimensions checklist

api-testing's 7-dimension Postman checklist and business-flow's 17-section completeness check are both "structured rubric → pass/fail per dimension."

→ **Core home:** `core/orchestrator/validation-gates/quality-depth-gate.md` (rubric runner).

---

## 4. Domain-Specific Patterns (→ stay in SYSTEMS)

### API Testing only
- Postman collection structure (folders, requests, tests, env vars)
- Newman / k6 / ZAP / JMeter execution wrappers
- Status-code × operation matrix (per-status coverage)
- Pagination / filtering / rate-limit analysis heuristics
- Auth model classification (bearer, OAuth2, API key, session)

### Business Flow only
- 17-section canonical schema (BusinessFlowStep, StateMachine, PermissionMatrix, AsyncEvent, RiskScore, ScenarioSeed, Contradiction, CrossFlowImpact)
- Domain pack resolution (commerce, identity, finance, etc.) → triggers domain-specific gap patterns
- Mermaid generation (flowchart TD, swimlane LR, stateDiagram-v2)
- Icon-token semantics (`domain.object.state`)
- 3-stage pipeline (analyze → mermaidize → verify)

### E2E Playwright only
- Journey graph construction
- Page-object suggestion heuristics
- Visual-regression awareness
- Browser/device matrix

→ Each lives in `systems/<system>-intelligence/{rules,skills,pipelines,agents}/`.

---

## 5. Cross-Cutting Realizations

### 5.1 The 3 systems are not equal peers

- **business-flow** is the *foundational* system. It produces the canonical model (state machine, permissions, scenarios) that the other two consume.
- **api-testing** consumes business-flow + OpenAPI to produce API test packs.
- **e2e** consumes business-flow + UI flows to produce user journeys.

Build order should reflect this.

### 5.2 The reference systems already had hidden duplication

- `verification-depth.md`, `evidence-and-traceability.md`, `repo-boundaries.md` all appear in multiple systems with slight variations. They should be ONE file in `core/shared-rules/` that all systems link to.
- `api-spec-reviewer.agent.md`, `api-report-verifier.agent.md`, `api-testing-qc.agent.md` appear in BOTH `docs/api-testing/agents/` AND `docs/e2e-playwright/.claude/agents/`. The duplication confirms the need for shared core.

### 5.3 Some "domain" patterns are actually emergent core

- "Required output files" appears as domain logic in each system but is really an orchestrator concern. Lift it.
- "Scenario coverage rubric" — different rubrics per domain, but the rubric *runner* is shared.
- "Source intake" — different file types per domain, but the *normalization* is shared.

### 5.4 What's NOT shared (intentional separation)

- The actual prompts that drive an agent's behavior — those are domain-specific by definition.
- The exact phase count and naming — each system can have 4 phases or 10; the *machinery* is shared, not the topology.
- Domain rubrics (7 dimensions for Postman, 17 sections for business flow) — the rubric data lives in domain rules; the rubric runner lives in core.

---

## 6. Proposed Core Modules (synthesized)

| Module | Purpose | Borrowed from |
|---|---|---|
| `core/orchestrator/execution-engine/phase-runner.md` | Generic phase sequencer | api-testing's 00-run-phase-N pattern |
| `core/orchestrator/validation-gates/completeness-gate.md` | "Required outputs exist" gate | api-testing + business-flow gating |
| `core/orchestrator/validation-gates/traceability-gate.md` | "Every claim cited" gate | both verification rubrics |
| `core/orchestrator/validation-gates/consistency-gate.md` | "No contradictions across artifacts" gate | both verifier agents |
| `core/orchestrator/validation-gates/quality-depth-gate.md` | "Rubric pass" gate | both rubric runners |
| `core/mcp/spec-parser-mcp/` | Multi-format → line-numbered corpus | business-flow spec-intake skill |
| `core/mcp/traceability-mcp/` | Claim → source-line citation | both traceability tables |
| `core/mcp/verification-mcp/` | Cross-source reconciliation + contradiction detection | both verifier agents |
| `core/mcp/reporting-mcp/` | Raw + curated report builder | api-testing reporting skill |
| `core/mcp/state-machine-mcp/` | State machine extraction + validation | business-flow's state machine section |
| `core/mcp/rule-analysis-mcp/` | Apply a rules rubric to an artifact | both quality rubrics |
| `core/mcp/artifact-analysis-mcp/` | Generic artifact introspection (frontmatter, contracts, evidence coverage) | the implicit lifecycle in both systems |

---

## 7. Migration Effects

When the existing 3 reference systems are re-implemented as `systems/<x>-intelligence/`:

- They lose ~30–50% of their internal volume because the shared logic moves to core.
- They gain uniform recovery, checkpointing, validation, reporting "for free."
- Cross-system flows become possible because contracts are typed and shared.
- A 4th system (e.g. `performance-intelligence`) becomes a 1–2 week task instead of a re-architecture.

---

## 8. Confirmation Checklist

Before declaring core stable:

- [ ] Every cross-cutting pattern from §3 has exactly ONE home in core
- [ ] Every domain-specific pattern from §4 lives in its system, not core
- [ ] No core file references a specific domain (e.g., "Postman" or "Mermaid")
- [ ] Every shared artifact has a contract in `core/artifact-contracts/`
- [ ] Every shared rule in `core/shared-rules/` is non-domain-specific
- [ ] Each system can be deleted without breaking the others or the core

If any of these fail, we still have leakage between core and domain.
