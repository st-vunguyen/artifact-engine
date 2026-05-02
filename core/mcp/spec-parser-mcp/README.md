# spec-parser-mcp

> **MCP server.** Multi-format parser. Reads any source under `input/` and produces normalized, line-numbered Markdown for citation.

---

## Purpose

Convert raw spec material in any supported format into a clean, citable corpus. Every other system depends on this for `01-input/normalized/`.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `parse(path, format?)` | `path: string`, `format?: enum` | `{ markdown, lines, encoding, conversion_notes }` |
| `parse-openapi(path)` | `path: string` | `OasSnapshot` (typed AST) |
| `parse-postman(path)` | `path: string` | `PostmanCollection` (typed) |
| `manifest(directory)` | `directory: string` | `Manifest` (every file with checksum + kind) |
| `line-number(markdown)` | `markdown: string` | `markdown` with positionable lines |
| `detect-format(path)` | `path: string` | `format` |

## Supported formats

| Extension | Parser |
|---|---|
| `.md`, `.markdown`, `.txt` | passthrough + line numbering |
| `.docx`, `.doc` | mammoth → markdown |
| `.pdf` | pdf-parse text extraction (warns on scanned/image PDFs) |
| `.xlsx`, `.xls`, `.csv`, `.tsv` | tabular → markdown table |
| `.json` | structured → annotated markdown |
| `.yaml`, `.yml` | structured → annotated markdown; OpenAPI detection |

Unsupported → manifest entry `kind: "unsupported"` + Gap.

---

## Hard rules

1. **Verbatim preservation.** No paraphrase / summarization during normalization.
2. **Stable line numbering.** Same input → same line numbers across runs.
3. **Read-only on `input/`.** Never mutate sources.
4. **UTF-8 output.** All conversions normalized to UTF-8.

---

## Layout

```
core/mcp/spec-parser-mcp/
├── README.md
├── tools/                # tool implementations (one file per tool)
├── schemas/              # input/output JSON schemas per tool
├── validators/           # input validators (file exists, format detected, etc.)
└── outputs/              # example outputs for testing
```

---

## Used by

- agent: `spec-analyzer` (in BF, system, e2e, regression intake)
- skill: `spec-intake`
- skill: `api-analysis` (uses parse-openapi)
