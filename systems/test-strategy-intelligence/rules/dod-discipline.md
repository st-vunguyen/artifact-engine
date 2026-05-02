# DoD Discipline (System Rule)

> Section 7 (Definition of Done) MUST be measurable, not aspirational.

## Required fields per DoD row

- `criterion` — what's being asserted (one sentence)
- `metric` — exactly what's measured
- `threshold` — pass condition (numeric or boolean)
- `measurement_plan` — how the engine computes the metric post-execution
- `source_artifact_kind` — which downstream artifact provides the value (e.g., `api-analysis-contract`, `e2e-contract`, `verification-contract`)

## Examples

✅ Good
- "All p0 endpoints have per-status coverage" / "% per-status coverage across p0 endpoints" / "≥ 95%" / "Read api-analysis-contract.coverage_matrix; filter by p0 scope" / `api-analysis-contract`

❌ Bad
- "All endpoints tested thoroughly" / "subjective" / "high quality" / "QA review" / `none`

## Forbidden patterns

| Pattern | Why |
|---|---|
| Subjective metric ("looks good", "feels right") | Not measurable |
| Threshold without unit | "≥ 95" without "%" is ambiguous |
| Measurement plan without source artifact | Cannot be computed |
| Threshold = 100% on a flaky metric | Sets up the run for failure-by-design |
| DoD that's actually a checklist of tasks | Tasks belong in the workflow, not the DoD |

## Canonical DoD catalog

Standard rows to seed the DoD:

1. p0 scope coverage = 100%
2. per-status API coverage on p0 endpoints ≥ 95%
3. p0 user journey pass rate = 100%
4. Every high+critical risk has ≥1 verified abuse-failure scenario
5. Regression set runtime ≤ N minutes (N from automation-thresholds + budget)
6. Security baseline (ZAP) findings of severity ≥ medium = 0
7. Performance: p95 latency on critical path within budget
8. Accessibility: 0 violations of WCAG 2.1 AA on p0 journeys

The dod-builder agent always emits at least these where applicable; additional rows come from `input/requirements/`.

## Why

A DoD that's "we tested everything" is unverifiable. A DoD that's "metric ≥ threshold from artifact X" is what the engine + a reviewer can both check.
