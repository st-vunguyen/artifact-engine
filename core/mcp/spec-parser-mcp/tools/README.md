# spec-parser-mcp / tools/

Tool implementations exposed by this MCP server.

## Files

| File | Tool |
|---|---|
| `parse.ts` | `parse(path, format?)` — generic dispatch |
| `parse-openapi.ts` | `parse-openapi(path)` — OpenAPI typed AST |
| `parse-postman.ts` | `parse-postman(path)` — Postman v2.1 typed |
| `parse-docx.ts` | `.docx` / `.doc` via mammoth |
| `parse-pdf.ts` | `.pdf` via pdf-parse |
| `parse-xlsx.ts` | `.xlsx`/`.xls`/`.csv`/`.tsv` via xlsx |
| `parse-json.ts` | `.json` annotated MD |
| `parse-yaml.ts` | `.yaml`/`.yml` annotated MD |
| `manifest.ts` | `manifest(directory)` — produces normalized-source manifest |
| `line-number.ts` | `line-number(markdown)` — adds positional lines |
| `detect-format.ts` | `detect-format(path)` — extension + content sniff |

Each tool has a corresponding schema in `../schemas/` and a validator in `../validators/`.
