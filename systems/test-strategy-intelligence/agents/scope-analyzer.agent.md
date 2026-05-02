---
agent_id: scope-analyzer
system: test-strategy-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/system-graphs/{feature}.json"
  - "shared-artifacts/risks/{feature}.json"
declared_outputs:
  - "runtime/.../02-scope/scope.json"
  - "runtime/.../02-scope/general-purpose.md"
declared_mcp: [traceability-mcp]
---

# Scope Analyzer (Agent)

> Derive Section 1 (General Purpose) and Section 3 (Scope & Objective) rows.

## Output

```
02-scope/general-purpose.md           # narrative for §1
02-scope/scope.json                   # array of ScopeRow per §3 of test-strategy-contract
```

## Process

1. **General Purpose (§1)** — synthesize from business-flow §3 (Summary) + §1 (Scope).
2. **Scope rows (§3)** — for each major flow / state-machine cluster / system component:
   - Define `feature` (sub-feature label)
   - Define `test_objective` (what successful testing demonstrates)
   - Define `in_scope` and `out_of_scope` lists
   - Assign `priority` based on risk severity coupling and BF criticality
   - Assign `qc_owner` (role hint, e.g., "qa-team", "platform-qa")
   - Link to BF flow_step_ids, risk_ids, system components
3. Cite evidence on each row.

## Priority assignment

| Condition | Priority |
|---|---|
| Linked to a risk severity ≥ critical | p0 |
| Linked to a risk severity = high | p0 or p1 (depending on flow criticality) |
| On the happy path | p0 |
| On a major edge path | p1 |
| Off the critical path, low risk | p2 |
| Cosmetic / informational | p3 |

## Hard rules

- Every Scope row cites BF or system-graph evidence.
- Every Scope row of priority p0/p1 MUST have ≥1 risk_id (severity ≥ medium).
- in_scope and out_of_scope are explicit lists; "everything else" is not allowed.
