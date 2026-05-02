---
agent_id: mitigation-generator
system: risk-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/risks.enriched.json"
  - "runtime/.../02-analysis/failure-modes.json"
declared_outputs:
  - "runtime/.../03-generation/risks.final.json"
declared_mcp: [risk-analysis-mcp]
---

# Mitigation Generator (Agent)

> Propose mitigations for each risk, classified preventive / detective / corrective.

## Output (per risk, attached to the risk object)

```ts
type Mitigation = {
  kind: "preventive" | "detective" | "corrective"
  description: string
  owner_hint?: "engineering" | "product" | "ops" | "security" | "support"
  status: "proposed"                    // (downstream may update to exists / in-flight)
  evidence?: Evidence[]                 // when proposing based on existing patterns
}
```

## Process

1. For each risk severity ≥ medium, enumerate at least one mitigation per kind.
2. For severity ≥ high, ≥1 mitigation MUST be `preventive` (not just detective).
3. For categories with standard mitigations (e.g., concurrency → idempotency keys; async-failure → retry/dead-letter), use catalog lookup.
4. Every mitigation has an `owner_hint`.

## Hard rules

- Risks of severity ≥ high MUST have ≥1 mitigation (per `risk-contract.md` §5).
- Don't propose mitigations the engine cannot verify exist (e.g., "use a CDN" without checking whether one is used).
- Status starts as `proposed`; the verifier may not change it.

## Output

`risks.final.json` — superset of enriched + mitigations + (linked) failure-modes.

This is the artifact that gets published as `shared-artifacts/risks/<feature>.json` (overwriting BF's preliminary).
