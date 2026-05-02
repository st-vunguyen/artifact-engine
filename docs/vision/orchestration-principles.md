# Orchestration Principles (Vision)

> The kernel design principles for the orchestrator.

## Principles

1. **Single writer to runtime/.** Only the orchestrator mutates `runtime/`. Agents write to phase-scoped folders only.
2. **Frozen workflow per run.** The workflow definition is loaded once and snapshotted; mid-run changes have no effect.
3. **Topological execution.** Independent phases run in parallel; dependent phases run in order.
4. **Idempotent phases.** Re-running a phase on the same input produces semantically equivalent output.
5. **Structured failure.** Every failure has a typed kind; recovery is deterministic.
6. **Lifecycle events as ground truth.** Append-only events log is the canonical history.
7. **Contracts everywhere.** Workflow, phase, execution, every artifact — all typed.
8. **Verifier separate from generator.** Generators don't verify their own work.

## What the orchestrator does NOT do

- Decide what's "important" semantically
- Modify artifacts
- Generate content
- Make ad-hoc decisions outside declared strategies
- Skip required phases or gates

## Why this matters

A loose orchestrator is the second-most-common failure mode (after loose validation). The principles above keep execution boring, reproducible, auditable — the qualities that distinguish a real system from a "let's see what happens" pipeline.

## See also

- [execution-philosophy.md](execution-philosophy.md)
- [docs/architecture/workflow-engine.md](../architecture/workflow-engine.md)
- [EXECUTION-LIFECYCLE.md](../../EXECUTION-LIFECYCLE.md)
