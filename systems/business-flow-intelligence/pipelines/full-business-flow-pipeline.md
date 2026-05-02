# Pipeline: full-business-flow-pipeline

> **Workflow ID:** `business-flow-full-pipeline@1.0`
> **Definition:** [full-business-flow-pipeline.workflow.yaml](full-business-flow-pipeline.workflow.yaml)
> **Default for:** business-flow-intelligence

---

## Purpose

End-to-end pipeline that reads spec material from `input/specs/`, `input/requirements/`, `input/business-documents/` and produces the full business-flow package — analysis, mermaid, traceability, verification.

---

## When to use

- A new feature spec arrives.
- An existing feature spec changes materially.
- Verification of an existing flow needs to be re-anchored against new sources.

---

## Phase summary

| Phase | What it does | Required outputs |
|---|---|---|
| 01-input | Normalize sources to line-numbered Markdown | normalized/*.md, manifest.json |
| 02-analysis | 17-section analysis | business-flow-document.md, permissions.json, risk.json, scenario-seeds.md, state-machine.preliminary.json |
| 03-generation | Mermaid pack | business-flow-mermaid.md, flowchart.mmd, swimlane.mmd, state-diagram.mmd, state-machine.json |
| 04-validation | Validators run | (no new files; validator outputs in `validators/`) |
| 05-verification | Verifier agent | report.md, report.json |
| 06-publish | Promote to shared-artifacts/ + output/ | (orchestrator-managed) |

---

## Inputs

```
input/specs/<feature>/...                  required
input/requirements/<feature>/...           optional
input/business-documents/<feature>/...     optional
```

---

## Outputs (after publish)

```
shared-artifacts/business-flows/<feature>.md
shared-artifacts/state-machines/<feature>.json
shared-artifacts/state-machines/<feature>.mmd
shared-artifacts/risks/<feature>.json
shared-artifacts/scenarios/<feature>.seed.json
shared-artifacts/traceability/<feature>.business-flow.matrix.json
shared-artifacts/verification/<feature>.business-flow.report.json
output/business-flow-packages/<feature>/
  ├── INDEX.md
  ├── MANIFEST.json
  ├── REPORT.md
  ├── 01-source/
  ├── 02-analysis/
  ├── 03-mermaid/
  ├── 04-traceability/
  └── 05-verification/
```

---

## Recovery profile

- agent_error: retry up to 2 times
- agent_timeout: retry once
- validation_failed: stop-and-report (do not retry; agent must rewrite)
- gate_failed: stop-and-report
- mcp_unavailable: retry with backoff (3 attempts, 10/20/40s)
- low coverage on retry: retry-with-altered-prompt: stricter-evidence

---

## Time profile

| Phase | Typical | Hard cap |
|---|---|---|
| 01-input | 30–120s | 300s |
| 02-analysis | 8–25 min | 30 min |
| 03-generation | 2–6 min | 10 min |
| 04-validation | < 60s | 5 min |
| 05-verification | 3–10 min | 15 min |
| 06-publish | < 10s | 60s |

Total typical: 15–45 minutes. Hard cap: 2 hours.

---

## Downstream

This pipeline's outputs feed:

- **system-intelligence** — uses §4, §13 to build system-graph
- **risk-intelligence** — enriches risks with blast-radius
- **test-strategy-intelligence** — uses §3, §4, §10, §14, §15 to build strategy
- **api-testing-intelligence** — uses §11, §15 for scenario seeds
- **e2e-intelligence** — uses §4, §11, §15 for journeys
- **regression-intelligence** — uses §4, §11 for impact analysis

---

## Variants

For partial work, see also:
- [analyze-spec-to-business-flow](analyze-spec-to-business-flow.md) — phase 2 only
- [mermaid-generation](mermaid-generation.md) — phase 3 only
- [business-flow-verification](business-flow-verification.md) — phase 5 only on existing artifacts
