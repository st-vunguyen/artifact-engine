# Risk Contract

> **Contract ID:** `risk-contract@1.0`
> **Producer:** `business-flow-intelligence` (primary), other systems may augment
> **Consumers:** `api-testing-intelligence`, `e2e-intelligence`, `reporting-mcp`

A risk register captures structured risks identified during analysis: where the danger is, why, what could go wrong, and how mitigations and abuse-failure scenarios trace back to it.

---

## 1. Artifact Location

```
shared-artifacts/risks/<feature>.json
```

---

## 2. Frontmatter

```json
{
  "contract": "risk-contract@1.0",
  "producer": "business-flow-intelligence",
  "producer_run_id": "<run-id>",
  "feature": "<feature-slug>",
  "generated_at": "<ISO-8601>",
  "checksum": "sha256:<hex>",
  "risks": [ /* ... */ ]
}
```

---

## 3. Risk Schema

```ts
type Risk = {
  risk_id: string                             // "R01"
  title: string
  category: RiskCategory
  description: string
  affected:
    flow_step_ids?: string[]                  // → business-flow flow rows
    states?: string[]                         // → state-machine states
    permissions?: string[]                    // → permissions matrix entries (composite key)
    endpoints?: string[]                      // → OAS operationIds
    journeys?: string[]                       // → e2e journey ids
  failure_modes: FailureMode[]
  likelihood: "rare" | "unlikely" | "possible" | "likely" | "almost-certain"
  impact: "negligible" | "minor" | "moderate" | "major" | "catastrophic"
  severity: "info" | "low" | "medium" | "high" | "critical"
                                              // computed from likelihood × impact (matrix below)
  mitigations: Mitigation[]
  evidence: Evidence[]                        // why this risk is real
  open_questions?: string[]
}

type FailureMode = {
  mode: string                                // "Double-charge on retry", "Stale cache reads after update", ...
  trigger: string
  user_visible_effect: string
  data_visible_effect?: string
}

type Mitigation = {
  kind: "preventive" | "detective" | "corrective"
  description: string
  owner_hint?: "engineering" | "product" | "ops" | "security" | "support"
  status: "proposed" | "exists-in-code" | "exists-in-process" | "in-flight"
  evidence?: Evidence[]
}

type RiskCategory =
  | "data-integrity" | "permission" | "auth" | "input-validation"
  | "concurrency" | "async-failure" | "performance" | "security"
  | "ux-confusion" | "compliance" | "operability" | "external-dependency"
```

---

## 4. Severity Matrix (canonical)

The engine computes `severity` from `likelihood × impact` using this matrix:

| ↓ likelihood / → impact | negligible | minor | moderate | major | catastrophic |
|---|---|---|---|---|---|
| almost-certain | low | medium | high | critical | critical |
| likely | low | medium | high | high | critical |
| possible | low | medium | medium | high | critical |
| unlikely | info | low | medium | high | high |
| rare | info | low | low | medium | high |

Producers MUST populate `likelihood` and `impact`; the engine derives `severity`. Manually overriding `severity` is forbidden.

---

## 5. Hard Rules

1. Every risk MUST have ≥1 `evidence` entry.
2. Every risk with severity ≥ `high` MUST have ≥1 `mitigation`.
3. Every risk with severity ≥ `high` MUST be linked to ≥1 abuse-failure scenario seed (the **risk↔seed coupling** enforced across `business-flow-contract` and `scenario-contract`).
4. Every risk MUST `affected` something concrete — empty `affected` is a gate failure.
5. Every `failure_mode` MUST describe `user_visible_effect` (otherwise the risk is unobservable and cannot be tested).
6. `risk_id` MUST be unique within the file.

---

## 6. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter, JSON schema, severity computed correctly |
| `consistency-validator` | risk↔seed coupling, affected references resolve |
| `traceability-validator` | every risk has evidence; every mitigation has a status |
| `completeness-validator` | category distribution sanity (e.g., not 100% in one category for a non-trivial feature) |

---

## 7. Cross-System Use

- **api-testing** uses risks to:
  - Generate abuse-failure API scenarios (e.g., negative auth, payload tampering)
  - Prioritize endpoints by aggregate severity of attached risks
  - Decide what goes into the security/non-functional pack (ZAP scans, etc.)

- **e2e** uses risks to:
  - Generate abuse-failure journeys (e.g., concurrent edit, stale state)
  - Prioritize critical user paths

- **reporting-mcp** aggregates risk severity into the executive summary.

---

## 8. Append/Update Protocol

When a downstream system discovers an additional risk during its analysis, it does NOT modify the upstream artifact. Instead it produces:

```
shared-artifacts/risks/<feature>.api-augmented.json
shared-artifacts/risks/<feature>.e2e-augmented.json
```

These are separate artifacts that reference the base via:

```json
{
  "extends": "shared-artifacts/risks/<feature>.json",
  "extends_checksum": "sha256:<hex>",
  "additional_risks": [ /* ... */ ]
}
```

Reporting-mcp merges all variants into a unified risk view at output time.

---

## 9. Versioning

- 1.0 — initial.
- Adding a category or `affected.*` key → minor.
- Removing categories or restructuring severity → major.
