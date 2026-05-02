---
skill_id: impact-computation
system: regression-intelligence
version: 1.0
---

# Impact Computation Skill

> Graph traversal for blast-radius from a Change set.

## Steps

For each Change:

1. Initialize impacted set with `direct` from `artifacts_touched.*`.
2. BFS over dependency-map:
   - Hop 1 → mark as `transitive-1`
   - Hops 2..5 → mark as `transitive-2plus`
3. For each data-store touched, look up readers/writers; mark as `data` impact.
4. For each API contract touched, look up declared consumers; mark as `contract` impact.
5. For each impacted target, compute `blast_radius_score` per `impact-discipline.md`.
6. Build reasoning chain ("Change X touched A → B depends on A → therefore impact").

## Output

`02-impact/impact-map.json` per `regression-contract@1.0`.

## Hard rules

- Cap `hops_max` at 5
- Per-change impacted set capped at 50 (else surface "scope too broad" finding)
- Score is computed (not manually set)
- Reasoning chain mandatory

## Used by

- agent: `impact-analyzer`
