# Reporting Standards

> Two-layer reporting + report family discipline.

## Two-layer model

```
10-reports/raw/                              ← machine outputs (Newman JSON, ZAP JSON, JMeter results)
10-reports/<family>/<run-slug>/              ← curated by family
```

## Report families (api-testing-intelligence)

- `performance/` — k6, Newman soak, JMeter
- `security-baseline/` — ZAP results
- `verification/` — final verification + recommendations
- `maintenance/` — post-spec-change refresh

## Per-family folder contents

```
<family>/<run-slug>/
├── 00_index.md
├── findings.md
├── recommendations.md
└── dashboard.html
```

## Run slug format

`<feature>-<YYYYMMDD>` (e.g., `checkout-20260430`).
For multiple runs same day: `<feature>-<YYYYMMDD>-<HHMM>`.

## Dashboard rules

- Single self-contained HTML (inline CSS, inline data)
- Headlines computed from raw, not free-form
- No external CDN (offline-friendly)
- Drill-down links to raw evidence

## Hard rules

- Curated content backed by raw evidence
- No "looks impressive" headlines that can't be derived from raw
- Mixing data from different runs in one curated report = forbidden
- Loose run folders directly under `10-reports/` = forbidden (must nest under family)

## See also

- [core/mcp/reporting-mcp/](../../core/mcp/reporting-mcp/README.md)
- [core/sdk/reporting-sdk/](../../core/sdk/reporting-sdk/README.md)
- [systems/api-testing-intelligence/rules/reporting.md](../../systems/api-testing-intelligence/rules/reporting.md)
