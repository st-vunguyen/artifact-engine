# rule-analysis-mcp

> **MCP server.** Rubric runner. Apply a rules-rubric to an artifact; return per-item pass/fail.

---

## Purpose

Generic rubric application engine. Each system declares rubrics (e.g., `bf-17-section`, `api-postman-7d`, `e2e-journey-graph`); this MCP runs them uniformly.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `evaluate-rubric(rubric_id, artifact_path)` | as named | `RubricResult` |
| `evaluate-rubric-item(item_id, artifact_path)` | as named | `{ pass: boolean, evidence: any, reason?: string }` |
| `lint-openapi(oas_path)` | `path` | `LintFinding[]` (re-exported from risk-analysis-mcp) |
| `lint-mermaid(mmd_path)` | `path` | `MermaidLintResult` |
| `lint-markdown(md_path, rules?)` | as named | `MarkdownLintResult` |
| `register-rubric(rubric_def)` | `RubricDefinition` | `{ id }` (in-process registration; not persisted) |

---

## Rubric structure

```ts
type Rubric = {
  rubric_id: string
  applies_to: string                       // contract id or artifact_kind
  required: RubricItem[]
  optional: RubricItem[]
  thresholds?: { required_pass_pct?: number, optional_pass_pct?: number }
}

type RubricItem = {
  item_id: string
  description: string
  check: { kind: "section-non-empty" | "field-equals" | "function-ref" | "regex" | "mcp", ... }
}
```

---

## Built-in check kinds

- `section-non-empty` — markdown section must have ≥ N chars of substantive content (excluding heading)
- `field-equals` — JSON path equals value
- `field-exists` — JSON path resolves
- `array-min-length` — array has ≥ N entries
- `array-each-has-keys` — every entry has required keys
- `regex` — text matches pattern
- `function-ref` — invoke a registered function (validators)
- `mcp` — call another MCP tool with bound args

Check failures return targeted evidence (which line / which path / which value didn't match).

---

## Built-in rubrics

Discovered from `systems/<system>/rules/` files referencing rubric_ids:

- `bf-17-section` — business-flow 17-section rubric
- `bf-mermaid-icon-grounding` — icon-token validation
- `api-postman-7d` — Postman 7-dimension quality
- `e2e-journey-graph` — Playwright journey discipline
- (more registered per system)

---

## Used by

- gate: `quality-depth-gate`
- agent: every verifier
- skill: `verification`
