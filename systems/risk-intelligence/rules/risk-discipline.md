# Risk Discipline (System Rule)

> Domain rule. How risks are identified, scored, and coupled.

## Required risk fields (per `risk-contract@1.0`)

- `risk_id`, `title`, `category`, `description`
- `affected.*` — at least ONE specific target (component, integration, flow_step, etc.)
- `failure_modes` — ≥1 with `user_visible_effect`
- `likelihood`, `impact` — both populated
- `severity` — computed mechanically; manual override forbidden
- `mitigations` — ≥1 for severity ≥ high
- `evidence` — ≥1 cited source

## Severity computation (canonical matrix)

| ↓ likelihood / → impact | negligible | minor | moderate | major | catastrophic |
|---|---|---|---|---|---|
| almost-certain | low | medium | high | critical | critical |
| likely | low | medium | high | high | critical |
| possible | low | medium | medium | high | critical |
| unlikely | info | low | medium | high | high |
| rare | info | low | low | medium | high |

Computed by `risk-analysis-mcp.compute-severity`. Setting severity manually = consistency-gate failure.

## Coupling rules

1. Every risk severity ≥ high MUST be linked from ≥1 abuse-failure scenario seed via `links_to.risk_ids`.
2. Every risk MUST have `affected.*` non-empty.
3. Every failure mode MUST have non-empty `user_visible_effect`.

## Forbidden patterns

| Pattern | Why |
|---|---|
| Risk with no `affected` target | Can't compute blast-radius; can't test |
| Risk with severity manually set to higher than matrix | Inflates priority artificially |
| Risk without failure_mode | Abstract; not testable |
| Risk in category "other" without explanation | Use of "other" requires reason |
| Duplicate risk (same affected + same description) | Deduplicate; keep one with merged evidence |

## Categories (canonical)

`data-integrity | permission | auth | input-validation | concurrency | async-failure | performance | security | ux-confusion | compliance | operability | external-dependency`

If the risk doesn't fit, use `other` and explain in `description`.
