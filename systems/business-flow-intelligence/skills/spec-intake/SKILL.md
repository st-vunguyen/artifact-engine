---
skill_id: spec-intake
system: business-flow-intelligence
version: 1.0
---

# Spec Intake Skill

> Multi-format source normalization. Reads any file under `input/` and produces line-numbered Markdown for citation.

---

## Steps

1. **Discover sources** — list files matching declared input globs.
2. **Classify by format** — `.md`, `.docx`, `.pdf`, `.xlsx`, `.csv`, `.json`, ...
3. **Convert** — call `spec-parser-mcp.parse(<path>, <format>)`. Receives Markdown body.
4. **Normalize** — strip BOM; collapse `\r\n` → `\n`; strip trailing whitespace per line.
5. **Number lines** — prepend `L<N>:` is NOT used (preserves text); the line position itself is the locator.
6. **Persist** — write to `runtime/.../01-input/normalized/<original-basename>.md`.
7. **Manifest** — append entry to `manifest.json` with original path, normalized path, checksum, lines.
8. **Report unsupported** — for formats the parser cannot handle, mark in manifest with `kind: "unsupported"` and emit a gap.

---

## Inputs

- declared input directories under the agent's bound inputs

## Outputs

- `runtime/.../01-input/normalized/*.md`
- `runtime/.../01-input/manifest.json`

## Hard rules

- Verbatim preservation. No paraphrasing during normalization.
- Stable line numbering across reruns.
- One source file → one normalized file.
- Read-only on `input/`.

## See also

- `core/mcp/spec-parser-mcp/` — the format converter the skill calls
- agent: `spec-analyzer`
