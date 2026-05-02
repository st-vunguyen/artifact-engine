# Reporting (System Rule)

> Two-layer reporting (raw + curated) and report family discipline.

## Two-layer model

```
10-reports/
├── raw/                              ← machine outputs (Newman JSON, ZAP JSON, JMeter results)
│   ├── performance/
│   ├── security-baseline/
│   ├── verification/
│   └── maintenance/
├── performance/<run-slug>/           ← curated by family
├── security-baseline/<run-slug>/
├── verification/<run-slug>/
└── maintenance/<run-slug>/
```

**Rule:** never put loose run folders directly under `10-reports/`. Always nest under a report family.

## Run slug format

`<feature>-<YYYYMMDD>` (e.g., `checkout-20260430`).

For multiple runs same day: `<feature>-<YYYYMMDD>-<HHMM>`.

## Curated report contents (per family)

Every `<family>/<run-slug>/` folder contains:

- `00_index.md` — run metadata, scope, summary, links to other files
- `findings.md` — by category, sorted by severity
- `recommendations.md` — Do-now / Do-next / Later, prioritized
- `dashboard.html` — visual summary

## Dashboard rules (per `dashboard-html-guidelines.md` from reference)

- Single self-contained HTML file (inline CSS, inline data)
- Headline numbers MUST be derivable from the underlying raw report
- Drill-down sections link back to raw evidence
- No external CDNs (offline-friendly)

## Raw vs curated reconciliation (mandatory before publish)

For every claim in a curated report:
- Locate the raw artifact that backs it
- Confirm the value matches (within rounding)
- If a curated claim has no raw backing → flag as unsupported

The `api-report-verifier` agent enforces this. Curated reports without raw backing → blocker.

## Coverage state values in reports

When stating coverage in any curated report:
- `Covered` — request exists, executed, validated
- `Planned` — scaffold exists, not executed
- `Blocked` — cannot test, reason recorded
- `Out of scope with reason` — explicit decision
- `Unknown / needs confirmation` — insufficient evidence

Never "100% coverage" if any are Planned/Blocked/Unknown.

## Forbidden

- Curated report claims that exceed raw evidence
- Headlines that "look impressive" but aren't computed from raw
- Reports that describe what *should* be true rather than what was tested
- Mixing data from different runs in one curated report
- Missing run-slug

## Why

A "great-looking" curated report that doesn't match raw evidence is the primary failure mode of AI-generated test outputs. The two-layer model + reconciliation discipline makes this a structural concern, not a stylistic one.
