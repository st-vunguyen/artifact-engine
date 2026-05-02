# Evidence Grounding (System Rule)

> Domain rule. Source precedence and grounding for system-graph claims.

## Source precedence

When sources disagree:

1. **LLD** (lowest-level design) — most authoritative for component naming, integrations, dependencies.
2. **HLD** (high-level design) — authoritative for boundaries, externals, overall topology.
3. **API specs** — authoritative for declared operations and their hosts.
4. **Business-flow** — authoritative for actor↔component mapping at the business level.
5. **Inferred** (no source) — last resort; must be labeled and surfaced as low-confidence.

A claim sourced only from inferred reasoning is a finding, not an error — but it counts against the evidence_coverage threshold.

## Specific grounding requirements

| Entity | Required evidence kind |
|---|---|
| Component | LLD or HLD or api-spec server |
| Integration | LLD prose or HLD sequence/integration diagram |
| External | HLD or api-spec server URL |
| Boundary | HLD or explicit security/network section |
| DataFlow | LLD prose or HLD sequence diagram |

## Forbidden inferences

- Inventing a Component because the BF mentions an actor (must match a declared component or be a gap).
- Inferring an Integration solely from "common patterns" (e.g., assuming Stripe webhook because the system uses Stripe).
- Renaming Components silently (preserve the naming used in the source unless explicitly normalized via a declared mapping).

## When sources are silent

- HLD missing: build from API specs + business-flow; mark graph as **low-fidelity** in the verification report.
- LLD missing: components stay coarse-grained; emit gap recommending LLD review.
- API specs missing for an integration: emit gap; the integration's operationality is uncertain.

The `low-fidelity` label downgrades the verification verdict to `conditional-pass` (advisory) at most.
