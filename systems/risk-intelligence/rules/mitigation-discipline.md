# Mitigation Discipline (System Rule)

## Mitigation kinds

| Kind | Definition |
|---|---|
| **preventive** | Stops the failure from happening (e.g., idempotency keys, transaction boundaries) |
| **detective** | Detects the failure when it happens (e.g., anomaly metrics, integrity checks) |
| **corrective** | Recovers from the failure (e.g., compensating transactions, retry) |

## Required combinations

| Risk severity | Required mitigations |
|---|---|
| info, low | optional |
| medium | ≥1 mitigation, any kind |
| high | ≥1 preventive + ≥1 detective |
| critical | ≥1 preventive + ≥1 detective + ≥1 corrective |

## Status values

- `proposed` — engine-suggested; not yet evaluated
- `exists-in-code` — confirmed in source code
- `exists-in-process` — covered by ops procedure
- `in-flight` — being implemented

The risk-intelligence agent only produces `proposed`. Other statuses require external annotation (e.g., a code analysis or ops review). The verifier never auto-promotes status.

## Owner hints

`engineering | product | ops | security | support`

Used by reporting-mcp to route the risk in the executive summary.

## Anti-patterns

- Mitigation without `description` → reject
- Mitigation that's actually a workaround for a bug (not a designed control) → label as `corrective` and surface as a finding
- Mitigation citing "best practice" without specific action → not a mitigation
- Multiple mitigations that all do the same thing → deduplicate

## Why

Mitigations make risks actionable. A risk register without mitigations is a worry list. With them, downstream test-strategy can plan abuse-failure tests that *verify the mitigation works*.
