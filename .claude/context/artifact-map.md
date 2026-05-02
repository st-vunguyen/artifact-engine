# Artifact Map

> Every cross-boundary artifact, where it lives, who produces it, who consumes it.

---

## Tier 1 — Inputs (immutable)

```
input/
├── specs/<feature>/                    business-flow primary
├── requirements/<feature>/             additional context
├── hld/<feature>/                      system-intelligence
├── lld/<feature>/                      system-intelligence
├── api-specs/<feature>/openapi.yaml    api-testing primary
├── ui-specs/<feature>/                 e2e
├── ui-flows/<feature>/                 e2e
├── business-documents/<feature>/       business-flow extra
└── raw-imports/changes.<id>.md         regression
```

## Tier 2 — Runtime (ephemeral)

```
runtime/
├── active-executions/<run-id>/
│   ├── 01-input/, 02-analysis/, 03-generation/, 04-validation/, 05-verification/
│   ├── workflow.frozen.json
│   ├── run.meta.json
│   ├── run.state.json
│   └── run.blockers.json
├── checkpoints/<run-id>/<phase-id>.checkpoint.json + .signed
├── logs/<run-id>/{events.jsonl, <phase-id>.log}
└── recovery/, snapshots/, execution-cache/, ...
```

## Tier 3 — Shared artifacts (cross-system handoff)

```
shared-artifacts/
├── business-flows/<feature>.md                            (BF)
├── state-machines/<feature>.json + .mmd                   (BF)
├── risks/<feature>.json (preliminary→enriched)            (BF→risk)
├── risks/<feature>.blast-radius.json + .map.mmd           (risk)
├── system-graphs/<feature>.json + .md + .diagram.mmd      (system)
├── dependency-maps/<feature>.json                          (system)
├── test-strategies/<feature>.md + .json                    (test-strategy)
├── test-strategies/<feature>.system-overview.mmd          (test-strategy)
├── scenarios/<feature>.seed.json                           (BF)
├── scenarios/<feature>.api.json                            (api-testing)
├── scenarios/<feature>.e2e.json                            (e2e)
├── api-analysis/<feature>.json + .md                       (api-testing)
├── api-analysis/<feature>.coverage-matrix.json             (api-testing)
├── api-analysis/<feature>.oas-snapshot.json                (api-testing)
├── api-analysis/<feature>.review-findings.json             (api-testing)
├── e2e-analysis/<feature>.json + .md                       (e2e)
├── e2e-analysis/<feature>.journey-graph.mmd                (e2e)
├── e2e-analysis/<feature>.poms.json                        (e2e)
├── regression-analysis/<feature>.json + .md                (regression)
├── regression-analysis/<feature>.diff.json                 (regression)
├── traceability/<feature>.<system>.matrix.json             (every system)
├── verification/<feature>.<system>.report.json + .md       (every verifier)
└── reports/                                                (reporting-mcp executive views)
```

Each `<kind>/` folder has `_index.json` declaring producer + consumers + contract.

## Tier 4 — Output (finalized packages)

```
output/
├── business-flow-packages/<feature>/{INDEX, MANIFEST, REPORT, 01-source, 02-analysis, 03-mermaid, 04-traceability, 05-verification}
├── system-analysis-packages/<feature>/
├── risk-analysis-packages/<feature>/
├── test-strategy-packages/<feature>/
├── api-qc-packages/<feature>/{01-review .. 10-reports}
├── e2e-packages/<feature>/{tests/e2e, playwright.config.ts}
├── regression-packages/<feature>/<run-id>/
├── verification-reports/                executive verification roll-up
└── executive-summaries/<run-id>/        cross-system roll-up
```

## Frontmatter (universal)

```yaml
---
contract: <id>@<major>.<minor>
producer: <system-id>
producer_run_id: <run-id>
feature: <slug>
sources: [...]
generated_at: <ISO-8601 UTC>
checksum: sha256:<hex>
evidence_coverage: <0..1>
gaps: <int>
contradictions: <int>
---
```

## Contract index

See [CONTRACTS.md](../../CONTRACTS.md).

## See also

- [architecture-map.md](architecture-map.md)
- [systems-map.md](systems-map.md)
- [INTEROPERABILITY-STANDARD.md](../../INTEROPERABILITY-STANDARD.md)
