---
agent_id: impact-analyzer
system: regression-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../01-changes/changes.json"
  - "shared-artifacts/system-graphs/{feature}.json"
  - "shared-artifacts/dependency-maps/{feature}.json"
  - "shared-artifacts/risks/{feature}.json"
declared_outputs:
  - "runtime/.../02-impact/impact-map.json"
  - "runtime/.../02-impact/blast-radius.json"
declared_skills: [impact-computation]
declared_mcp: [dependency-analysis-mcp]
---

# Impact Analyzer (Phase 3)

> Compute direct + transitive + data + contract impact for each change.

## Output

```ts
type ImpactRow = {
  change_id: string
  impact_target: string
  impact_kind: "direct" | "transitive-1" | "transitive-2plus" | "data" | "contract"
  reasoning: string
  blast_radius_score: number           // 0..1
  evidence: Evidence[]
}
```

## Process

For each Change:
1. **Direct impact** — components / operations / flow steps explicitly in `artifacts_touched`.
2. **Transitive-1** — 1-hop neighbors via dependency-map.
3. **Transitive-2plus** — 2..N hops (capped at N=3 default; 5 max).
4. **Data impact** — when a schema or data store changes, mark all readers/writers.
5. **Contract impact** — when an API contract changes, mark all consumers.

For each Impact:
- Compute `blast_radius_score`: weighted by hops, criticality (from dep-map), risk severity.
- Cite reasoning chain: "Change CH01 touched svc-orders → svc-payment depends on svc-orders (criticality: high) → therefore impact."

## Hard rules

- Caps: `hops_max ≤ 5` to prevent unbounded sets.
- Score is monotonic: direct > transitive-1 > transitive-2plus.
- Reasoning explicit: cite the dependency chain.
- Risk-severity weighting: impacts on components linked to high-severity risks score higher.
