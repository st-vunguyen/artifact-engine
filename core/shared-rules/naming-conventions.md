# Naming Conventions — Shared

> **Applies to:** files, folders, ids, slugs, agents, MCPs, contracts, workflows.
> **Authority:** highest. Validators reject names that don't conform.

---

## 1. Slug Rules

A "slug" is the kebab-case identifier used in paths, ids, and frontmatter.

```
ALLOWED:    [a-z0-9-]
DISALLOWED: uppercase, spaces, underscores, dots inside slug
LENGTH:     3..64 chars
```

**Slugify algorithm** (deterministic):
1. Lowercase
2. Replace any non-`[a-z0-9]` run with a single `-`
3. Trim leading/trailing `-`
4. Collapse runs of `-` to a single `-`

Examples:
- `Checkout flow v2` → `checkout-flow-v2`
- `Foo_Bar/Baz` → `foo-bar-baz`
- `2026 Q1 spec.pdf` → `2026-q1-spec`

---

## 2. Run IDs

```
<system>-<feature>-<utc-compact>
```

- `<utc-compact>` = `YYYYMMDDTHHmmssZ`
- Example: `business-flow-checkout-20260430T093312Z`

The orchestrator generates run IDs; agents do not.

---

## 3. File and Folder Names

| Path | Rule |
|---|---|
| `input/` | preserve user-given file names (read-only) |
| `runtime/active-executions/<run-id>/` | run-id slug |
| `runtime/checkpoints/<run-id>/<phase-id>.checkpoint.json` | phase-id slug |
| `shared-artifacts/<kind>/<feature>.<system>.<ext>` | feature + system slug |
| `output/<system>-packages/<feature>/...` | feature slug; folder layout below |

### Standard package layout

```
output/<system>-packages/<feature>/
├── INDEX.md
├── MANIFEST.json
├── REPORT.md
├── 01-source/
├── 02-analysis/
├── 03-deliverables/
├── 04-traceability/
└── 05-verification/
```

Numbered prefixes (`01-`, `02-`) preserve display order in directory listings.

---

## 4. ID Conventions Inside Artifacts

| Kind | Pattern | Example |
|---|---|---|
| Flow step | `S<2-digit>` | `S01`, `S12` |
| State | slug | `pending`, `cancelled` |
| Decision | `D<2-digit>` | `D01` |
| Risk | `R<2-digit>` | `R03` |
| Scenario seed | `SS<2-digit>` | `SS07` |
| API scenario | `AS<3-digit>` | `AS001` |
| E2E scenario | `ES<3-digit>` | `ES001` |
| Journey | slug | `checkout-happy-path` |
| Gap | `G<2-digit>` | `G02` |
| Contradiction | `C<2-digit>` | `C01` |
| Permission row | `P<2-digit>` | `P05` |
| Async event | `AE<2-digit>` | `AE03` |
| Verification check | `V-<category>-<2-digit>` | `V-completeness-03` |
| Validator id | `<kind>-validator` | `artifact-validator` |

Counts > 99 → bump width (e.g., `S001`).

---

## 5. Contract IDs

```
<name>-contract@<major>.<minor>
```

Examples: `business-flow-contract@1.0`, `scenario-contract@1.2`.

Contracts referenced by consumers may use semver ranges:
- `business-flow-contract@^1.0` — any 1.x
- `business-flow-contract@~1.2` — 1.2.x
- `business-flow-contract@1.0` — exact

---

## 6. Tone and Content Rules

### R-N-01 — No emoji in published artifacts (output/)
Emoji are allowed in transient runtime files for quick scanning, but stripped on promotion. The single exception: status icons in REPORT.md (✅, ⚠, ❌) — these are part of the report rubric.

### R-N-02 — No marketing language
"Production-grade," "best-in-class," "robust," "blazing-fast" — banned in artifacts. State facts.

### R-N-03 — No second person in artifact bodies
"You should configure…" → "Configure…". Artifacts describe the system, not address a reader.

### R-N-04 — Times in UTC, ISO-8601, with `Z` suffix
`2026-04-30T09:33:12Z`. Never local times.

### R-N-05 — File paths use forward slashes
Even on Windows. Validators normalize, but generators write `/`.

---

## 7. Frontmatter

YAML frontmatter for `.md` files:

```yaml
---
contract: <id>
producer: <system-id>
producer_run_id: <run-id>
feature: <slug>
generated_at: <ISO-8601>
checksum: sha256:<hex>
...
---
```

JSON frontmatter is the top-level object's metadata fields (no separator); the keys are the same.

---

## 8. Headings

- ATX style only (`## Heading`).
- One H1 per document, matching the artifact's primary title.
- H2 sections defined by the contract are the only allowed top-level sections.
- H3+ are at the producer's discretion within an H2.

---

## 9. Forbidden Names

| Forbidden | Reason |
|---|---|
| `final-final.md` | use versioning, not naming hacks |
| `tmp.json`, `scratch.md` | use `runtime/` |
| `Copy of …` | use a new run-id |
| `untitled-*` | every artifact must declare what it is |
| Names with spaces | slug rule |
| Names mixing system identifiers (`bf-and-api-merged.json`) | per-artifact = per-system; use a separate aggregator artifact |

---

## 10. Versioned Files

When a producer regenerates an artifact:

```
shared-artifacts/<kind>/<feature>.<ext>          ← current
shared-artifacts/<kind>/<feature>.v3.<ext>       ← prior version (kept while consumers haven't re-run)
```

Retention is per `_index.json` (`keep_versions`).

---

## 11. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | filename slug, frontmatter shape |
| `consistency-validator` | id format inside artifacts |
| `naming-validator` (in artifact-validator) | full path + slug rules |

Failures are blockers.

---

## 12. Quick Examples

```
✅ shared-artifacts/business-flows/checkout.md
✅ runtime/active-executions/api-testing-checkout-20260430T093312Z/02-analysis/oas-snapshot.json
✅ output/business-flow-packages/checkout/MANIFEST.json
✅ R03 — Critical risk on payment retry
✅ business-flow-contract@1.0

❌ shared-artifacts/business-flows/Checkout Flow.md
❌ output/Final-business-flow-checkout.md
❌ R3 (no zero-pad)
❌ business_flow_contract_v1
```
