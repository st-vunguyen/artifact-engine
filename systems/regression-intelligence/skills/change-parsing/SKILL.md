---
skill_id: change-parsing
system: regression-intelligence
version: 1.0
---

# Change Parsing Skill

> Parse change input into `Change[]`.

## Supported change input formats

| Format | Detection | Parser |
|---|---|---|
| PR diff | filename `.diff` or `.patch`, or `git diff` style | `regression-analysis-mcp.parse-diff` |
| Commit list | filename `.commits.md` with commit hashes | `regression-analysis-mcp.parse-commits` |
| Spec update | filename `.spec-update.md` describing OAS / BF changes | manual + `regression-analysis-mcp.diff-shared-artifacts` |
| Incident report | filename `.incident.md` with incident id + timeline | `regression-analysis-mcp.parse-incident` |
| Manual flag | filename `.manual-flag.md` listing components/operations | direct read |

## Steps

1. Detect format from filename / content.
2. Parse via the appropriate MCP tool.
3. For each change unit:
   - Resolve touched files → components via system-graph
   - Resolve touched API spec lines → operationIds
   - Resolve touched UI files → routes (when path discoverable)
   - Map to BF flow_step_ids (when changes touch business logic)
4. Compose `Change[]` per `regression-contract@1.0`.

## Hard rules

- Every change has a `source_ref` (PR #, commit sha, etc.)
- Every `artifacts_touched.*` resolves to a declared artifact
- Don't expand to "transitively affected" here — that's impact-analyzer's job

## Used by

- agent: `change-analyzer`
