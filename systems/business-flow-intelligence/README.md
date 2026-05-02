# business-flow-intelligence

> **Role:** the foundational analysis system. Reads raw spec material; produces the canonical model of a feature's process.
> **Position in the canonical pipeline:** stage 1 (no upstream dependencies; everyone consumes its output).

---

## What it produces

| Artifact | Path | Contract | Consumers |
|---|---|---|---|
| Business flow document | `shared-artifacts/business-flows/<feature>.md` | `business-flow-contract@1.0` | system-intelligence, risk-intelligence, test-strategy-intelligence, api-testing-intelligence, e2e-intelligence |
| State machine | `shared-artifacts/state-machines/<feature>.json` + `.mmd` | `business-flow-contract@1.0` | risk-intelligence, e2e-intelligence |
| Risk register (preliminary) | `shared-artifacts/risks/<feature>.json` | `risk-contract@1.0` | risk-intelligence (enriches), test-strategy-intelligence |
| Scenario seeds | `shared-artifacts/scenarios/<feature>.seed.json` | `scenario-contract@1.0` | api-testing, e2e |

---

## What it consumes

```
input/specs/<feature>/...           ← any format: .md, .docx, .pdf, .xlsx, .csv, .json
input/requirements/<feature>/...
input/business-documents/<feature>/...
```

No `consumes_shared` — this is the root of the chain.

---

## Canonical workflow

```
01-input        : Source intake → normalized corpus
02-analysis     : 17-section analysis (the canonical business-flow document)
03-generation   : Mermaid pack (flowchart + swimlane + state-diagram)
04-validation   : Schema + rule validation
05-verification : Evidence reconciliation
06-publish      : Promote to shared-artifacts/ + output/business-flow-packages/
```

Pipeline file: [pipelines/full-business-flow-pipeline.workflow.yaml](pipelines/full-business-flow-pipeline.workflow.yaml)

---

## Agents

| Agent | Purpose |
|---|---|
| [spec-analyzer](agents/spec-analyzer.agent.md) | Phase 1: normalize sources to line-numbered corpus |
| [business-flow-generator](agents/business-flow-generator.agent.md) | Phase 2: produce 17-section analysis |
| [business-rule-extractor](agents/business-rule-extractor.agent.md) | Subskill: extract business rules from sources |
| [state-transition-extractor](agents/state-transition-extractor.agent.md) | Subskill: extract state machine |
| [actor-flow-analyzer](agents/actor-flow-analyzer.agent.md) | Subskill: derive actor responsibilities |
| [ambiguity-detector](agents/ambiguity-detector.agent.md) | Subskill: surface gaps and contradictions |
| [mermaid-generator](agents/mermaid-generator.agent.md) | Phase 3: produce Mermaid pack |
| [business-flow-verifier](agents/business-flow-verifier.agent.md) | Phase 5: verify evidence + 17-section completeness |

---

## Rules

| Rule | Discipline |
|---|---|
| [business-flow-artifacts](rules/business-flow-artifacts.md) | The canonical 17-section structure; required outputs per phase |
| [mermaid-visual-standards](rules/mermaid-visual-standards.md) | Mermaid init block, classes, link styles, semantic icon tokens |
| [spec-clarity-review](rules/spec-clarity-review.md) | Extraction quality bar (one action per step, decision/condition explicit, ambiguity declared) |
| [state-transition-rules](rules/state-transition-rules.md) | State machine integrity: no orphans, every transition has trigger + evidence |
| [repo-boundaries](rules/repo-boundaries.md) | Allowed/forbidden scope of this system |

---

## Skills

| Skill | Purpose |
|---|---|
| [spec-intake](skills/spec-intake/SKILL.md) | Multi-format source normalization |
| [analysis-extraction](skills/analysis-extraction/SKILL.md) | 17-section extraction from corpus |
| [mermaid-pack](skills/mermaid-pack/SKILL.md) | Mermaid generation with semantic icon tokens |
| [verification](skills/verification/SKILL.md) | Evidence + section completeness check |

---

## Modules

| Module | Role |
|---|---|
| `modules/actor-extractor/` | Identify actors, roles, personas from corpus |
| `modules/rule-extractor/` | Extract business rules; categorize |
| `modules/flow-builder/` | Compose flow rows from extracted facts |
| `modules/state-machine-builder/` | Build state machine from transitions |
| `modules/critical-path-detector/` | Identify high-impact paths through flows |

Modules are in-process helpers used by skills and the analysis-extraction agent.

---

## Pipelines

- [analyze-spec-to-business-flow](pipelines/analyze-spec-to-business-flow.md) — phase 2 only (analysis)
- [business-flow-verification](pipelines/business-flow-verification.md) — verification-only re-run
- [mermaid-generation](pipelines/mermaid-generation.md) — phase 3 only (mermaid pack)
- [full-business-flow-pipeline](pipelines/full-business-flow-pipeline.md) — end-to-end (DEFAULT)

---

## Outputs

```
output/business-flow-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 01-source/normalized/
├── 02-analysis/business-flow-document.md
├── 03-mermaid/business-flow-mermaid.md
├── 04-traceability/<feature>.matrix.json
└── 05-verification/<feature>.report.md
```

---

## How it differs from a "prompt that generates business flows"

- 17 sections enforced, not optional.
- Every claim cites a source line; no fabrication.
- Gaps are first-class (declared, not silently filled).
- Risks and scenario seeds are structurally coupled (every high risk → ≥1 abuse seed).
- Output is contracted; downstream systems can consume reliably.
- Re-run is idempotent and resumable.
