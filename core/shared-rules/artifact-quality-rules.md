# Artifact Quality Rules — Shared

> **Applies to:** every artifact produced by any system.
> **Authority:** highest. Domain rules MAY add more; they may not subtract from these.

These rules define the minimum bar an artifact must clear to be promoted to `shared-artifacts/` or `output/`.

---

## 1. The Quality Bar

An artifact is "publishable" when ALL of the following hold:

- ✅ Schema-valid against its declared contract
- ✅ Frontmatter complete and well-formed
- ✅ Every claim has evidence or is explicitly labeled gap/assumption
- ✅ No section that the contract requires is missing
- ✅ No silent contradiction with other artifacts produced in the same run
- ✅ Domain rubric (if any) passes
- ✅ Verification verdict ∈ {`pass`, `conditional-pass`}

If any item fails, the orchestrator refuses to promote.

---

## 2. Universal Rules

### R-Q-01 — Schema conformance is mandatory
Every artifact references a contract via `frontmatter.contract`. The artifact-validator runs automatically; failures are blocking.

### R-Q-02 — Self-consistency
A single artifact must not contradict itself. Examples:
- A flow row says actor "Customer"; the swimlane diagram lists "Buyer."
- The validation report says "17 sections present"; in fact section 11 is missing.
- A risk has severity `critical` but no mitigation.

### R-Q-03 — Cross-artifact consistency within a run
Artifacts produced together must agree:
- State machine state ids referenced in flow rows must exist in the state machine.
- Permission matrix actors must match flow table actors.
- Scenario seeds linking to risk_ids must reference declared risks.

### R-Q-04 — Naming conventions enforced
See `naming-conventions.md`. File names, slugs, ids all follow the same convention. Validators reject deviations.

### R-Q-05 — Frontmatter completeness
Required frontmatter keys per contract MUST all be present. Missing or empty values reject.

### R-Q-06 — Idempotent generation
Re-running a phase on identical input must produce a semantically equivalent artifact (same claims, same citations). Random ordering of equivalent items is allowed; new claims, dropped claims, or drifted citations are not.

### R-Q-07 — No fabricated specifics
Numbers, names, paths, status codes, identifiers must come from sources. The engine does not generate "example values" that look real but aren't cited. Use `<placeholder>` and a gap entry instead.

### R-Q-08 — Markdown discipline
- ATX headings (`##`) — never setext.
- Heading levels are deterministic per contract; do not nest "creatively."
- Tables have header rows; no merged cells; no line breaks inside cells.
- Code blocks have language fences (```` ```json ````).

### R-Q-09 — JSON discipline
- 2-space indent.
- No trailing commas.
- Sorted keys when the contract is an enum / map.
- ISO-8601 for timestamps; SHA-256 hex for checksums.

### R-Q-10 — Mermaid discipline (if the artifact emits diagrams)
- Diagrams compile cleanly (`mmdc --validate`).
- Node ids are slug-safe.
- No diagram has > 60 nodes (split if larger).
- Each node references a state/step/operation that exists in the structured artifact.

---

## 3. Per-Tier Additions

### Tier 1 — input artifacts
The engine never modifies these; quality is the user's responsibility. Validation surfaces broken inputs (e.g., malformed OpenAPI) but stops at "report and ask."

### Tier 2 — runtime/intermediate
Lower bar (these are working artifacts), but must still be schema-valid against any partial contract they reference.

### Tier 3 — shared-artifacts
Full bar. These cross system boundaries; defects propagate.

### Tier 4 — output
Full bar + package signing (MANIFEST.json + INDEX.md + REPORT.md).

---

## 4. Rubric Hooks

Domain rubrics extend universal rules without replacing them:

| System | Rubric file | Universal rules still apply? |
|---|---|---|
| business-flow-intelligence | `systems/business-flow-intelligence/rules/business-flow-artifacts.md` | yes |
| api-testing-intelligence | `systems/api-testing-intelligence/rules/testing.md` | yes |
| e2e-intelligence | `systems/e2e-intelligence/rules/...` | yes |

A rubric is implemented as a check in the verifier; the verifier reads the rubric file and turns each item into a check entry per `verification-contract.md`.

---

## 5. Anti-Patterns

| Pattern | Why bad |
|---|---|
| "TBD" / "TODO" left in published artifacts | Use a Gap entry, not a TBD. |
| "See discussion" pointing to chat / external | Inputs only; cite a file. |
| Generic descriptions ("user enters info") | Be specific or label as gap. |
| Silent number invention ("typical timeout: 30s") | Cite or gap. |
| Decorative emoji in deliverables | Banned by quality rule (see naming-conventions §6). |
| Markdown rendered as HTML in JSON fields | JSON is data, not display. |

---

## 6. Recovery Effects

Quality rule failures produce specific recovery behaviors:

| Failure | Default recovery |
|---|---|
| Schema-invalid artifact | Generation phase retried (max 2) |
| Missing required output | stop-and-report, no retry |
| Coverage < 0.85 | stop-and-report; agent must rewrite citing evidence |
| Cross-artifact inconsistency | rerun the late phase that produced the inconsistent artifact |
| Frontmatter malformed | Auto-fix attempt by orchestrator; if still bad, stop |

(Defined per workflow in `workflow-contract.md` §recovery_strategies.)

---

## 7. The Quality Audit Trail

Every artifact's promotion is logged with:
- Validators run + results
- Verifier run + verdict
- Recovery attempts (if any)
- Final checksum

Stored in `runtime/logs/<run-id>/quality-audit.jsonl`. The reporting-mcp surfaces a summary in REPORT.md.

---

## 8. Severity of Quality Rule Violations

```
universal rule failure   → blocker (verdict: fail)
domain rubric fail (req) → blocker
domain rubric fail (opt) → advisory finding
naming convention drift  → blocker
markdown formatting      → advisory (auto-format on publish)
```

Universal rules ARE NOT downgrade-able. Domain rules can mark items "required" or "optional" in their rubric.

---

## 9. The Underlying Principle

A high-quality artifact is **boring**: it conforms exactly to the contract, every claim is grounded, and it produces no surprises for the next reader (human or system). Creativity belongs in skill execution, not in artifact shape.
