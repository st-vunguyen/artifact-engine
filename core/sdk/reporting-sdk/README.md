# reporting-sdk

> **Module:** `core/sdk/reporting-sdk`
> **Purpose:** ergonomic wrapper around `reporting-mcp` for systems and agents to emit reports without re-implementing layout / dashboard logic.

---

## Surface

```ts
namespace reportingSdk {
  function buildPackage(spec: PackageSpec): PublishedPackage
  function buildReport(scope: ReportScope, layout: ReportLayout): ReportFiles
  function buildDashboard(metrics: Metrics, raw_paths: Path[]): HtmlDashboard
  function summarizeRecovery(events: LifecycleEvent[]): RecoveryTimeline
  function summarizeCoverage(matrix: TraceMatrix): CoverageSection
  function summarizeRisks(risks: Risk[], blast_radius: BlastRadiusEntry[]): RiskSection
  function composeExecutiveSummary(packages: PackagePath[]): ExecutiveSummary
}
```

---

## Standard layouts

The SDK knows the standard package layouts:

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

For api-qc-package: 10-folder layout with report-family nesting.

---

## Reports built

- `INDEX.md` — table of contents
- `REPORT.md` — executive summary + sections (per layout)
- `MANIFEST.json` — file list + checksums + run metadata
- `dashboard.html` — when applicable (api-qc, e2e, performance, security-baseline)

---

## Used by

- orchestrator publish phase
- every verifier agent
- skill: `reporting`

---

## Boundaries

The reporting-sdk does NOT:
- Decide what's in a report (verifier produces verification-contract; SDK formats it)
- Modify artifacts
- Promote (orchestrator does)
- Execute tests / scans / runs
