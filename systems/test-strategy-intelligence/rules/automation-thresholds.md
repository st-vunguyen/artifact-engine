# Automation Thresholds (System Rule)

> Per-priority and per-mode automation discipline.

## Per-priority defaults

| Priority | Min `auto_pct + ai_pct` | Notes |
|---|---|---|
| p0 | 60% | Critical scope; humans review but automation drives |
| p1 | 40% | Important scope; balanced approach |
| p2 | 20% | Best-effort automation |
| p3 | 0% | Manual or none |

For p0 / p1, `auto_pct` SHOULD be ≥ 30% (real test code, not just AI generation).

## Per-mode adjustments

| Mode | Adjustment |
|---|---|
| quick | Skip p2/p3 entirely; p0 may run smoke-only |
| deep | Defaults |
| enterprise | +10pp on automation across all priorities |
| regression | Run only impacted scopes; auto_pct must be ≥ 80% (regression is repetitive) |
| incident | Focus on incident-replay scenarios; auto_pct ≥ 80% |

## Per test-type adjustments

| Test type | Min auto_pct |
|---|---|
| smoke | 90% |
| regression | 90% |
| performance | 100% (manual perf testing is unreliable) |
| security | 60% (some manual penetration testing) |
| accessibility | 40% (some manual a11y review) |
| visual | 100% (snapshot-driven) |
| exploratory | ≤ 20% (intentionally manual) |

## Tool catalog (registered)

For consistency across systems, the strategy chooses tools from this catalog:

| Tool | Levels |
|---|---|
| Newman + Postman | contract, integration, e2e (api) |
| Playwright | e2e, system, smoke, visual, a11y, regression |
| k6 | performance |
| JMeter | performance |
| OWASP ZAP | security baseline |
| @axe-core/playwright | accessibility |
| Vitest / Jest | unit |
| supertest / pact | contract |

Choosing a tool outside this catalog → finding (justification required).

## Hard rules

- `manual_pct + auto_pct + ai_pct = 100` always (consistency-gate).
- `ai_pct < 100` always.
- `auto_pct + ai_pct ≥` per-priority threshold; otherwise the strategy fails quality-depth-gate.
