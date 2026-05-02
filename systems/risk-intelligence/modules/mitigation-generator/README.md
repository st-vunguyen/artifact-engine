# mitigation-generator (module)

> Propose preventive / detective / corrective mitigations per risk.

## Catalog (excerpt)

| Risk category | Preventive | Detective | Corrective |
|---|---|---|---|
| concurrency | idempotency keys; transactional boundaries | duplicate detection | compensating transaction |
| data-integrity | FK constraints; transactions | integrity checks | reconciliation job |
| async-failure | retry with backoff; dead-letter queue | DLQ depth alert | replay tooling |
| external-dependency | circuit breaker; bulkhead | dependency health probe | graceful degradation |
| performance | caching; index review | latency SLO + alert | autoscale |
| security | auth required; scope check; tenant filter | anomaly detection | revoke + rotate |

## API

```ts
generateMitigations(risk: Risk): Mitigation[]
```

## Output

```ts
type Mitigation = {
  kind: "preventive" | "detective" | "corrective"
  description: string
  owner_hint?: "engineering" | "product" | "ops" | "security" | "support"
  status: "proposed"
  evidence?: Evidence[]
}
```

## Required combinations (per `mitigation-discipline.md`)

- severity ≥ medium → ≥1 mitigation
- severity ≥ high → ≥1 preventive + ≥1 detective
- severity = critical → ≥1 preventive + ≥1 detective + ≥1 corrective

## Used by

- agent: `mitigation-generator`
