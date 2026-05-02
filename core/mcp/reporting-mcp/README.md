# reporting-mcp

> **MCP server.** Two-layer report builder (raw + curated). Renders REPORT.md, dashboards, executive summaries.

---

## Purpose

Every run produces a REPORT.md. Every package has dashboards. The reporting-mcp is the canonical builder — input: raw evidence + verification report; output: curated, evidence-backed report files.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `build-report(scope, layout)` | `{ scope: ReportScope, layout: ReportLayout }` | `{ index_md, report_md, dashboard_html, files: Path[] }` |
| `build-dashboard(metrics, raw_paths)` | `{ metrics, raw_paths }` | `dashboard.html` (self-contained) |
| `summarize-recovery(events)` | `events: LifecycleEvent[]` | `RecoveryTimeline` |
| `summarize-coverage(trace_matrix)` | `Matrix` | `CoverageSection` |
| `summarize-risks(risks, blast_radius)` | `risks, blast_radius` | `RiskSection` |
| `compose-executive-summary(packages)` | `packages: PackagePath[]` | `ExecutiveSummary` |
| `reconcile(raw, curated)` | `{ raw, curated }` | `{ supported: [], unsupported: [], advisories: [] }` |

---

## Report layouts

| Layout | For |
|---|---|
| `business-flow-package` | output/business-flow-packages/<feature>/ |
| `system-analysis-package` | output/system-analysis-packages/<feature>/ |
| `risk-analysis-package` | output/risk-analysis-packages/<feature>/ |
| `test-strategy-package` | output/test-strategy-packages/<feature>/ |
| `api-qc-package` | output/api-qc-packages/<feature>/ — 10-folder layout |
| `e2e-package` | output/e2e-packages/<feature>/ — Playwright pack |
| `regression-package` | output/regression-packages/<feature>/<run-id>/ |
| `executive-summary` | output/executive-summaries/<run-id>/ — cross-system roll-up |

Each layout knows the standard files (INDEX.md, MANIFEST.json, REPORT.md) and report-family folders (when applicable).

---

## Dashboard rules

- Single self-contained HTML (inline CSS, inline data)
- Headlines computed from raw, not free-form
- No external CDN (offline-friendly)
- Drill-down links to raw evidence

---

## Hard rules

- Curated content backed by raw evidence (reconcile output)
- Dashboards never invent numbers
- Run slug format: `<feature>-<YYYYMMDD>` (or with `-HHMM` suffix)
- Report-family folders nested under `10-reports/<family>/<run-slug>/` (api pack rule)

---

## Used by

- orchestrator (publish phase)
- every verifier agent
- skill: `reporting` (in api-testing, e2e)
