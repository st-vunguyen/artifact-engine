# Phase Contract

> **Contract ID:** `phase-contract@1.0`
> **Purpose:** typed shape of a single phase definition embedded inside a workflow.

A phase is the unit of execution in the artifact engine. The workflow-contract embeds an array of phases conforming to this contract. This file is the single-phase reference that authors use when composing workflows.

---

## 1. Schema

```ts
type Phase = {
  id: string                            // unique within workflow; slug
  name: string                          // human label
  kind?: "agent-run" | "validators-run" | "gates-run" | "publish"
  agent?: string                        // agent id from systems/<x>/agents/
  actor?: "orchestrator"                // for orchestrator-only steps (publish, etc.)
  skills?: string[]                     // skill ids
  mcp?: string[]                        // MCP server ids
  validators?: string[]                 // validator ids
  inputs?: PhaseInput[]                 // explicit phase-level input declarations
  required_outputs: string[]            // glob patterns under runtime/.../<phase-id>/
  produces?: ProducedKind[]             // declarative description of what's produced
  depends_on?: string[]                 // other phase ids
  gates: string[]                       // gate ids that must pass
  granular?: boolean                    // qualifies for partial-recovery
  optional?: boolean                    // skip-phase strategy allowed
  timeout_seconds?: number              // override workflow default
  max_retries?: number                  // override workflow default
  recovery_strategies?: Record<failure_kind, Strategy>  // per-phase override
  checkpoint_after?: boolean            // override workflow's checkpoint_after array
  description?: string                  // human comment
}

type PhaseInput = {
  name: string
  source:
    | { kind: "input-tree", path: string }
    | { kind: "shared-artifact", path: string, contract: string }
    | { kind: "phase-output", phase_id: string, glob: string }
    | { kind: "constant", value: any }
  required: boolean
}

type ProducedKind = {
  artifact_kind: string                 // "business-flow", "test-strategy", ...
  contract: string                      // contract id
  path_template: string                 // path under <phase-id>/
}
```

---

## 2. Phase Kinds

| Kind | Description |
|---|---|
| `agent-run` | An agent processes inputs into outputs (most common) |
| `validators-run` | Pure validator pass over already-produced artifacts |
| `gates-run` | Apply validation gates to current artifact set |
| `publish` | Orchestrator promotes artifacts to shared-artifacts/output |

Default (when omitted): `agent-run` if `agent` field present; `validators-run` if only `validators` present; `gates-run` if only `gates` present.

---

## 3. Hard Rules

1. `id` MUST be unique within the workflow.
2. `required_outputs` MUST be present, even if empty array (explicit).
3. `depends_on` MUST reference earlier-declared phases (no forward refs in YAML).
4. `agent` and `validators` are mutually exclusive (use one kind per phase).
5. `actor: "orchestrator"` excludes `agent` (orchestrator-managed phase).
6. `granular: true` requires per-item progress emission (per `partial-recovery.md`).
7. `optional: true` requires a `recovery_strategies.gate_failed: skip-phase` override.
8. `gates` may be empty array, but most phases have at least `["completeness-gate"]`.

---

## 4. Standard Gate Combinations

| Phase kind | Typical gates |
|---|---|
| INPUT | `completeness-gate` |
| ANALYSIS | `completeness-gate`, `traceability-gate` |
| GENERATION | `completeness-gate`, `consistency-gate` |
| VALIDATION | (validators run; consistency-gate, quality-depth-gate) |
| VERIFICATION | `traceability-gate`, `quality-depth-gate` |
| PUBLISH | `consistency-gate` |

---

## 5. Phase Authoring Cheat Sheet

```yaml
- id: 02-analysis
  name: "17-Section Business Flow Analysis"
  agent: business-flow-generator
  skills: [analysis-extraction]
  mcp: [traceability-mcp, rule-analysis-mcp]
  required_outputs:
    - "runtime/.../02-analysis/business-flow-document.md"
    - "runtime/.../02-analysis/permissions.json"
    - "runtime/.../02-analysis/risk.json"
  depends_on: [01-input]
  gates: [completeness-gate, traceability-gate]
  produces:
    - artifact_kind: business-flow-draft
      contract: business-flow-contract@1.0
      path_template: business-flow-document.md
  timeout_seconds: 1800
```

---

## 6. Validation

The workflow-sdk validates each phase against this contract at workflow load. Errors prevent workflow registration.

---

## 7. See Also

- `workflow-contract.md` — the parent shape.
- `execution-contract.md` — runtime behavior of a phase during execution.
