# Impact Discipline (System Rule)

> What counts as impact, with explicit reasoning.

## Impact kinds

| Kind | Definition |
|---|---|
| `direct` | The change explicitly touched this target (`artifacts_touched.*`) |
| `transitive-1` | 1 hop away in the dependency graph |
| `transitive-2plus` | 2..N hops away (capped at 5) |
| `data` | Schema or data store changed; this target reads/writes affected data |
| `contract` | API contract changed; this target consumes that contract |

## Reasoning chain (mandatory)

For every impact row, document the chain:

> "Change CH01 touched svc-orders → svc-payment depends on svc-orders (criticality: high) → therefore impact = transitive-1."

Without a chain, the impact is ungrounded → fail.

## Scoring

```
score = base * hop_decay * criticality_weight * risk_weight

base                = 1.0 for direct, 0.7 for transitive-1, 0.4 for transitive-2plus, 0.6 for data, 0.6 for contract
hop_decay           = 1 / (1 + hops)
criticality_weight  = { low: 0.8, medium: 1.0, high: 1.2, critical: 1.5 }   from dep-map
risk_weight         = if any high+ risk on this target: 1.3 else 1.0
```

Clamped to [0, 1]. Used for ordering / trimming.

## Caps

- `hops_max ≤ 5` — beyond this, impact considered noise
- Per-change impacted-targets ≤ 50 — beyond this, the change scope is too broad; surface a finding suggesting scope splitting

## Forbidden

- Impacts without a reasoning chain
- Score manually set
- Including impacts with score < 0.1 (noise)
- Skipping the dep-map (using "intuition")
