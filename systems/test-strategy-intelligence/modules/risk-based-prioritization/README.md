# risk-based-prioritization (module)

> Map risks → test priorities + scenario coverage requirements.

## API

```ts
prioritizeByRisk(scopes: ScopeRow[], risks: Risk[]): ScopeRow[]
buildRiskMitigationRows(risks: Risk[], seeds: ScenarioSeed[]): RiskMitigationRow[]
```

## Mapping

| Risk severity | Min priority on linked scope | Required test types |
|---|---|---|
| critical | p0 | abuse-failure + happy + edge |
| high | p0 or p1 | abuse-failure + happy |
| medium | p1 or p2 | happy + edge |
| low | p2 or p3 | happy (smoke) |
| info | p3 | none required |

## Output

- Updated `ScopeRow[]` with priority adjusted upward (never downward) based on risks
- `RiskMitigationRow[]` for Section 5 of test strategy

## Used by

- agent: `risk-prioritizer`
