# edge-case-generator (module)

> Derive negative cases from OpenAPI schema constraints.

## API

```ts
generateNegatives(operation: Operation, schema: Schema): NegativeCase[]
```

## Negative-case patterns by schema constraint

| Constraint | Negative cases |
|---|---|
| `required` | Omit the field |
| `type: string` | Send number / object / null |
| `format: email` | Invalid emails (no @, no domain, spaces) |
| `format: uuid` | Non-UUID strings |
| `minLength` | String shorter than min |
| `maxLength` | String longer than max |
| `minimum` / `maximum` | Below / above bounds |
| `enum` | Value not in enum |
| `pattern` | String not matching regex |
| `additionalProperties: false` | Extra unknown fields |

## Output

```ts
type NegativeCase = {
  case_id: string
  operation: string
  status_target: 400      // typical
  request_body: object
  expected_error: string  // error code from OAS examples
  evidence: Evidence[]
}
```

## Hard rules

- One negative case per constraint violation (atomic)
- Each case maps to a documented 400/422 status

## Used by

- agent: `api-collection-builder` / `api-env-data-builder`
- skill: `collection-building`
