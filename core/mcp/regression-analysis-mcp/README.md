# regression-analysis-mcp

> **MCP server.** Change parsing, impact computation, regression selection-rule engine.

---

## Purpose

Regression-intelligence uses this MCP for: parsing PR diffs / commit lists / incident reports, computing impact via dep-map, applying selection rules with budget discipline.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `parse-diff(path, graph)` | `{ path, graph }` | `Change[]` (touched files → components) |
| `parse-commits(path, graph)` | as named | `Change[]` |
| `parse-incident(path, graph, riskRegister)` | as named | `Change[]` (with risk_id linkage) |
| `diff-shared-artifacts(prev, current)` | `{ prev, current }` | `Change[]` (when shared-artifacts regenerate) |
| `compute-impact(changes, graph, depMap, risks, hops_max?)` | as named | `ImpactRow[]` |
| `apply-rules(rules, impacts, scenarios)` | as named | `Selection[]` |
| `apply-budget(selections, budgetSeconds)` | as named | `{ kept, trimmed }` |
| `risk-delta(change, riskRegister, depMap)` | as named | `RiskDelta[]` |

---

## Default rule catalog

Loaded from `systems/regression-intelligence/rules/selection-rules.md`:

- `direct-api-impact` (p0)
- `transitive-api-impact` (p1)
- `e2e-impact` (p0)
- `high-risk-affected` (p0)
- `incident-replay` (p0; not downgradable)
- `always-run-smoke` (p1)

Custom rules supported per workflow but defaults always evaluated.

---

## Trim policy (when over budget)

1. Drop p2
2. Drop p1 (except `always-run-smoke`)
3. Never drop p0
4. Never drop `incident-replay`

If even p0 exceeds budget → return `over-budget-on-p0` blocker.

---

## Hard rules

- Every change has a `source_ref`
- Impact rows have reasoning chain
- Selection rules deterministic (same input → same output)
- Budget honored mechanically

---

## Used by

- agent: `change-analyzer`, `impact-analyzer`, `regression-selector`
- skill: `change-parsing`, `impact-computation`, `regression-selection`
