# coverage-analysis (module)

> Build per-status × operation coverage matrix.

## API

```ts
buildCoverageMatrix(operations: Operation[], collection: PostmanCollection): CoverageMatrix
computeCoveragePct(matrix: CoverageMatrix): number
classifyCoverageState(row: CoverageRow): "Covered" | "Planned" | "Blocked" | "Out of scope" | "Unknown"
```

## Output

```ts
type CoverageRow = {
  operationId: string
  status: number
  documented: boolean
  has_scenario: boolean
  scenario_id?: string
  has_data_sample: boolean
  has_test_assertion: boolean
  status_kind: "happy" | "validation" | "auth" | "permission" | "conflict" | "rate-limit" | "server"
  state: "Covered" | "Planned" | "Blocked" | "Out of scope" | "Unknown"
}
```

## Hard rules

- Every documented status appears as a row
- State per `coverage state values` rule (only 5 allowed)
- Per-status request rule enforced (scenario per status)
- "Full coverage" claim only valid if every row is `Covered`

## Used by

- agent: `api-report-verifier`
- skill: `verification`
