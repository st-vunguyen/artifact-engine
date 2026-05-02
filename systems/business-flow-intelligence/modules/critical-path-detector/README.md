# critical-path-detector (module)

> Identify high-impact paths through the flow.

## Purpose

Help downstream systems prioritize. A "critical path" is a sequence of flow steps that:
- Touches money / data integrity / auth
- Has the highest aggregate risk severity along the way
- Is the happy path for the primary use case

## API

```ts
detectCriticalPaths(rows: FlowRow[], risks: Risk[]): CriticalPath[]
scorePath(path: FlowRow[], risks: Risk[]): number
```

## Output

```ts
type CriticalPath = {
  path_id: string                    // "CP01"
  description: string
  steps: string[]                    // S01, S02, ... in order
  why_critical: string
  aggregate_risk_score: number       // 0..1
  evidence: Evidence[]
}
```

## Heuristics

- Paths starting at entry → ending at terminal-success states
- Paths visiting flow rows with high-severity risks
- Money / payment / auth keyword density
- State-machine paths from initial → terminal-success

## Used by

- skill: `analysis-extraction` (informs Section 14 risk hotspots + Section 13 critical paths)
- consumer: `test-strategy-intelligence` (priority assignment)
