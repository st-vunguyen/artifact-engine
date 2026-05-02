# Workflow Contract

> **Contract ID:** `workflow-contract@1.0`
> **Purpose:** the typed shape of a workflow definition that the orchestrator's execution engine can run.

A workflow is a *declarative* description of phases, inputs, outputs, validators, and gates. Domain systems author workflows; the orchestrator executes them. Workflows do not contain imperative code.

---

## 1. JSON Schema (canonical shape)

```json
{
  "workflow_id": "business-flow-full-pipeline@1.0",
  "system": "business-flow-intelligence",
  "description": "Spec → 17-section analysis → Mermaid pack → verification → output",
  "inputs": [
    {
      "name": "spec_corpus",
      "kind": "directory",
      "path": "input/specs/",
      "required": true,
      "validator": "spec-corpus-validator"
    }
  ],
  "consumes_shared": [],
  "produces_shared": [
    { "kind": "business-flow", "path_template": "shared-artifacts/business-flows/{feature}.md" },
    { "kind": "state-machine", "path_template": "shared-artifacts/state-machines/{feature}.json" },
    { "kind": "risk-register", "path_template": "shared-artifacts/risks/{feature}.json" },
    { "kind": "scenario-seeds", "path_template": "shared-artifacts/scenarios/{feature}.seed.json" }
  ],
  "phases": [
    {
      "id": "01-input",
      "name": "Source Intake",
      "agent": "spec-analyzer",
      "skills": ["spec-intake"],
      "mcp": ["spec-parser-mcp"],
      "required_outputs": [
        "runtime/.../01-input/normalized/*.md",
        "runtime/.../01-input/manifest.json"
      ],
      "gates": ["completeness-gate"]
    },
    {
      "id": "02-analysis",
      "name": "17-Section Analysis",
      "agent": "business-flow-generator",
      "skills": ["analysis-extraction"],
      "mcp": ["traceability-mcp", "rule-analysis-mcp"],
      "required_outputs": [
        "runtime/.../02-analysis/business-flow-document.md"
      ],
      "depends_on": ["01-input"],
      "gates": ["completeness-gate", "traceability-gate"]
    },
    {
      "id": "03-generation",
      "name": "Mermaid Pack",
      "agent": "mermaid-generator",
      "skills": ["mermaid-pack"],
      "mcp": ["state-machine-mcp"],
      "required_outputs": [
        "runtime/.../03-generation/flowchart.mmd",
        "runtime/.../03-generation/swimlane.mmd",
        "runtime/.../03-generation/state-diagram.mmd"
      ],
      "depends_on": ["02-analysis"],
      "gates": ["completeness-gate"]
    },
    {
      "id": "04-validation",
      "name": "Schema + Rule Validation",
      "validators": [
        "artifact-validator",
        "consistency-validator"
      ],
      "depends_on": ["02-analysis", "03-generation"],
      "gates": ["consistency-gate", "quality-depth-gate"]
    },
    {
      "id": "05-verification",
      "name": "Evidence Reconciliation",
      "agent": "business-flow-verifier",
      "mcp": ["verification-mcp", "traceability-mcp"],
      "required_outputs": [
        "runtime/.../05-verification/report.md"
      ],
      "depends_on": ["04-validation"],
      "gates": ["traceability-gate", "quality-depth-gate"]
    },
    {
      "id": "06-publish",
      "name": "Promote to Shared + Output",
      "actor": "orchestrator",
      "depends_on": ["05-verification"],
      "writes": [
        "shared-artifacts/...",
        "output/business-flow-packages/{feature}/"
      ]
    }
  ],
  "checkpoint_after": ["02-analysis", "03-generation", "05-verification"],
  "recovery_strategies": {
    "validation_failed": "stop-and-report",
    "agent_error": "retry-up-to-2",
    "missing_input": "stop-and-report"
  }
}
```

---

## 2. Field Definitions

| Field | Type | Required | Description |
|---|---|:---:|---|
| `workflow_id` | `string` (slug@semver) | ✓ | Unique, versioned identifier |
| `system` | `string` | ✓ | Owning system (`business-flow-intelligence`, etc.) |
| `description` | `string` | ✓ | One-line human description |
| `inputs[]` | `Input[]` | ✓ | What the workflow needs from `input/` |
| `consumes_shared[]` | `SharedRef[]` |   | Which `shared-artifacts/` it reads |
| `produces_shared[]` | `SharedRef[]` |   | Which `shared-artifacts/` it publishes |
| `phases[]` | `Phase[]` | ✓ | Ordered phase definitions; the engine uses `depends_on` to compute parallelism |
| `checkpoint_after[]` | `phase_id[]` |   | Phases after which a checkpoint MUST be written |
| `recovery_strategies` | `object` |   | Mapping of failure kind → strategy id |

### Input shape

```ts
type Input = {
  name: string
  kind: "file" | "directory" | "shared-artifact"
  path?: string                         // for file/directory
  shared_kind?: string                  // for shared-artifact
  required: boolean
  validator: string                     // validator id from core/validators/
}
```

### SharedRef shape

```ts
type SharedRef = {
  kind: string                          // e.g., "business-flow", "scenario-seeds"
  path_template: string                 // {feature} placeholder
  contract: string                      // e.g., "business-flow-contract@^1.0"
}
```

### Phase shape

```ts
type Phase = {
  id: string                            // unique per workflow
  name: string
  agent?: string                        // agent file id under systems/<x>/agents/
  actor?: "orchestrator"                // for orchestrator-only steps (e.g., publish)
  skills?: string[]                     // skill ids from systems/<x>/skills/
  mcp?: string[]                        // MCP server ids from core/mcp/
  validators?: string[]                 // validator ids from core/validators/
  required_outputs: string[]            // glob patterns under runtime/.../<phase-id>/
  depends_on?: string[]                 // other phase ids
  gates: string[]                       // validation-gate ids from core/orchestrator/validation-gates/
}
```

---

## 3. Hard Rules

1. **Phase IDs MUST be unique** within a workflow.
2. **Every phase MUST declare `required_outputs`** — even if zero, it must be the empty array (explicit).
3. **`depends_on` MUST form a DAG** (no cycles). The orchestrator computes a topological order; independent phases run in parallel.
4. **Gates run AFTER `required_outputs` exist** — gates evaluate produced artifacts; you can't gate before generation.
5. **`consumes_shared` artifacts MUST exist before INPUT phase starts.** If absent, the orchestrator raises `missing-input`.
6. **`produces_shared` is published only after the LAST phase succeeds** and all gates pass.
7. **Workflows are versioned;** changing required outputs or contracts → bump major.

---

## 4. Lifecycle the Orchestrator Implements

```
load workflow
  ↓
validate workflow (against this contract)
  ↓
verify all `inputs[].required` exist + pass validators
  ↓
verify all `consumes_shared[]` exist + match contract version
  ↓
topologically order phases by depends_on
  ↓
for each phase (sequentially or in parallel where independent):
    initialize agent / skills / MCP
    run phase
    verify required_outputs exist
    run gates  ← may BLOCK and emit checkpoint
  ↓
write checkpoint after each phase in `checkpoint_after`
  ↓
final: orchestrator publishes produces_shared + writes output package
```

---

## 5. Workflow Discovery

Each system registers its workflows under:

```
systems/<system>-intelligence/pipelines/<workflow>.workflow.json
```

The `<workflow>.md` file (e.g., `analyze-spec-to-business-flow.md`) is the human-readable description. The `.workflow.json` (or YAML equivalent) is the machine-readable contract conforming to this schema.

---

## 6. Validation

A workflow definition is itself an artifact. It is validated by:

```
core/validators/artifact-validator/   ← against this contract
```

Invalid workflows are rejected at load time; the orchestrator refuses to start them.

---

## 7. Example Decisions This Contract Forces

- **No silent skipping.** Every phase declares its outputs and gates explicitly.
- **No imperative tricks.** A "do this complicated thing" step doesn't fit; you'd split it into multiple phases.
- **No hidden cross-system calls.** Cross-system handoffs go through `consumes_shared` / `produces_shared`.
- **No mystery checkpoints.** `checkpoint_after` is explicit — the engine never decides on its own.

---

## 8. Backwards Compatibility

- v1.x → adding optional fields (e.g., `description_long`, `tags`) is non-breaking.
- v1.x → 2.0 breaking changes: renaming `produces_shared`, changing `Phase.gates` cardinality semantics, removing `recovery_strategies`.

Producers MUST declare the contract version they target. Consumers (the orchestrator + validator) MUST refuse unknown major versions.
