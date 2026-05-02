---
agent_id: risk-prioritizer
system: test-strategy-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/risks/{feature}.json"
  - "shared-artifacts/scenarios/{feature}.seed.json"
  - "runtime/.../03-approach/approach.json"
declared_outputs:
  - "runtime/.../04-risk-map/risk-mitigation.json"
declared_mcp: [risk-analysis-mcp, traceability-mcp]
---

# Risk Prioritizer (Agent)

> Build Section 5 (Risk & Mitigation) of the test strategy: per risk, declare test mitigation + linked scenarios.

## Output

```ts
type RiskMitigationRow = {
  risk_id: string                  // matches risks/<feature>.json
  description: string
  impact: ImpactLevel
  likelihood: LikelihoodLevel
  test_mitigation: string          // what testing reduces this risk
  test_artifacts:
    api_scenarios?: string[]       // seed_ids → api-testing will expand to api scenario_ids
    e2e_scenarios?: string[]       // seed_ids → e2e will expand to journey ids
    regression_scenarios?: string[]
  owner: string
}
```

## Process

1. For each risk in `risks/<feature>.json`:
   - Pull seed scenarios linked via `links_to.risk_ids`.
   - Categorize seeds: which suit api-testing? which suit e2e? which require regression flagging?
   - Compose `test_mitigation` describing the testing strategy.
2. For risks of severity ≥ high without linked seeds → emit a finding (BF coupling broke; or seeds don't exist yet).
3. Cite each row's evidence.

## Hard rules

- Every Section 5 row references an existing risk.
- Severity ≥ high risks MUST have non-empty `test_artifacts.*`.
- `test_mitigation` is one or two sentences; specific.
- Don't invent scenario IDs that aren't seeds yet (downstream systems will create them).
