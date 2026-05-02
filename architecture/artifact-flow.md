# Artifact Flow

> How artifacts move through the engine — from raw input to verified output, and across system boundaries.

---

## 1. The Three Artifact Tiers

```
TIER 1 ─ INPUT artifacts          (sources of truth, immutable)
            ↓
TIER 2 ─ INTERMEDIATE artifacts   (analysis models, working artifacts; live in runtime/)
            ↓
TIER 3 ─ SHARED artifacts         (cross-system handoffs; live in shared-artifacts/)
            ↓
TIER 4 ─ OUTPUT artifacts         (finalized packages; live in output/)
```

Each tier has different rules, validators, and audiences.

---

## 2. Tier 1 — Input Artifacts

### Location

```
input/
├── specs/         ← functional specs, BRDs, PRDs (.md, .docx, .pdf, .xlsx)
├── api/           ← OpenAPI / Swagger / Postman collections
├── requirements/  ← acceptance criteria, business rules
└── ui-flows/      ← screen designs, journey docs, Figma exports
```

### Rules

- **Immutable.** The engine never writes to `input/`.
- **Source of truth** for evidence citations. Every claim downstream must trace back here.
- **Line-numbered.** During INPUT stage, the spec-parser-mcp produces a normalized, line-numbered corpus for citation.

### Engine treatment

```
input/specs/feature-x.md
   ↓ spec-parser-mcp
runtime/.../01-input/normalized/feature-x.md       (line-numbered corpus)
runtime/.../01-input/manifest.json                 (checksums, sources, encoding)
```

---

## 3. Tier 2 — Intermediate Artifacts (runtime)

### Location

```
runtime/
├── active-executions/<run-id>/
│   ├── 01-input/
│   ├── 02-analysis/
│   ├── 03-generation/
│   ├── 04-validation/
│   └── 05-verification/
├── checkpoints/<run-id>/
├── recovery/<run-id>/
└── logs/<run-id>/
```

### Rules

- **Owned by the orchestrator.** Only the orchestrator + agents writing under its control may write here.
- **Ephemeral but inspectable.** Cleaned up after final output is published, but kept long enough for debugging.
- **Idempotent.** Re-running a phase overwrites the phase folder cleanly; no append-mode chaos.

### Naming

```
runtime/active-executions/<system>-<feature-slug>-<utc-timestamp>/
```

Example: `runtime/active-executions/business-flow-checkout-20260430T093312Z/`

---

## 4. Tier 3 — Shared Artifacts (cross-system)

### Location

```
shared-artifacts/
├── business-flows/        ← business-flow.md per feature
├── state-machines/        ← state-machine.json + state-machine.mmd
├── risks/                 ← risk-register.json
├── scenarios/             ← scenario-seeds.json
├── verification/          ← verification reports
└── traceability/          ← traceability matrices
```

### Rules

- Each shared artifact MUST conform to a contract in `core/artifact-contracts/`.
- **Producer is named** in the artifact frontmatter (`producer: business-flow-intelligence`).
- **Consumers** read but do not modify. They produce *their own* downstream artifacts.
- **Versioned.** When a producer regenerates, prior versions are kept under `<artifact>/<feature>.v{N}.md` until consumers re-run.

### Frontmatter contract (every shared artifact)

```yaml
---
contract: business-flow-contract@1.0
producer: business-flow-intelligence
producer_run_id: business-flow-checkout-20260430T093312Z
feature: checkout
sources:
  - input/specs/checkout.md
  - input/requirements/checkout-acceptance.md
generated_at: 2026-04-30T09:55:42Z
checksum: sha256:...
evidence_coverage: 0.94      # 94% of claims have ≥1 cited source line
gaps: 3                       # explicit gap items inside the artifact
contradictions: 0
---
```

If frontmatter is missing or malformed, downstream consumers MUST refuse the artifact. The orchestrator's interoperability-rules enforce this.

---

## 5. Tier 4 — Output Artifacts (final)

### Location

```
output/
├── business-flow-packages/<feature>/
├── api-qc-packages/<feature>/
├── e2e-packages/<feature>/
└── final-reports/<run-id>/
```

### Rules

- **Signed.** Every package has `MANIFEST.json` with checksums + run metadata.
- **Self-contained.** A consumer reading only the package can reconstruct what was produced and why.
- **Indexed.** Each package has an `INDEX.md` linking to its key deliverables.
- **Reportable.** Each package has a `REPORT.md` summarizing: artifacts produced, gaps, contradictions, evidence coverage, validation/verification gate results.

### Standard package layout

```
output/<system>-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 01-source/
├── 02-analysis/
├── 03-deliverables/
├── 04-traceability/
└── 05-verification/
```

---

## 6. The Flow — Single System

```
input/specs/checkout.md
        │
        ▼
[ INPUT ]            spec-parser-mcp → runtime/.../01-input/normalized/
        │
        ▼
[ ANALYSIS ]         agents → runtime/.../02-analysis/business-flow.draft.md
        │
        ▼
[ GENERATION ]       agents → runtime/.../03-generation/{business-flow.md, state-machine.mmd, ...}
        │
        ▼
[ VALIDATION ]       validators → runtime/.../04-validation/report.json   ← GATE
        │
        ▼
[ VERIFICATION ]     verifier agent → runtime/.../05-verification/report.md ← GATE
        │
        ▼
[ FINAL OUTPUT ]     orchestrator promotes → output/business-flow-packages/checkout/
        │
        ▼
        also publishes → shared-artifacts/business-flows/checkout.md
```

---

## 7. The Flow — Cross-System

```
business-flow-intelligence
        │
        ▼  produces
shared-artifacts/business-flows/checkout.md
shared-artifacts/state-machines/checkout.json
shared-artifacts/risks/checkout.json
        │
        ├──────────────────────────────────────┐
        ▼                                      ▼
api-testing-intelligence            e2e-intelligence
        │                                      │
        │ also reads                           │ also reads
        ▼                                      ▼
input/api/openapi.yaml             input/ui-flows/checkout-screens.md
        │                                      │
        ▼                                      ▼
shared-artifacts/scenarios/        shared-artifacts/verification/
api-test-scenarios.json            e2e-journey-graph.json
        │                                      │
        ▼                                      ▼
output/api-qc-packages/checkout/   output/e2e-packages/checkout/
```

Key property: **api-testing and e2e never call business-flow's agents.** They only consume its published artifacts. If business-flow regenerates, downstream systems re-run against the new artifact version.

---

## 8. Artifact Identity

Every artifact is identified by:

```
{ contract_id, feature_slug, version, producer_run_id, checksum }
```

This identity is what makes:

- **Caching** possible — re-deriving the same artifact from the same input is a no-op.
- **Replay** possible — a checkpoint + the artifact identity reconstructs state.
- **Diff** possible — feature-x.v3 vs feature-x.v4 surfaces what changed.

---

## 9. Lifecycle Events

The orchestrator emits these events for every artifact (logged to `runtime/logs/`):

| Event | When | Recorded |
|---|---|---|
| `artifact.declared` | Phase declares it will produce X | contract id, expected location |
| `artifact.produced` | Agent writes the file | path, checksum, size |
| `artifact.validated` | Validator passes | validator id, result |
| `artifact.verified` | Verifier passes | verifier id, evidence coverage |
| `artifact.published` | Promoted to shared-artifacts/ or output/ | new path, version |
| `artifact.consumed` | Downstream system reads it | consumer system, run-id |
| `artifact.invalidated` | Producer regenerates → downstream artifacts marked stale | reason |

These events make the entire artifact graph queryable and auditable.

---

## 10. Bad Patterns to Catch

- ❌ An agent writes directly to `output/` (skip orchestrator promotion)
- ❌ A system writes to another system's `outputs/` folder
- ❌ A shared artifact has no frontmatter
- ❌ A claim cites a file but no line range
- ❌ Two contradictory artifacts coexist in `shared-artifacts/` without a contradictions registry entry
- ❌ A `runtime/` folder mutated after the run completed (not the orchestrator's writer)
- ❌ A package missing `MANIFEST.json` or `INDEX.md` or `REPORT.md`

The validation gates in `core/orchestrator/validation-gates/` exist precisely to catch these.
