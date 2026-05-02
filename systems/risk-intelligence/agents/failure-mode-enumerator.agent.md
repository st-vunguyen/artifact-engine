---
agent_id: failure-mode-enumerator
system: risk-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/risks.enriched.json"
  - "shared-artifacts/system-graphs/{feature}.json"
declared_outputs:
  - "runtime/.../02-analysis/failure-modes.json"
declared_mcp: [risk-analysis-mcp]
---

# Failure Mode Enumerator (Agent)

> For each risk, enumerate concrete failure modes with user-visible effects.

## Output

```ts
type FailureMode = {
  risk_id: string
  mode: string                          // "Double-charge on retry"
  trigger: string                       // "Client retries after timeout"
  user_visible_effect: string           // "User sees two charges in payment history"
  data_visible_effect?: string          // "Two payment records, single order"
  detection_signal?: string             // "Payment.idempotency_key duplicates in metrics"
}
```

## Process

1. For each risk, look up its category in the failure-mode catalog (built into `risk-analysis-mcp.failure-modes`).
2. For each catalog entry, instantiate with the risk's specifics (component name, integration kind).
3. Surface modes whose `user_visible_effect` is empty as gaps (a risk without observable effect is hard to test).

## Hard rules

- `user_visible_effect` MUST be non-empty (or risk demoted to information-only).
- `mode` is a noun phrase, imperative-free.
- Catalog entries cite their source (where the failure-mode reasoning came from).

## Why this matters

Without explicit failure modes, risks read as abstract warnings. Concrete modes with observable effects are what api-testing/e2e abuse-failure scenarios need to assert against.
