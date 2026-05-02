# execution-sdk

> **Module:** `core/sdk/execution-sdk`
> **Purpose:** helpers for agents and systems to interact with the execution engine — read state, emit progress, request services.

Agents are pure phase logic. The execution-sdk gives them the few primitives they need to cooperate with the engine.

---

## 1. Surface

```ts
namespace executionSdk {
  // State (read-only for agents)
  function context(): AgentStateView
  function phaseInputs(name: string): ResolvedInput
  function phaseScopedDir(): string

  // Progress events
  function emit(event: ProgressEvent): void

  // MCP / Skill access
  function callMcp(server: string, tool: string, args: object): McpResult
  function useSkill(name: string, args: object): SkillResult

  // Item-granular reporting (for partial-recovery)
  function startItem(item_id: string): ItemHandle
  function completeItem(handle: ItemHandle, evidence?: Evidence[]): void
  function failItem(handle: ItemHandle, blocker: Blocker): void

  // Read other phases' produced files (declared inputs only)
  function read(path: string): string | object
  function listProduced(phase_id: string, kind?: string): ProducedFile[]
}
```

---

## 2. Read-Only Agent State

```ts
const ctx = executionSdk.context()
// { run_id, phase_id, feature, system, workflow_id,
//   produced_so_far: [...], retry: { attempt, alteration? },
//   shared_inputs: [...] }
```

Agents use `ctx.retry.attempt` to adjust behavior on retries, `ctx.shared_inputs` to access cross-system artifacts, etc.

---

## 3. Progress Events

```ts
executionSdk.emit({ type: "phase.progress", marker: "items-processed:50/200" })
executionSdk.emit({ type: "agent.note", level: "info", text: "Skipping deprecated operation X" })
executionSdk.emit({ type: "agent.gap_detected", gap_id: "G02", topic: "..." })
```

Events go to `runtime/logs/<run-id>/events.jsonl` and feed reporting-mcp.

---

## 4. MCP Calls

```ts
const result = executionSdk.callMcp("traceability-mcp", "build-matrix-row", {
  claim, evidence
})
```

The SDK manages MCP handle lifecycle (already-launched servers from the orchestrator's pool). Agents see only typed calls.

---

## 5. Skill Use

```ts
const skillResult = executionSdk.useSkill("analysis-extraction", { spec_path: "..." })
```

Skills are domain-specific recipes. The SDK loads the skill from `systems/<system>/skills/<name>/SKILL.md` and runs its declared steps.

---

## 6. Item Handles (granular phases)

For phases with `granular: true`:

```ts
for (const op of operations) {
  const item = executionSdk.startItem(`op-${op.operationId}`)
  try {
    // ... process ...
    executionSdk.completeItem(item, evidence)
  } catch (e) {
    executionSdk.failItem(item, blockerFromError(e))
  }
}
```

Each item's status is recorded in `runtime/.../<phase>/manifest.json`, enabling partial recovery.

---

## 7. Reading Inputs

Agents read declared inputs only:

```ts
const oas = executionSdk.read("input/api/openapi.yaml")
const flow = executionSdk.read("shared-artifacts/business-flows/checkout.md")
```

The SDK enforces:
- The path is in the agent's declared inputs.
- The path exists.
- For shared-artifacts, contract version is in range.

Reading outside declared inputs throws `UnauthorizedRead`.

---

## 8. Listing Produced Files

```ts
const trace = executionSdk.listProduced("02-analysis", "business-flow")
```

Used to consume earlier-phase outputs (only those declared as inputs to the current phase).

---

## 9. Cancellation

```ts
if (executionSdk.context().cancelled) {
  // wrap up gracefully
  return
}
```

Long-running agents poll `cancelled` to honor user/timeout cancellation.

---

## 10. Determinism Helpers

```ts
const id = executionSdk.deterministicId(["risk", subject])
// returns a stable string from inputs (used to keep ids consistent across reruns)
```

---

## 11. Boundaries

The execution-sdk does NOT:
- Allow agents to run other phases
- Modify the workflow definition
- Allow agents to write to `output/` or `shared-artifacts/` (that's publish-only)
- Expose other agents' working directories

It is the agent's window into the execution context, with strict scoping.

---

## 12. Implementation Note

The execution-sdk is provided to agents at invocation time (injected by the phase-runner). Agents do NOT import it as a library; they receive a pre-bound handle. This binding enforces scope and identity (which run, which phase, which agent).
