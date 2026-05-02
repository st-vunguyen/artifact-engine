# Workflow Selector

> **Module:** `core/orchestrator/router/workflow-selector`
> **Purpose:** given a routed intent + candidates, pick exactly one workflow and load it.

The intent router classifies intent and ranks candidates. The workflow selector commits to one and prepares it for execution.

---

## 1. Inputs

```ts
type SelectorInput = {
  routed: RoutedIntent           // from intent-router
  registry: WorkflowRegistry     // discovered workflows from systems/*/pipelines/
  shared_index: SharedIndex      // shared-artifacts/ _index.json contents
}
```

---

## 2. Outputs

```ts
type SelectedWorkflow = {
  workflow_id: string
  system: string
  workflow: WorkflowDefinition   // full, validated against workflow-contract
  inputs_resolved: ResolvedInput[]
  shared_resolved: ResolvedSharedRef[]
  ready: boolean
  blockers: SelectorBlocker[]
}
```

If `ready === false`, the orchestrator does not start the run; it surfaces the blockers.

---

## 3. Selection Algorithm

```
1. If routed.selected exists → use it.
   Else if needs_disambiguation → return error (caller handles).
2. Load the workflow definition from registry[selected.workflow_id].
3. Validate the definition against workflow-contract@1.0.
   On failure → blocker(definition-invalid).
4. Resolve inputs:
     for each input in workflow.inputs:
        check path exists, validator passes
        if missing AND required → blocker(missing-input)
5. Resolve shared dependencies:
     for each ref in workflow.consumes_shared:
        find latest in shared-artifacts/<kind>/
        check contract version range
        if absent → suggest producer; if no producer → blocker(missing-shared)
        if version mismatch → blocker(contract-mismatch)
6. Compute run-id: <system>-<feature>-<utc>.
7. Initialize runtime/active-executions/<run-id>/.
8. Return SelectedWorkflow with ready = (blockers.length === 0).
```

---

## 4. Workflow Registry

Discovered at startup (or on watch reload):

```
WorkflowRegistry = Record<workflow_id, {
  path: string                        // systems/.../<workflow>.workflow.json
  system: string
  definition: WorkflowDefinition
  intent_aliases: string[]            // verbs/phrases the router maps to this id
}>
```

Each system contributes via:

```
systems/<system>/pipelines/<workflow>.workflow.json
systems/<system>/pipelines/<workflow>.md            ← human description
```

The `.workflow.json` MUST validate against `core/artifact-contracts/workflow-contract.md`.

---

## 5. Input Resolution

For each declared input:

```ts
type ResolvedInput = {
  declared: Input                     // from workflow definition
  resolved_path?: string              // actual path on disk
  matched_files: string[]             // files inside, for directory inputs
  validator_result: "pass" | "fail" | "skipped"
  notes?: string
}
```

If the input is `kind: "shared-artifact"`, see §6.

---

## 6. Shared Resolution

For each `consumes_shared` ref:

```ts
type ResolvedSharedRef = {
  declared: SharedRef
  resolved_path: string               // shared-artifacts/<kind>/<feature>.<ext>
  resolved_version: string            // contract@major.minor
  matches_range: boolean
  producer_run_id?: string
  checksum?: string
  notes?: string
}
```

The selector computes the latest version that satisfies the consumer's range. If multiple producers exist (architectural error), the selector emits `producer-uniqueness-violation`.

---

## 7. Blockers

```ts
type SelectorBlocker =
  | { kind: "definition-invalid", detail: string }
  | { kind: "missing-input", input: string }
  | { kind: "missing-shared", ref: string, suggestion?: string }
  | { kind: "contract-mismatch", ref: string, available: string, required: string }
  | { kind: "producer-uniqueness-violation", folder: string, producers: string[] }
  | { kind: "feature-slug-collision", run_id: string }
```

Each blocker carries enough context for the user (or recovery strategy) to act.

---

## 8. Producer Auto-Scheduling (optional)

If `missing-shared` and there is exactly one registered producer for that kind, the selector MAY schedule the producer first:

```
1. Recursively select the producer workflow.
2. If producer also has unmet dependencies, recurse.
3. Build a producer chain.
4. Return the chain to the orchestrator.
```

The orchestrator then runs them in order. If the chain has cycles or unsatisfiable nodes → blocker.

This is opt-in per workflow definition (`auto_schedule_producers: true`).

---

## 9. Run Initialization

Once `ready === true`, the selector:

```
mkdir -p runtime/active-executions/<run-id>/{01-input,02-analysis,03-generation,04-validation,05-verification}
write runtime/active-executions/<run-id>/run.meta.json:
  {
    run_id, workflow_id, system, feature, started_at,
    inputs_resolved, shared_resolved, agent_versions
  }
write runtime/active-executions/<run-id>/workflow.frozen.json:
  the exact workflow definition used (frozen for the run)
```

The frozen definition prevents mid-run changes from taking effect.

---

## 10. Loaded vs. Frozen

The orchestrator never reads `systems/<x>/pipelines/<workflow>.workflow.json` again during the run. All references go through `runtime/.../workflow.frozen.json`. This guarantees mid-run determinism.

---

## 11. Multi-Workflow Selection (chains)

When the router emits a verify-then-fix flow, or a user asks "produce all packs," the selector returns an ordered list:

```ts
type SelectedChain = SelectedWorkflow[]
```

Each item has its own ready/blockers. The orchestrator runs them sequentially; on first failure, the chain stops.

---

## 12. Boundaries

The selector DOES NOT:
- Run any phase
- Mutate input files
- Mutate shared-artifacts
- Choose between equally ranked candidates (returns disambiguation up the chain)
- Bypass contract validation

It selects, resolves, and freezes.
