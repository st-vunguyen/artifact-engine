# validation-sdk

> **Module:** `core/sdk/validation-sdk`
> **Purpose:** thin client for invoking validators + gates from agents and systems.

Agents do not directly call validator filesystems. They invoke validators via this SDK, which abstracts wiring (in-process call, MCP server, or registered function).

---

## 1. Surface

```ts
namespace validationSdk {
  function runValidator(id: string, scope: ValidationScope): ValidatorResult
  function runGate(id: string, scope: GateScope, config: object): GateResult
  function runRubric(rubric_id: string, artifact_path: string): RubricResult
  function aggregate(results: (ValidatorResult|GateResult)[]): AggregateResult
  function summarizeForReport(aggregate: AggregateResult): ReportSection
}
```

---

## 2. Validator Invocation

```ts
const result = validationSdk.runValidator("artifact-validator", {
  file_path: "runtime/.../03-generation/business-flow.md",
  contract_id: "business-flow-contract@1.0"
})

if (result.status !== "pass") { ... }
```

The SDK dispatches to the right validator implementation, persists output to `runtime/.../<phase>/validators/<id>/...`, and returns the typed result.

---

## 3. Gate Invocation

```ts
const gateResult = validationSdk.runGate("traceability-gate", {
  scope: { phase_id, scoped_dir, run_id },
  produced: [...],
  trace_matrix_path: "..."
}, {
  coverage_pass_threshold: 0.95
})
```

Gates wrap one or more validators and apply policy. The SDK invokes the gate's logic and returns its result.

---

## 4. Rubric Invocation

```ts
const rubric = validationSdk.runRubric("bf-17-section", "runtime/.../03-generation/business-flow.md")
// rubric.required_pass_count = 14, required_total = 17
```

Rubrics are configured in system rules. The SDK looks them up and runs the items via `rule-analysis-mcp`.

---

## 5. Aggregate Helper

```ts
const ag = validationSdk.aggregate([validatorA, validatorB, gateC])
// produces a single status: pass | fail with counts and findings collated
```

Used by the verifier agent to combine multiple results into a single section.

---

## 6. Report Section Helper

```ts
const section = validationSdk.summarizeForReport(ag)
// produces a markdown table + bullets suitable for REPORT.md
```

Reporting-mcp uses this to assemble the validation summary for output packages.

---

## 7. Async vs. Sync

By default the SDK is sync. Long-running validators (e.g., verbatim verification across 10 source files) run in worker pools transparently — agents see a single call.

---

## 8. Error Modes

- Validator not registered → throw `UnknownValidator`
- Scope missing required fields → throw `InvalidScope`
- Validator timeout → return `status: "fail"` with `kind: "timeout"`

The SDK never silently swallows errors.

---

## 9. Boundaries

Does NOT:
- Decide WHEN to run validators (the orchestrator schedules)
- Modify artifacts
- Bypass gates (gates are runtime policies; SDK only executes them)

It is the typed call layer between agents and the validator/gate ecosystem.
