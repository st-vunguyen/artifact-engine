# strategy-builder (module)

> Compose Section 4 (Testing Approach) per scope.

## API

```ts
buildApproach(scope: ScopeRow, graph: SystemGraph, risks: Risk[]): ApproachRow
chooseLevels(scope: ScopeRow, graph: SystemGraph): TestLevel[]
chooseTypes(scope: ScopeRow, risks: Risk[]): TestType[]
chooseAutomationMix(scope: ScopeRow, mode: ExecutionMode): { manual_pct, auto_pct, ai_pct }
chooseTool(levels: TestLevel[], types: TestType[]): string
```

## Tool catalog (registered)

| Tool | Levels |
|---|---|
| Newman + Postman | contract, integration, e2e (api) |
| Playwright | e2e, system, smoke, visual, a11y, regression |
| k6 | performance |
| JMeter | performance |
| OWASP ZAP | security baseline |
| @axe-core/playwright | accessibility |
| Vitest / Jest | unit |
| supertest / pact | contract |

## Hard rules

- `manual + auto + ai = 100`
- p0 → `auto + ai ≥ 60`
- ai ≤ 99 (always pair with humans)
- Tool must be in catalog (else justify)

## Used by

- agent: `strategy-builder`
- skill: `strategy-composition`
