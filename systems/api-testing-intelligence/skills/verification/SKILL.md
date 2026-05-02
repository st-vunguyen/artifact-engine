---
skill_id: verification
system: api-testing-intelligence
version: 1.0
---

# Verification Skill (api-testing)

> Reconcile raw vs curated; produce api-analysis + verification report.

## Steps

1. **Scan structure** — list every file under runtime/.../<phase>; cross-reference Required Output Files.
2. **Per-status coverage** — read `04-traceability/status-code-coverage-matrix.md` + `05-postman/full-api-collection.json`; build actual `operationId × status → coverage` map.
3. **Compute coverage %** — across documented statuses; classify per state value.
4. **Raw vs curated reconciliation** — for each report family, confirm every claim has raw backing.
5. **Build api-analysis.json** — per `api-analysis-contract@1.0`.
6. **Compute verdict** — pass / conditional-pass / fail per `verification-contract@1.0`.
7. **Write reports** — `10-reports/verification/<run-slug>/00_index.md`, `findings.md`, `recommendations.md`, `dashboard.html`; orchestrator-bound `05-verification/report.md` + `report.json`.

## Hard rules

- Read-only on artifacts
- Curated claims must be backed by raw evidence
- Verdict is mechanical
- Per-status rule is non-negotiable
- Findings classified

## Used by

- agent: `api-report-verifier`
