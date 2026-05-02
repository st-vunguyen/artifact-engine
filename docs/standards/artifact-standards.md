# Artifact Standards

> Universal standards every artifact follows. Domain rules extend these; never contradict.

## Universal frontmatter

Every artifact in `shared-artifacts/` has YAML frontmatter (markdown) or top-level metadata (JSON):

```yaml
---
contract: <id>@<major>.<minor>
producer: <system-id>
producer_run_id: <run-id>
feature: <slug>
sources: [...]
generated_at: <ISO-8601 UTC>
checksum: sha256:<hex>
evidence_coverage: <0..1>
gaps: <int>
contradictions: <int>
---
```

## Naming

- File names: kebab-case slug; numbered prefixes for ordered folders (`01-source/`)
- IDs: `S01`, `R01`, `G01`, `C01`, `AS001`, `EJ01` (zero-padded)
- Run IDs: `<system>-<feature>-<utc-compact>` (e.g., `business-flow-checkout-20260430T093312Z`)
- Contract IDs: `<name>-contract@<major>.<minor>`

## Markdown discipline

- ATX headings (`##`) — never setext
- Tables for structured data
- Code fences with language (`` ```json ``)
- One H1 per document (matches title)

## JSON discipline

- 2-space indent
- No trailing commas
- Sorted keys for enum-like maps
- ISO-8601 UTC timestamps
- SHA-256 hex checksums

## Evidence shape (from `traceability-contract`)

```ts
type Evidence = {
  source: string                // path under input/ or shared-artifacts/
  line_range?: [number, number]
  cell_ref?: string             // for spreadsheets
  page?: number                 // for PDFs
  section_anchor?: string
  excerpt: string               // verbatim, ≤200 chars
  confidence: "high" | "medium" | "low"
}
```

## Forbidden

- "TBD" / "TODO" / "see chat" — use Gap entries
- Decorative emoji in deliverables (status icons in REPORT.md OK)
- Marketing language ("seamless", "robust", "blazing-fast")
- Second-person voice in artifact bodies
- Local times (UTC only)

## See also

- [core/shared-rules/artifact-quality-rules.md](../../core/shared-rules/artifact-quality-rules.md)
- [naming-conventions.md](naming-conventions.md)
