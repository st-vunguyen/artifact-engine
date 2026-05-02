---
skill_id: regression-selection
system: regression-intelligence
version: 1.0
---

# Regression Selection Skill

> Apply selection rules → build the regression set.

## Steps

1. Read impact map + scenario indexes (api-analysis, e2e-analysis, scenarios/.api.json, scenarios/.e2e.json).
2. For each rule in `selection-rules.md`:
   - Evaluate `when` predicate against impacts + changes
   - Resolve `select` to scenario_ids
   - Append to selection list with rule reference
3. Deduplicate by scenario_id (merge `selected_because[]`).
4. Apply budget discipline:
   - Estimate runtime per scenario (from upstream metadata or default)
   - If total > budget → trim per `budget-discipline.md`
5. Sort by priority then estimated_runtime ascending.
6. Write `03-selection/regression-set.json` + `.md`.

## Hard rules

- Every default rule applied (no skip)
- Multiple-rule selections preserve all reasons
- p0 not trimmed
- `incident-replay` always retained when applicable

## Used by

- agent: `regression-selector`
