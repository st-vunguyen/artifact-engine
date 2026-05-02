# Validation Architecture

> Layered validation + verification. Full reference: [VALIDATION-GOVERNANCE.md](../../VALIDATION-GOVERNANCE.md).

## Two layers

| Layer | Question | Components |
|---|---|---|
| Validation | Does the artifact conform to its shape? | 4 validators + 4 gates |
| Verification | Are the artifact's claims true given evidence? | Per-system verifier agent + verification-mcp |

## The 4 universal gates

| Gate | Validators it uses |
|---|---|
| `completeness-gate` | completeness-validator + artifact-validator |
| `consistency-gate` | consistency-validator |
| `traceability-gate` | traceability-validator |
| `quality-depth-gate` | rule-analysis-mcp (rubrics) |

## Verdict (mechanical)

```
all required pass + coverage ≥ 0.95         → pass
all required pass + 0.85 ≤ coverage < 0.95  → conditional-pass
any required fail OR any blocker            → fail
```

## Verifier independence

Verifier is a separate agent from the generator. Read-only on artifacts. Cannot modify what it verifies.

## Cross-system consistency

When a workflow consumes a shared-artifact, the consistency-gate checks ids referenced by the consumer still resolve in the upstream artifact's current version.

## See also

- [VALIDATION-GOVERNANCE.md](../../VALIDATION-GOVERNANCE.md)
- [core/shared-rules/verification-depth.md](../../core/shared-rules/verification-depth.md)
- [docs/playbooks/validation-playbook.md](../playbooks/validation-playbook.md)
