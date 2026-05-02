# Strategy Discipline (System Rule)

## 7-section completeness

All 7 sections required (per `test-strategy-contract.md` §3). Empty sections must explicitly justify "Not applicable for this feature because <reason>" with cited evidence.

## Hard rules

1. `manual_pct + auto_pct + ai_pct = 100` for every Section 4 row.
2. Section 3 rows of priority p0/p1 → ≥1 risk_id (severity ≥ medium).
3. Section 4 rows for p0 scope → `auto_pct + ai_pct ≥ 60`.
4. Section 5 rows reference existing risks in `risks/<feature>.json`.
5. Section 5 rows for severity ≥ high → non-empty `test_artifacts.*` referencing scenario seeds.
6. Section 6 dependencies cite their owner explicitly (no anonymous ownership).
7. Section 7 DoD rows are measurable (metric + threshold + measurement plan).

## Cross-section coupling

| Source | Target | Constraint |
|---|---|---|
| Section 3 priority p0/p1 | Section 4 approach | An approach row exists for every p0/p1 scope |
| Section 5 risks | Section 4 test_types | risk-affected scopes include `abuse-failure` test_type |
| Section 7 DoD source_artifact_kind | Existing contract | Must be a registered contract |

## Forbidden patterns

| Pattern | Why |
|---|---|
| "TBD" in any cell | DoD must be measurable; scope must be explicit |
| Approach row with no scope linkage | Strategy without scope = noise |
| Manual 100% for p0 scope | Defeats automation thresholds |
| AI 100% for any scope | AI augments; doesn't replace humans entirely |
| Risk row without test mitigation | The point of the strategy is to map risks to tests |

## Why

The strategy is the bridge. Downstream systems consume it; if it has gaps, they propagate. Discipline at this stage saves effort across api-testing, e2e, regression.
