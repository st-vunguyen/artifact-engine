# Execution Mapping

> **Module:** `core/orchestrator/router/execution-mapping`
> **Purpose:** translate a frozen workflow definition into a concrete execution plan (DAG of tasks, agent assignments, gate hooks).

The selector freezes the workflow. The execution mapping turns that frozen definition into "what runs, when, with which actors."

---

## 1. Inputs

```ts
type MappingInput = {
  selected: SelectedWorkflow
  agents_registry: AgentRegistry
  mcp_registry: McpRegistry
  validators_registry: ValidatorRegistry
  gates_registry: GateRegistry
}
```

---

## 2. Outputs

```ts
type ExecutionPlan = {
  run_id: string
  dag: TaskNode[]
  edges: Edge[]                      // depends_on relationships
  parallelism: number
  total_phases: number
}

type TaskNode = {
  task_id: string                    // <run-id>:<phase-id>
  phase_id: string
  kind: "agent-run" | "validators-run" | "gates-run" | "publish"
  agent?: AgentRef
  skills?: SkillRef[]
  mcp?: McpRef[]
  validators?: ValidatorRef[]
  gates?: GateRef[]
  inputs: TaskInputBinding[]
  outputs_required: string[]
  scoped_dir: string                 // runtime/.../<phase-id>/
  timeout_seconds: number
  checkpoint_after: boolean
}

type Edge = { from: phase_id, to: phase_id }
```

---

## 3. Mapping Algorithm

```
For each phase in workflow.phases:
  1. Resolve agent: agents_registry[phase.agent]
     – verify it declares it can read the phase's inputs and write its outputs
  2. Resolve skills: skills_registry[phase.skills[]]
  3. Resolve mcp: mcp_registry[phase.mcp[]]
     – verify each MCP server is reachable / launchable
  4. Resolve validators: validators_registry[phase.validators[]]
  5. Resolve gates: gates_registry[phase.gates[]]
  6. Decide kind:
     – agent present → "agent-run"
     – only validators → "validators-run"
     – only gates → "gates-run"
     – `actor: "orchestrator"` + writes → "publish"
  7. Bind inputs:
     – workflow.inputs become INPUT phase bindings
     – consumes_shared become read-only mounts
     – upstream phase outputs are referenced by their relative path
  8. Compute scoped_dir = runtime/active-executions/<run-id>/<phase-id>/
  9. Compute timeout: phase.timeout_seconds || workflow.default_timeout || 900
 10. Compute checkpoint_after = phase.id ∈ workflow.checkpoint_after

Build edges from phase.depends_on.
Topologically sort; detect cycles → fail.
Compute parallelism = max width of independent phases.
```

---

## 4. Agent Reference Shape

```ts
type AgentRef = {
  agent_id: string
  path: string                       // systems/<x>/agents/<id>.agent.md
  declared_inputs: string[]          // glob patterns
  declared_outputs: string[]
  declared_skills: string[]
  declared_mcp: string[]
  version: string
}
```

The orchestrator validates that a phase's bindings are within the agent's declared boundaries; agents reading/writing outside their declarations are blocked at execution start.

---

## 5. Input Bindings

```ts
type TaskInputBinding = {
  name: string                       // local label inside the phase
  source:
    | { kind: "input-tree", path: string }
    | { kind: "shared-artifact", path: string, contract: string }
    | { kind: "phase-output", phase_id: string, glob: string }
    | { kind: "constant", value: any }
  read_only: true                    // always
}
```

All inputs are read-only. The phase writes only into its `scoped_dir`.

---

## 6. Outputs Required

The phase MUST produce files matching `outputs_required` (glob patterns) inside `scoped_dir`. The orchestrator scans after the agent exits; if any pattern has zero matches → phase fails with `missing-required-output`.

---

## 7. Gates Wiring

Every phase has zero or more gates listed in its definition. The mapping turns each gate id into a `GateRef`:

```ts
type GateRef = {
  gate_id: string                    // "completeness-gate", ...
  path: string                       // core/orchestrator/validation-gates/<id>.md
  config: object                     // contract-defined per-gate config (e.g., coverage threshold)
}
```

Gate execution is described in `core/orchestrator/validation-gates/`. The mapping just wires which gates run on which phase.

---

## 8. Publish Tasks

Phases with `actor: "orchestrator"` (typically the last) are wired to write the package + shared-artifacts. The mapping computes target paths from the workflow's `produces_shared` and the package layout in `naming-conventions.md`.

```ts
{
  kind: "publish",
  publish_targets: [
    { kind: "shared-artifact", source: "<scoped>/business-flow.md", dest: "shared-artifacts/business-flows/<feature>.md", contract: "..." },
    { kind: "package",         source: "<run-root>",                  dest: "output/business-flow-packages/<feature>/", layout: "standard" }
  ]
}
```

---

## 9. The DAG, Visualized

```
┌────────────┐
│ 01-input   │
└─────┬──────┘
      │
┌─────▼──────┐    ┌─────────────────┐
│ 02-analysis│───>│ 04-validation   │
└─────┬──────┘    └─────────┬───────┘
      │                     │
┌─────▼──────┐              │
│03-generation│─────────────┘
└─────┬──────┘
      │
┌─────▼──────────┐
│ 05-verification│
└─────┬──────────┘
      │
┌─────▼──────┐
│ 06-publish │
└────────────┘
```

When phases are independent (e.g., 02-analysis and 03-generation both depend only on 01-input), they run in parallel up to the orchestrator's concurrency limit.

---

## 10. Validation of the Plan

Before execution starts:

- All AgentRefs resolve.
- All MCPRefs resolve.
- All ValidatorRefs resolve.
- All GateRefs resolve.
- The DAG is acyclic.
- Every required output glob is well-formed.
- Every input binding's source exists or is a forward reference to a phase that runs first.

A failing plan validation produces `plan-invalid` blockers; the orchestrator does not start the run.

---

## 11. Re-mapping on Resume

When resuming, the orchestrator reads `runtime/.../workflow.frozen.json` and re-runs this mapping over it. Result must be identical (mapping is pure given the registries; registries are versioned). If registries changed since the original run, the mapping detects the drift and refuses to resume — the user must either rebuild a fresh run or pin the prior registry versions.

---

## 12. Boundaries

The execution mapping DOES NOT:
- Run anything
- Modify the workflow
- Modify registries
- Make scheduling decisions about concurrency at the OS level (just exposes parallelism width)

It produces a plan; the execution-engine consumes it.
