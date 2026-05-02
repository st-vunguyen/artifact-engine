# workflow-sdk

> **Module:** `core/sdk/workflow-sdk`
> **Purpose:** authoring + introspection helpers for workflow definitions.

Domain authors write workflows in `systems/<system>/pipelines/<workflow>.workflow.json`. The workflow-sdk gives them helpers to compose, validate, and document those definitions.

---

## 1. Surface

```ts
namespace workflowSdk {
  function defineWorkflow(spec: WorkflowSpec): WorkflowDefinition
  function validate(definition: WorkflowDefinition): WorkflowValidationResult
  function topologicalOrder(definition: WorkflowDefinition): phase_id[]
  function detectCycles(definition: WorkflowDefinition): Cycle[]
  function describe(definition: WorkflowDefinition): string         // human MD description
  function snapshot(definition: WorkflowDefinition): FrozenDefinition
  function load(path: string): WorkflowDefinition
}
```

---

## 2. Authoring

```ts
const workflow = workflowSdk.defineWorkflow({
  workflow_id: "business-flow-full-pipeline@1.0",
  system: "business-flow-intelligence",
  description: "Spec → analysis → mermaid → verification → output",
  inputs: [...],
  produces_shared: [...],
  phases: [...],
  checkpoint_after: ["02-analysis", "03-generation", "05-verification"],
  recovery_strategies: { agent_error: { kind: "retry-up-to-n", n: 2 } }
})
```

`defineWorkflow` returns the validated definition or throws with helpful errors (missing required fields, malformed phase references, unknown agents).

---

## 3. Validation

`validate(def)` runs:

- Schema check against `workflow-contract.md`
- DAG cycle detection
- Reference resolution: agents, skills, MCPs, validators, gates exist in registries
- Required outputs glob well-formedness
- consumes_shared / produces_shared have known kinds
- recovery_strategies are valid combinations

Output:

```ts
type WorkflowValidationResult = {
  valid: boolean
  errors: ValidationError[]
  warnings: string[]
}
```

---

## 4. Describe (Human MD)

`describe(def)` produces a markdown document equivalent to the JSON definition, for human review:

```md
# business-flow-full-pipeline@1.0

System: business-flow-intelligence
...

## Phases

### 01-input — Source Intake
- Agent: spec-analyzer
- Skills: spec-intake
- MCPs: spec-parser-mcp
- Required outputs:
  - runtime/.../01-input/normalized/*.md
  - runtime/.../01-input/manifest.json
- Gates: completeness-gate
```

This is the source of truth for the human description (`<workflow>.md`).

---

## 5. Snapshot

`snapshot(def)` produces a frozen, content-addressed version:

```json
{
  "definition": { ... },
  "snapshot_checksum": "sha256:...",
  "captured_at": "<ISO-8601>",
  "registry_versions": { ... }
}
```

The orchestrator writes this to `runtime/.../workflow.frozen.json` at run start.

---

## 6. Loading

`load(path)` reads a `.workflow.json` file, validates it, returns the definition. Used by the workflow-selector during run startup.

---

## 7. Compose Helpers

For complex workflows, helper builders:

```ts
const phase = workflowSdk.phase({
  id: "02-analysis",
  agent: "business-flow-generator",
  skills: ["analysis-extraction"],
  mcp: ["traceability-mcp", "rule-analysis-mcp"],
  required_outputs: ["runtime/.../02-analysis/business-flow-document.md"],
  depends_on: ["01-input"],
  gates: ["completeness-gate", "traceability-gate"]
})
```

These produce well-formed phase objects without manual JSON authoring.

---

## 8. Linting

A `lint(definition)` helper applies stylistic rules:

- Phase ids are zero-padded (`01-input`, not `1-input`)
- Required outputs use forward slashes
- depends_on doesn't reference future phases
- No empty gate list on artifact-producing phases

Lint findings are warnings, not errors.

---

## 9. Boundaries

The workflow-sdk does NOT:
- Run workflows
- Read or write artifacts
- Resolve registries (only validates references; resolution is the orchestrator's job)

It is a typed authoring + validation layer.

---

## 10. Use From Systems

Each system's `pipelines/` folder contains workflow definitions authored with this SDK. The system's CI lints + validates them on PR. The orchestrator at runtime loads via `load()`.
