# Checkpoint Manager

> **Module:** `core/orchestrator/checkpoint-system/checkpoint-manager`
> **Purpose:** read and write checkpoints to disk, with atomicity and integrity guarantees.

The manager is the only writer to `runtime/checkpoints/<run-id>/`. It exposes a small interface to the rest of the orchestrator.

---

## 1. Interface

```ts
interface CheckpointManager {
  write(run_id, phase_id, payload: CheckpointPayload): Checkpoint
  list(run_id): CheckpointSummary[]
  latest(run_id): Checkpoint | null
  load(run_id, phase_id): Checkpoint
  validate(checkpoint: Checkpoint): ValidationResult
  invalidate(run_id, reason: string): void           // marks checkpoints unusable; never deletes
}
```

---

## 2. Write Algorithm

```
1. Compose Checkpoint payload (see checkpoint-format.md):
     - snapshot of execution state
     - produced files (paths + sha256 each)
     - cumulative_checksum
     - registries snapshot
2. Compute signature = sha256(JSON without signature field)
3. Write to:
     runtime/checkpoints/<run-id>/<phase-id>.checkpoint.json.tmp
4. fsync
5. Rename to .json (atomic on POSIX)
6. Write signature to <phase-id>.checkpoint.signed
7. Append checkpoint event to runtime/logs/<run-id>/events.jsonl
```

Step 5 is atomic — a crash before rename leaves the prior checkpoint untouched.

---

## 3. Read Algorithm

```
1. Read .checkpoint.json
2. Read .checkpoint.signed
3. Recompute signature; compare
   - mismatch → throw CheckpointTampered
4. Validate against schema
   - mismatch → throw CheckpointSchemaInvalid
5. Verify produced[].path checksums on disk
   - mismatch → throw CheckpointDrift
6. Verify workflow.frozen.json checksum
   - mismatch → throw WorkflowChanged
7. Verify registries
   - mismatch (without --allow-registry-drift) → throw RegistryDrift
8. Return Checkpoint
```

---

## 4. Validation Result

```ts
type ValidationResult = {
  valid: boolean
  failures: ("signature" | "schema" | "produced-drift" | "workflow-changed" | "registry-drift")[]
  details: Record<string, string>
}
```

The resume-strategy consumes this to decide whether to allow resume.

---

## 5. Listing and Latest

```ts
list(run_id): CheckpointSummary[]
```

Returns an ordered list of `{ phase_id, phase_index, created_at, valid }` for all checkpoints under the run. `valid` is computed lazily.

`latest(run_id)` returns the highest-`phase_index` valid checkpoint. If none, returns null.

---

## 6. Invalidation

`invalidate(run_id, reason)` writes a sentinel:

```
runtime/checkpoints/<run-id>/INVALID
{ reason: "...", at: "..." }
```

Any future load against this run-id throws `CheckpointInvalidated`. The checkpoint files are NOT deleted (audit trail preserved).

Triggers for automatic invalidation:
- Workflow definition checksum changed
- Registry versions changed without override flag
- Detected tampering in any checkpoint

---

## 7. Concurrency

Only the orchestrator's main loop calls `write`. Phase runners do not write checkpoints. Read calls (`list`, `latest`, `load`) are safe to invoke concurrently from any caller.

---

## 8. Storage Layout

```
runtime/checkpoints/<run-id>/
├── 02-analysis.checkpoint.json
├── 02-analysis.checkpoint.signed
├── 03-generation.checkpoint.json
├── 03-generation.checkpoint.signed
├── 05-verification.checkpoint.json
├── 05-verification.checkpoint.signed
└── INVALID                              ← present only if invalidated
```

---

## 9. Garbage Collection

Old checkpoints are GC'd by retention policy (default 30 days). The manager NEVER deletes by itself; a separate `cleanup` command, run by ops, performs deletions.

Within a run, checkpoints accumulate (one per declared phase boundary). Hot checkpoints share the same path with `.hot.checkpoint.json` suffix; the manager keeps only the latest hot checkpoint per phase.

---

## 10. Error Surfaces

```ts
type CheckpointError =
  | "CheckpointMissing"
  | "CheckpointTampered"
  | "CheckpointSchemaInvalid"
  | "CheckpointDrift"
  | "WorkflowChanged"
  | "RegistryDrift"
  | "CheckpointInvalidated"
```

Each maps to a specific recovery strategy in the resume planner.

---

## 11. Test Surface

The manager is testable in isolation:

- Write a fake checkpoint → list → latest → load
- Tamper with `.json` → load throws Tampered
- Modify a produced file's content → load throws Drift
- Change workflow.frozen.json → load throws WorkflowChanged
- Bump a registry → load throws RegistryDrift

These tests run on every change to the manager.

---

## 12. Boundaries

The manager DOES NOT:
- Decide what to checkpoint (orchestrator does)
- Decide whether to resume (resume-strategy does)
- Modify produced files
- Write to `output/` or `shared-artifacts/`

It is a typed file store with integrity. Nothing more.
