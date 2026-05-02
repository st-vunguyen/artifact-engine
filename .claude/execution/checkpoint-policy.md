# Checkpoint Policy

## When to checkpoint

After every phase listed in `workflow.checkpoint_after`. Common practice:

```yaml
checkpoint_after:
  - 02-analysis
  - 03-generation
  - 05-verification
```

## Checkpoint storage

```
runtime/checkpoints/<run-id>/<phase-id>.checkpoint.json
runtime/checkpoints/<run-id>/<phase-id>.checkpoint.signed
```

## Schema

See [core/orchestrator/checkpoint-system/checkpoint-format.md](../../core/orchestrator/checkpoint-system/checkpoint-format.md).

Includes:
- workflow_checksum
- frozen state (phases, retries, blockers)
- produced files (paths + sha256 each)
- cumulative_checksum
- registries snapshot
- next_phase_id
- signature (sha256 of the rest)

## Atomic write

```
1. Write to <phase-id>.checkpoint.json.tmp
2. fsync
3. Rename to .checkpoint.json (atomic on POSIX)
4. Write signature to .checkpoint.signed
5. Append checkpoint event to runtime/logs/<run-id>/events.jsonl
```

A crash mid-write leaves the prior checkpoint untouched.

## Validity (resume preconditions)

- signature matches recomputed sha256
- workflow_checksum matches on-disk workflow.frozen.json
- every produced[].path exists with recorded checksum
- registries.* versions match current (or `--allow-registry-drift`)

## Hot checkpoints

For phases > 30 min, agents declaring `supports_hot_resume: true` MAY emit hot checkpoints with `progress.last_marker`. Resume reads marker; agent skips already-processed items.

If agent doesn't support hot resume → hot checkpoint discarded; phase restarts from scratch.

## Garbage collection

Default retention: 30 days under `runtime/checkpoints/<run-id>/`. Manager NEVER deletes by itself; a separate ops command performs GC.

## Forbidden

- Editing checkpoint files manually
- Sharing checkpoints across run-ids
- Resuming past terminal states (SUCCEEDED / FAILED / CANCELLED)

## See also

- [core/orchestrator/checkpoint-system/checkpoint-manager.md](../../core/orchestrator/checkpoint-system/checkpoint-manager.md)
- [core/orchestrator/checkpoint-system/resume-strategy.md](../../core/orchestrator/checkpoint-system/resume-strategy.md)
