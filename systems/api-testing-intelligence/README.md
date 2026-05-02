# api-testing-intelligence

> **Role:** produce the executable API test pack — Postman collections, env, data, traceability, performance, security baseline.
> **Position:** stage 5 (parallel with e2e). Consumes business-flow + test-strategy + system-graph + risks + scenario seeds + OpenAPI.

---

## What it produces

| Artifact | Path | Contract | Consumers |
|---|---|---|---|
| API analysis | `shared-artifacts/api-analysis/<feature>.json` + `.md` | `api-analysis-contract@1.0` | e2e (touchpoints), regression, reporting |
| Coverage matrix | `shared-artifacts/api-analysis/<feature>.coverage-matrix.json` | (projection) | regression, reporting |
| API scenarios | `shared-artifacts/scenarios/<feature>.api.json` | `scenario-contract@1.0` | regression |
| OAS snapshot | `shared-artifacts/api-analysis/<feature>.oas-snapshot.json` | (audit) | downstream tooling |
| Review findings | `shared-artifacts/api-analysis/<feature>.review-findings.json` | (proposals) | spec stewards |

Plus the runtime test pack in `output/api-qc-packages/<feature>/` (Postman, env, data, performance, etc.).

---

## What it consumes

```
shared-artifacts/business-flows/<feature>.md       (required)
shared-artifacts/test-strategies/<feature>.md      (required)
shared-artifacts/system-graphs/<feature>.json     (required)
shared-artifacts/risks/<feature>.json              (required)
shared-artifacts/scenarios/<feature>.seed.json     (required)
shared-artifacts/state-machines/<feature>.json    (required)
input/api-specs/<feature>/openapi.yaml             (required)
```

---

## Canonical workflow (4-phase, mirroring api-testing-tool reference)

```
phase-1 — review-and-strategy:
  01-input          : load OAS + shared inputs
  02-review         : OpenAPI lint + auth/limits + pagination + patterns + snapshot
  03-strategy       : api-specific strategy (already informed by upstream test-strategy)

phase-2 — core-pack:
  04-collection     : full-api-collection.json (per-status expanded)
  05-env            : .env.example + environment-variable-contract.md
  06-data           : status-case data samples (200, 201, 400, 401, 403, 409, 429, 5xx)

phase-3 — scenario-packs:
  07-e2e            : e2e journeys + e2e-collection
  08-contract       : contract coverage + contract-collection
  09-integration    : integration flows + integration-collection
  10-regression     : regression scenarios + regression-collection

phase-4 — non-functional:
  11-performance    : k6 + Newman + JMeter
  12-security       : ZAP baseline
  13-verification   : raw vs curated reconciliation
  14-publish        : promote
```

Pipeline: [pipelines/full-api-qc-pipeline.workflow.yaml](pipelines/full-api-qc-pipeline.workflow.yaml)

---

## Agents

| Agent | Purpose |
|---|---|
| [api-spec-reviewer](agents/api-spec-reviewer.agent.md) | Phase 1: OpenAPI lint, auth/limits, pagination |
| [api-strategy-builder](agents/api-strategy-builder.agent.md) | Phase 1: API-specific strategy refinement |
| [api-collection-builder](agents/api-collection-builder.agent.md) | Phase 2: Postman collection + per-status expansion |
| [api-env-data-builder](agents/api-env-data-builder.agent.md) | Phase 2: env vars + data samples |
| [api-scenario-builder](agents/api-scenario-builder.agent.md) | Phase 3: e2e/contract/integration/regression scenarios |
| [api-performance-builder](agents/api-performance-builder.agent.md) | Phase 4: k6/JMeter scaffolds |
| [api-security-builder](agents/api-security-builder.agent.md) | Phase 4: ZAP baseline config |
| [api-report-verifier](agents/api-report-verifier.agent.md) | Phase 4: verify raw vs curated reports |
| [api-testing-qc](agents/api-testing-qc.agent.md) | Top-level orchestrator |

---

## Rules

| Rule | Discipline |
|---|---|
| [api-design](rules/api-design.md) | Spec-first; no source mutation; proposals to result/<slug>/01-review |
| [testing](rules/testing.md) | 10-folder canonical structure; per-status request rule; phase gating |
| [security](rules/security.md) | Auth schemes explicit; cover variations; no hardcoded secrets |
| [verification-depth](rules/verification-depth.md) | 7-dimension Postman quality + raw vs curated reconciliation |
| [reporting](rules/reporting.md) | Two-layer reporting (raw + curated); report families |
| [components](rules/components.md) | Each artifact one purpose; scenario IDs consistent |

---

## Skills

| Skill | Purpose |
|---|---|
| [api-analysis](skills/api-analysis/SKILL.md) | Operation summary, status coverage, auth scope |
| [collection-building](skills/collection-building/SKILL.md) | Postman collection authoring with per-status rule |
| [scenario-expansion](skills/scenario-expansion/SKILL.md) | Expand seed scenarios → API scenarios + assertions |
| [env-and-data](skills/env-and-data/SKILL.md) | Environment vars + status-case data samples |
| [performance-scaffold](skills/performance-scaffold/SKILL.md) | k6 + JMeter scaffolds |
| [verification](skills/verification/SKILL.md) | Raw vs curated reconciliation |

---

## Modules

- `modules/api-risk-analysis/` — map risks to API operations
- `modules/edge-case-generator/` — derive negative cases from OAS
- `modules/contract-validator/` — OAS conformance checking
- `modules/auth-analysis/` — auth scheme + scope analysis
- `modules/coverage-analysis/` — per-status × operation coverage matrix

---

## Outputs (api-qc-packages)

```
output/api-qc-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 01-review/
│   ├── openapi-quality/
│   ├── auth-and-limits/
│   ├── pagination-filtering/
│   ├── test-patterns/
│   └── oas-snapshot/
├── 02-strategy/test-strategy.md
├── 03-scenarios/
│   ├── e2e-journeys/
│   ├── integration-flows.md
│   └── regression-scenarios.md
├── 04-traceability/
│   ├── full-api-collection-traceability.md
│   ├── status-code-coverage-matrix.md
│   └── data-driven-samples-mapping.md
├── 05-postman/
│   ├── full-api-collection.json
│   ├── e2e-collection.json
│   ├── contract-collection.json
│   ├── integration-collection.json
│   ├── regression-collection.json
│   ├── performance-collection.json
│   └── postman-env.json
├── 06-env/
│   ├── .env.example
│   └── environment-variable-contract.md
├── 07-data/
│   ├── 200-samples.json ... 5xx-samples.json
├── 08-helpers/runbook.md
├── 09-performance/k6/, newman/, jmeter/
└── 10-reports/
    ├── raw/
    ├── performance/<run-slug>/
    ├── security-baseline/<run-slug>/
    ├── verification/<run-slug>/
    └── maintenance/<run-slug>/
```

This layout matches the `docs/api-testing-tool/` reference exactly. The artifact-engine produces it via the pipeline above.

---

## Why this is integrated rather than standalone

Without the engine:
- The pipeline ran on free-form prompts, with phase-gate discipline encoded *inside* prompts.
- Risks, scope, and DoD were re-discovered each time.

With the engine:
- Phase gating is enforced by the orchestrator.
- Scope/priorities/DoD come from the test-strategy artifact.
- Risk-coupling is verified mechanically.
- Recovery and resume are first-class.
- The output is the same — but reliable, repeatable, and chained from upstream.
