# auth-analysis (module)

> Auth scheme + scope analysis from OAS.

## API

```ts
analyzeSchemes(oas: OpenAPI): AuthScheme[]
extractScopes(oas: OpenAPI): ScopeRow[]
buildVariationsCoverage(operations: Operation[], schemes: AuthScheme[]): AuthVariation[]
```

## Output

```ts
type AuthAnalysis = {
  schemes: AuthScheme[]
  scope_matrix: ScopeRow[]
  variations_covered: AuthVariation[]
}

type AuthVariation = {
  variation: "missing" | "malformed" | "expired" | "wrong-role" | "wrong-scope"
  covered: boolean
  scenario_ids: string[]
}
```

## Hard rules

- Every protected operation has all 5 variations covered (or explicit "out of scope")
- Scopes from `components.securitySchemes.oauth2.flows.*.scopes`
- Variations cite OAS evidence

## Used by

- agent: `api-spec-reviewer`
- skill: `api-analysis`
