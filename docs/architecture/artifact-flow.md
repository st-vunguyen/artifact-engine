# Artifact Flow (Architecture)

> Full reference: [architecture/artifact-flow.md](../../architecture/artifact-flow.md).

## Tiers

```
TIER 1 ─ INPUT artifacts          input/                  immutable
TIER 2 ─ INTERMEDIATE              runtime/                ephemeral
TIER 3 ─ SHARED                    shared-artifacts/       cross-system handoff
TIER 4 ─ OUTPUT                    output/                 finalized packages
```

## Lifecycle

```
input/spec.md
  ↓ spec-parser-mcp
runtime/.../01-input/normalized/
  ↓ analysis agent
runtime/.../02-analysis/<artifact>.md
  ↓ generation agent
runtime/.../03-generation/
  ↓ validators
runtime/.../<phase>/validators/
  ↓ verifier agent
runtime/.../05-verification/report.md
  ↓ orchestrator publish
shared-artifacts/<kind>/<feature>.md   ← public to consumers
output/<system>-packages/<feature>/    ← public to humans / external
```

## Frontmatter (universal)

Every artifact in shared-artifacts/ has frontmatter declaring contract, producer, run-id, feature, generated_at, checksum, evidence_coverage, gaps, contradictions.

## See also

- [INTEROPERABILITY-STANDARD.md](../../INTEROPERABILITY-STANDARD.md)
- [CONTRACTS.md](../../CONTRACTS.md)
