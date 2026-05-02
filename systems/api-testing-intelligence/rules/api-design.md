# API Design (System Rule)

> Spec-first, evidence-first discipline.

## Source-of-truth (non-negotiable)

- `input/api-specs/{feature}/openapi.yaml` is **immutable**.
- Findings → `result/<slug>/01-review/`.
- Proposed corrections → `result/<slug>/01-review/proposals/<topic>.md` as a copy, never an edit to the source.
- If a normalized spec is needed → `result/<slug>/01-review/openapi-quality/normalized-openapi.yaml` (copy, not replacement).

## Evidence labeling (mandatory)

Every claim is one of:
- **Observed** — directly stated in source (with line range)
- **Inferred** — logically follows from explicit statements (cite premises)
- **Assumption** — required to unblock; document risk-if-wrong
- **Needs validation** — agent suspects but cannot confirm
- **Open question** — explicit unknown for stakeholder

## Forbidden

- Fabricating undocumented endpoints, statuses, schema fields, workflows, permission rules
- Silently rewriting the spec to "fix" issues
- Making claims without citing OAS line ranges
- Using emoji in artifacts (per shared naming-conventions)
- Marketing language ("seamless", "robust")

## Output allocation (strict)

- Read from: `input/api-specs/{feature}/`
- Write only to: `runtime/.../01-review/` through `10-reports/`
- Promotion to `output/api-qc-packages/{feature}/` happens during the publish phase by the orchestrator

## Why

Spec drift is the #1 source of test rework. Treating the spec as immutable, with all changes routed through proposals, makes the audit trail clean and prevents silent semantic drift.
