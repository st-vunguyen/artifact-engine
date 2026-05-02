# risk-intelligence

> **Role:** identify and structure risks; compute blast-radius using the system graph; produce mitigation suggestions.
> **Position:** stage 3. Consumes business-flow + system-graph. Enriches the preliminary risk register.

---

## What it produces

| Artifact | Path | Contract | Consumers |
|---|---|---|---|
| Risk register (enriched) | `shared-artifacts/risks/<feature>.json` (replaces preliminary) | `risk-contract@1.0` | test-strategy, api-testing, e2e, regression |
| Risk map (visual) | `shared-artifacts/risks/<feature>.map.mmd` | (visualization) | reporting |
| Blast-radius analysis | `shared-artifacts/risks/<feature>.blast-radius.json` | (auxiliary) | regression-intelligence |

---

## What it consumes

```
shared-artifacts/business-flows/<feature>.md       (required; provides preliminary risks §14)
shared-artifacts/risks/<feature>.json              (preliminary; produced by business-flow-intelligence)
shared-artifacts/system-graphs/<feature>.json     (required for blast-radius)
shared-artifacts/dependency-maps/<feature>.json   (required for blast-radius)
```

---

## What it adds beyond the preliminary risks

The business-flow generator emits a preliminary risk register from the spec. Risk-intelligence enriches it with:

1. **Blast-radius** — given a risk on Component X, which other Components / business-flow steps / API operations are affected?
2. **Likelihood reasoning** — combine source signals: spec hints, integration criticality, historical incidents (if memory provided).
3. **Severity matrix application** — compute `severity` from `likelihood × impact` deterministically.
4. **Mitigation suggestions** — preventive / detective / corrective per risk.
5. **Failure-mode enumeration** — what concrete things go wrong (with user-visible effect).
6. **Coupling enforcement** — every high-severity risk gets an abuse-failure scenario seed (if BF generator missed any, surface as a gap).

---

## Canonical workflow

```
01-input        : load preliminary risk register + system graph + dep map
02-analysis     : enrich risks (blast-radius, failure modes, mitigations)
03-generation   : risk map (Mermaid), blast-radius projection
04-validation   : schema + coupling
05-verification : evidence + cross-flow alignment
06-publish      : promote (overwrites preliminary risks/<feature>.json)
```

Pipeline: [pipelines/enrich-risks.workflow.yaml](pipelines/enrich-risks.workflow.yaml)

---

## Agents

| Agent | Purpose |
|---|---|
| [risk-detector](agents/risk-detector.agent.md) | Enumerate additional risks from system graph that BF didn't surface |
| [blast-radius-analyzer](agents/blast-radius-analyzer.agent.md) | Compute blast-radius for each risk |
| [failure-mode-enumerator](agents/failure-mode-enumerator.agent.md) | Enumerate failure modes with user-visible effects |
| [mitigation-generator](agents/mitigation-generator.agent.md) | Propose preventive/detective/corrective mitigations |
| [risk-verifier](agents/risk-verifier.agent.md) | Verify enriched risk register conforms + couples |

---

## Rules

| Rule | Discipline |
|---|---|
| [risk-discipline](rules/risk-discipline.md) | Severity matrix application; required fields; coupling rule |
| [mitigation-discipline](rules/mitigation-discipline.md) | Mitigation kinds + status; ownership hints |

---

## Modules

- `modules/risk-detector/` — heuristics for risk discovery (data-integrity, concurrency, security, etc.)
- `modules/blast-radius-analysis/` — graph traversal for impact computation
- `modules/failure-point-analysis/` — common failure-mode catalogs by category
- `modules/mitigation-generator/` — preventive/detective/corrective generation

---

## Outputs

```
output/risk-analysis-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 01-source/
├── 02-analysis/
├── 03-generation/
├── 04-traceability/
└── 05-verification/
```

---

## Why this exists separately from business-flow

The business-flow generator surfaces risks from the spec, but it lacks system-level context:
- It doesn't know which components depend on which.
- It can't compute blast-radius.
- It can't catalog "common failure modes" for component kinds (database, queue, third-party API).

Risk-intelligence runs after the system graph is built, with the full topology in hand. It enriches the preliminary risks with structural reasoning the BF agent couldn't do.
