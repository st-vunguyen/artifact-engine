# contract-validator (module)

> Verify request/response schemas conform to OpenAPI contract.

## API

```ts
validateRequest(request: HttpRequest, operation: Operation): ContractResult
validateResponse(response: HttpResponse, operation: Operation, status: number): ContractResult
buildContractCoveragePlan(operations: Operation[]): ContractCoveragePlan
```

## Output

```ts
type ContractResult = {
  valid: boolean
  violations: SchemaViolation[]
}

type SchemaViolation = {
  path: string                          // JSON pointer
  expected: string                      // expected type/format/value
  actual: string
  severity: "minor" | "major" | "critical"
}
```

## Used by

- agent: `api-scenario-builder` (contract pack)
- agent: `api-report-verifier` (cross-checking responses)
