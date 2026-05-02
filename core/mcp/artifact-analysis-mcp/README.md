# artifact-analysis-mcp

> **MCP server.** Generic artifact introspection — frontmatter, contracts, evidence coverage, structural analysis.

---

## Purpose

When an agent / verifier / SDK needs to ask "what's this artifact?", "does it conform?", "what does it cite?", this MCP answers.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `inspect(path)` | `path: string` | `{ contract, producer, frontmatter, sections, claims_count, evidence_count }` |
| `validate-frontmatter(path, contract_id)` | as named | `{ valid: boolean, missing_keys: string[], invalid_values: string[] }` |
| `count-claims(path)` | `path` | `number` |
| `extract-sections(path)` | `path` | `Section[]` (heading + position + length) |
| `compute-evidence-coverage(path, matrix_path?)` | as named | `number` (0..1) |
| `list-cited-sources(path)` | `path` | `Source[]` (paths + line counts) |
| `diff-versions(prev_path, current_path)` | as named | `Diff` (semantic; ignores formatting) |
| `validate-contract(path, contract_id)` | as named | full validation per contract schema |

---

## Use cases

### "Is this artifact contract-valid?"
```
inspect(path) → contract → validate-contract(path, contract) → result
```

### "How much of this artifact is cited?"
```
compute-evidence-coverage(path, matrix_path) → 0.94
```

### "What sources does this artifact cite?"
```
list-cited-sources(path) → [
  { path: "input/specs/checkout.md", lines_cited: 87 },
  { path: "input/requirements/checkout.md", lines_cited: 23 }
]
```

### "What changed from previous version?"
```
diff-versions("checkout.v3.md", "checkout.md") → semantic diff
```

---

## Hard rules

- Read-only on artifacts
- Diff is semantic (ignores whitespace, ordering of equivalent items)
- All values returned are derived (no side-effects)

---

## Used by

- orchestrator (publish phase: validate before promote)
- every verifier agent
- sdk: `artifact-sdk` (inspect helpers)
- gate: `consistency-gate`, `completeness-gate`
