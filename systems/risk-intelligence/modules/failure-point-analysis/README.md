# failure-point-analysis (module)

> Catalog of common failure modes per risk category.

## Catalog (excerpt)

| Risk category | Common failure modes |
|---|---|
| concurrency | Lost update; double-charge on retry; phantom read; deadlock |
| data-integrity | Partial write; orphaned record; broken referential integrity |
| async-failure | Stuck queue; retry storm; dead-letter not drained; out-of-order delivery |
| external-dependency | Timeout cascade; rate-limit lockout; vendor outage spread |
| performance | Slow query; n+1; head-of-line blocking; memory leak |
| security | Token leak; auth bypass; tenant cross-read; CSRF |
| ux-confusion | Silent failure; ambiguous error; back-button data loss |
| compliance | Cross-tenant data leak; PII over-retention; missing audit log |

## API

```ts
getFailureModesForRisk(risk: Risk): FailureMode[]
instantiateForContext(catalogEntry: CatalogEntry, risk: Risk, graph: SystemGraph): FailureMode
ensureUserVisibleEffect(mode: FailureMode): boolean
```

## Output

```ts
type FailureMode = {
  risk_id: string
  mode: string                          // "Double-charge on retry"
  trigger: string
  user_visible_effect: string           // mandatory; non-empty
  data_visible_effect?: string
  detection_signal?: string
}
```

## Hard rules

- `user_visible_effect` mandatory non-empty
- Each catalog entry cites its source (precedent / prior incident / industry pattern)

## Used by

- agent: `failure-mode-enumerator`
