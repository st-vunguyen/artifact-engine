# Checkpoint Format

> **Module:** `core/orchestrator/checkpoint-system/checkpoint-format`
> **Purpose:** define the on-disk shape of checkpoints — what gets recorded so a run can be resumed deterministically.

A checkpoint is the engine's "save point": enough information to resume a run from a specific phase boundary without re-running prior work.

---

## 1. Location

```
runtime/checkpoints/<run-id>/<phase-id>.checkpoint.json
runtime/checkpoints/<run-id>/<phase-id>.checkpoint.signed
```

The `.signed` file is a SHA-256 of the JSON; it is recomputed and verified before any resume.

---

## 2. Schema

```ts
type Checkpoint = {
  schema_version: "1.0"
  run_id: string
  workflow_id: string
  workflow_checksum: string                   // sha256 of workflow.frozen.json
  feature: string
  system: string
  phase_id: string                            // the phase this checkpoint is AFTER
  phase_index: number                         // 0-based ordinal in DAG order
  created_at: string                          // ISO-8601 UTC
  state: {
    phases: Record<phase_id, PhaseStatus>     // mirror of execution state
    retries: Record<phase_id, number>
    blockers: Blocker[]                       // empty in a clean checkpoint
  }
  produced: {
    phase_id: string
    files: ProducedFile[]                     // path + checksum + size
  }[]
  cumulative_checksum: string                 // sha256 over all produced files
  evidence_coverage: number                   // 0..1
  next_phase_id: string | null                // null when terminal
  registries: {
    agents: Record<agent_id, agent_version>
    mcp: Record<mcp_id, mcp_version>
    validators: Record<validator_id, version>
    gates: Record<gate_id, version>
  }
  signature: string                           // sha256 of the rest of the document
}

type ProducedFile = {
  path: string                                // relative to run root
  checksum: string                            // sha256
  size: number                                // bytes
  artifact_kind: string                       // e.g., "business-flow", "trace-matrix"
  contract?: string                           // if applicable
}
```

---

## 3. Why Each Field Exists

| Field | Why |
|---|---|
| `workflow_checksum` | Refuse resume if the workflow definition was modified |
| `phases` snapshot | Know which phases to skip on resume |
| `retries` snapshot | Apply remaining retry budget |
| `produced[].checksum` | Detect file tampering / drift |
| `cumulative_checksum` | Single comparison value summarizing all produced state |
| `registries` | Refuse resume if agent/mcp/validator/gate versions changed |
| `signature` | Refuse resume if the checkpoint itself was tampered with |
| `next_phase_id` | Direct pointer for resume scheduler |

---

## 4. Cumulative Checksum

```
let manifest = sort(produced[].path).map(f => f.path + ":" + f.checksum).join("\n")
cumulative_checksum = sha256(manifest)
```

This single value is what consumers (resume strategy, recovery system) compare to detect any change.

---

## 5. When Checkpoints Are Written

The orchestrator writes a checkpoint after every phase listed in `workflow.checkpoint_after`. Common practice:

```yaml
checkpoint_after: ["02-analysis", "03-generation", "05-verification"]
```

Phases not in this list don't get their own checkpoint; the prior checkpoint covers up to "the start of the unwritten phase."

---

## 6. Hot-Phase Checkpoints

For very long phases (> 30 minutes), the engine MAY write a hot checkpoint mid-phase. Hot checkpoints are LESS authoritative — they don't include `produced` files (the phase isn't done) but record progress markers the agent emits via stdout events.

Schema variant:

```ts
type HotCheckpoint = Checkpoint & {
  hot: true
  progress: { items_processed: number, items_total?: number, last_marker?: string }
}
```

Resume from a hot checkpoint requires the agent to support resumption-from-marker (declared in agent frontmatter `supports_hot_resume: true`).

---

## 7. Checkpoint Validity

A checkpoint is valid for resume iff ALL hold:

1. `signature` matches recomputed sha256.
2. `workflow_checksum` matches the on-disk workflow.frozen.json.
3. Every `produced[].path` exists with the recorded checksum.
4. `registries.*` versions match the current registry versions OR a `--allow-registry-drift` flag is set (sysadmin only).
5. The run's `run.state.json` is consistent with `state` in the checkpoint.

A failing condition causes resume refusal with a specific reason.

---

## 8. Tampering Detection

If a checkpoint's `signature` doesn't match, or its `produced` files have drifted, the engine refuses to resume and emits `checkpoint-tampered` blocker. The run is effectively dead from the user's perspective; they must start fresh.

This protects against accidental edits and against malicious modification.

---

## 9. Backward Compatibility

`schema_version: "1.0"` is the current. The engine refuses checkpoints with unknown major versions. Minor version additions are handled via field-tolerant deserialization.

---

## 10. Inspecting Checkpoints

Each checkpoint is human-readable JSON. The reporting-mcp can render a summary:

```
Checkpoint: 03-generation @ 2026-04-30T09:42:11Z
  Run: business-flow-checkout-20260430T093312Z
  Phases done: 01-input, 02-analysis, 03-generation
  Next phase:  04-validation
  Files produced: 8 (cumulative checksum: a3f2c4...)
  Coverage: 0.94
```

---

## 11. Boundaries

The format defines storage. The manager (next doc) handles writing/reading. The resume-strategy uses the manager to plan continuation.

These three are kept separate to enable testing (format is pure data; manager is pure I/O; strategy is pure decision).
