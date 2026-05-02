---
agent_id: change-analyzer
system: regression-intelligence
version: 1.0
declared_inputs:
  - "input/raw-imports/changes.{run_id}.md"
  - "shared-artifacts/system-graphs/{feature}.json"
  - "shared-artifacts/business-flows/{feature}.md"
declared_outputs:
  - "runtime/.../01-changes/changes.json"
  - "runtime/.../01-changes/changes.md"
declared_skills: [change-parsing]
declared_mcp: [traceability-mcp]
---

# Change Analyzer (Phase 2)

> Parse change input into structured `Change[]` per `regression-contract@1.0`.

## Output

```ts
type Change = {
  change_id: string                        // "CH01"
  source: "pr" | "commit" | "spec-update" | "incident" | "manual-flag"
  source_ref: string
  description: string
  artifacts_touched:
    components?: string[]
    api_operations?: string[]
    business_flow_steps?: string[]
    ui_routes?: string[]
  evidence: Evidence[]
}
```

## Process

1. Read change input (PR diff / commit list / incident report).
2. For each change unit:
   - Extract source kind (pr/commit/spec-update/incident/manual-flag)
   - Extract source_ref (PR #, commit sha, incident id, etc.)
   - Map touched files → components (via system-graph)
   - Map API spec changes → operationIds
   - Map UI changes → routes (when discoverable from path)
   - Map BF or test-strategy diffs → flow_step_ids / scope_ids
3. Cite evidence per change.

## Hard rules

- Every change references its source_ref
- Every `artifacts_touched.*` resolves to a declared artifact
- No silent expansion ("these are all impacted") — only direct touch in this phase
