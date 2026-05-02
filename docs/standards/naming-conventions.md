# Naming Conventions

> Pointer to the canonical rule. The actual standard lives in [core/shared-rules/naming-conventions.md](../../core/shared-rules/naming-conventions.md).

## Quick reference

| Kind | Convention |
|---|---|
| File / folder slug | `[a-z0-9-]+`, kebab-case, 3..64 chars |
| Run ID | `<system>-<feature>-<utc-compact>` |
| Flow step ID | `S01`, `S02` (zero-padded) |
| Risk ID | `R01` |
| Gap ID | `G01` |
| Contradiction ID | `C01` |
| API scenario ID | `AS001` (3-digit) |
| E2E scenario ID | `ES001` |
| Journey ID | `journey-<feature>-<purpose>` |
| Contract ID | `<name>-contract@<major>.<minor>` |
| Run slug (reports) | `<feature>-<YYYYMMDD>` |

## Forbidden

- Spaces, underscores, dots inside slug
- "final-final.md" / "Copy of …"
- Names mixing system identifiers
- Untitled / scratch files in non-runtime locations

## See also

- [core/shared-rules/naming-conventions.md](../../core/shared-rules/naming-conventions.md)
