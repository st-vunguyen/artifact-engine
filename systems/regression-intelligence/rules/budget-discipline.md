# Budget Discipline (System Rule)

> When the selected set exceeds the runtime budget, what to trim.

## Budget source

Budget comes from upstream test-strategy's Definition of Done (e.g., "Regression set runtime ≤ 30 minutes").
If absent, default = 60 minutes.

## Trimming order (when over budget)

1. Drop p2 selections (lowest priority).
2. If still over, drop p1 selections **except** `always-run-smoke`.
3. Never drop p0.
4. Never drop `incident-replay` selections.

## Surface trim decisions

Every trim decision is recorded explicitly:

```json
{
  "trimmed": [
    { "selection_id": "RS17", "reason": "p2 dropped to fit 30-min budget" },
    { "selection_id": "RS24", "reason": "p1 dropped except smoke" }
  ],
  "kept": 28,
  "estimated_runtime_seconds": 1740
}
```

Trim summary appears in REPORT.md.

## When p0 alone exceeds budget

Stop-and-report. The budget is broken; the user needs to:
- Increase the budget, or
- Reduce p0 scope upstream (in test-strategy)

The regression-intelligence does NOT silently drop p0.

## Why

Regression-as-completionist ("run everything") is a budget-breaker. Regression-as-pruning ("skip what looks ok") is a quality-breaker. The discipline above keeps both honest.
