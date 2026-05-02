# VALIDATION-GOVERNANCE.md — What the Engine Verifies

> Validation gates and verifiers are the engine's truth filter. This document explains what they check, when, and why.

---

## Two layers

1. **Validation** — does the artifact conform to its shape?
   - structural validators (artifact / consistency / traceability / completeness)
   - validation gates (completeness / consistency / traceability / quality-depth)
2. **Verification** — are the artifact's claims actually true given the evidence?
   - per-system verifier agents
   - 6-step verification ladder

Both layers are required. Surface-only acceptance is the most common AI-output failure mode in production.

---

## The 4 universal gates

| Gate | Question | File |
|---|---|---|
| `completeness-gate` | Are all required outputs present + populated? | [core/orchestrator/validation-gates/completeness-gate.md](core/orchestrator/validation-gates/completeness-gate.md) |
| `consistency-gate` | Do artifacts agree with each other (no silent contradictions)? | [core/orchestrator/validation-gates/consistency-gate.md](core/orchestrator/validation-gates/consistency-gate.md) |
| `traceability-gate` | Is every claim cited verbatim with locator? | [core/orchestrator/validation-gates/traceability-gate.md](core/orchestrator/validation-gates/traceability-gate.md) |
| `quality-depth-gate` | Does the artifact pass its domain rubric (depth, not surface)? | [core/orchestrator/validation-gates/quality-depth-gate.md](core/orchestrator/validation-gates/quality-depth-gate.md) |

---

## The 4 universal validators

Underlying the gates:

| Validator | Role | File |
|---|---|---|
| `artifact-validator` | Frontmatter + schema + naming conventions per contract | [core/validators/artifact-validator/](core/validators/artifact-validator/) |
| `consistency-validator` | Cross-artifact references resolve; coupling rules hold | [core/validators/consistency-validator/](core/validators/consistency-validator/) |
| `traceability-validator` | Verbatim excerpts; locator validity; coverage threshold | [core/validators/traceability-validator/](core/validators/traceability-validator/) |
| `completeness-validator` | Required outputs / sections / fields populated; no stub language | [core/validators/completeness-validator/](core/validators/completeness-validator/) |

---

## Coverage thresholds (default)

```
coverage = claims_with_evidence / (claims_total - unevidenced_with_reason)

pass             ≥ 0.95
conditional-pass 0.85 .. 0.95
fail             < 0.85
```

Workflows MAY raise (never lower).

---

## Domain rubrics (registered)

| Rubric | Owner system |
|---|---|
| `bf-17-section` | business-flow-intelligence (17 sections) |
| `bf-mermaid-icon-grounding` | business-flow-intelligence (icon manifest validation) |
| `system-graph-integrity` | system-intelligence |
| `risk-coupling` | risk-intelligence (risk ↔ seed coupling, severity matrix) |
| `test-strategy-7section` | test-strategy-intelligence (7 sections + DoD measurability) |
| `api-postman-7d` | api-testing-intelligence (Postman 7 dimensions) |
| `api-coverage-per-status` | api-testing-intelligence (per-status request rule) |
| `e2e-journey-graph` | e2e-intelligence (journey discipline) |
| `regression-rule-coverage` | regression-intelligence (selection rules applied) |

Registered in `core/mcp/rule-analysis-mcp/`.

---

## The 6-step verification ladder

Verifier agents climb this for every claim:

```
1. OBSERVATION    — what does the artifact say?
2. INFERENCE      — what does it imply / depend on?
3. SUPPORT CHECK  — does cited evidence support it?
4. CONTRADICTION  — does anything elsewhere disagree?
5. ROOT-CAUSE     — if support fails, why was it written?
6. RECOMMENDATION — what to fix, prioritized
```

Skipping = fail. Full discipline: [core/shared-rules/verification-depth.md](core/shared-rules/verification-depth.md).

---

## Verifier independence

The verifier is a separate agent from the generator. Read-only on artifacts. Cannot modify what it verifies. Cannot generate domain artifacts.

---

## Verdict computation (mechanical)

```
all required pass + coverage ≥ 0.95         → pass
all required pass + 0.85 ≤ coverage < 0.95  → conditional-pass
any required fail OR any blocker            → fail
```

Manual override forbidden.

---

## Required Output Files (RO-Files) gate

Universal:
1. After every phase, list every RO-File explicitly
2. Confirm existence + non-empty content
3. Block progression if any missing or empty
4. Report the gap: filename + step + expected content

Never claim a phase complete unless every RO-File is present and non-trivially populated.

---

## Forbidden

- Skipping gates "to ship faster"
- Manual verdict override
- Curated reports unsupported by raw evidence
- Suppressing findings to keep verdict pass
- Self-verification (generator verifying its own output)

---

## See also

- [core/shared-rules/verification-depth.md](core/shared-rules/verification-depth.md)
- [core/shared-rules/evidence-and-traceability.md](core/shared-rules/evidence-and-traceability.md)
- [core/shared-rules/artifact-quality-rules.md](core/shared-rules/artifact-quality-rules.md)
- [docs/playbooks/validation-playbook.md](docs/playbooks/validation-playbook.md)
