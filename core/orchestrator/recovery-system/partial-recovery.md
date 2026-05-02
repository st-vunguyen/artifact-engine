# Partial Recovery

> **Module:** `core/orchestrator/recovery-system/partial-recovery`
> **Purpose:** salvage successful sub-results from a partially-failed phase to avoid losing all work.

Most phases are atomic: they either produce all their required outputs or fail. Some phases are *granular* — they process N items, where some succeed and some fail. Partial recovery is for the latter.

---

## 1. When Partial Recovery Applies

A phase qualifies for partial recovery iff:

1. The phase declares `granular: true` in its workflow definition.
2. The phase emits per-item progress events: `{ "item_id", "status": "succeeded" | "failed", "evidence", "blocker?" }`.
3. The agent supports re-entering with a "skip these item_ids" hint.

Example phases that qualify:
- "Extract API scenarios for each operation" (one item per operation)
- "Generate Mermaid for each flow" (one item per flow)
- "Verify per-status coverage" (one item per status code)

Example phases that DO NOT qualify (atomic):
- "Build state machine from analysis" (single coherent artifact)
- "Compose REPORT.md" (single document)

---

## 2. Plan Schema

```ts
type PartialRecoveryPlan = {
  phase_id: string
  succeeded_items: string[]                    // item_ids to retain
  failed_items: FailedItem[]
  rerun_strategy: "rerun-failed-only" | "rerun-with-altered-prompt"
  carried_artifacts: ProducedFile[]            // per-item files that survive
  retry_budget_for_subset: number
}

type FailedItem = {
  item_id: string
  blocker: Blocker
  evidence: Evidence[]                          // why it failed
}
```

---

## 3. Algorithm

```
1. Read phase events log (runtime/.../<phase>/events.jsonl).
2. Partition items by terminal status.
3. Validate succeeded items:
     - per-item required outputs exist in scoped_dir
     - per-item checksums valid
4. Quarantine failed items:
     - move per-item failed artifacts to <scoped>/quarantine/<item_id>/
     - record their blocker entries
5. Build plan:
     succeeded_items: keep
     failed_items: rerun
     rerun_strategy: per workflow declaration (default rerun-failed-only)
6. Allocate sub-budget: typically 50% of original budget; configurable.
7. Hand plan to execution engine to schedule a "subset rerun."
```

---

## 4. Subset Rerun Mechanics

When the engine reruns a subset:

```
agent invocation context.subset = {
  items_to_process: failed_item_ids,
  items_already_processed: succeeded_item_ids
}
```

The agent processes only the listed items. It MUST NOT re-emit artifacts for already-processed items.

After the subset rerun completes, the orchestrator merges:

```
succeeded_items_old + items_processed_subset → final phase artifact set
```

The merge is per-item; succeeded items from the original run are NOT regenerated.

---

## 5. Granularity Declaration

Phases declare granularity in the workflow contract:

```yaml
phases:
  - id: 03-generation
    granular: true
    item_kind: "operation"
    expected_count_from: "phase=01-input.outputs.operations.json[].operationId"
    per_item_required_outputs:
      - "<scoped>/scenarios/{item_id}.json"
```

The `expected_count_from` lets the orchestrator know how many items to expect, which gates "the phase is done" against "the agent decided to stop early."

---

## 6. Per-Item Artifacts

The phase output is structured per-item:

```
runtime/.../03-generation/
├── scenarios/
│   ├── op-create-order.json      ← succeeded
│   ├── op-list-orders.json       ← succeeded
│   ├── op-cancel-order.json      ← failed (in quarantine/)
│   └── op-refund-order.json      ← succeeded
├── quarantine/
│   └── op-cancel-order/
│       ├── partial-output.json
│       └── error.json
└── manifest.json                 ← lists succeeded items + checksums
```

`manifest.json` is the source of truth for "what's done." The merge step regenerates it on subset completion.

---

## 7. Constraints

| Constraint | Why |
|---|---|
| Items are independent | If item A's success depends on item B, partial recovery is unsafe; declare phase as non-granular. |
| Per-item artifacts have stable IDs | Otherwise merge cannot identify carry-overs. |
| Per-item required_outputs exist | Or completeness gate fails for the rerun. |
| Quarantine before retry | Prevents stale half-output from contaminating the rerun. |

---

## 8. Coordination With Verification

After a subset rerun, the verifier runs over the MERGED outputs (not just the rerun subset). This catches consistency issues that arise from mixing original + rerun items.

If verification then fails on items not in the rerun subset, partial recovery has produced an inconsistent state → escalate to full phase rerun.

---

## 9. Default Behavior

Partial recovery is OPT-IN. Phases default to atomic; they must explicitly declare `granular: true`. Reasons:

- Most phases are atomic by nature.
- Granular phases require per-item artifact discipline.
- The merge logic adds complexity; it's only worth it for high-cost phases.

---

## 10. Logging

Partial recovery events:

```
{ "type": "phase.partial_recovery_started", "phase_id", "succeeded_count", "failed_count" }
{ "type": "phase.partial_recovery_completed", "phase_id", "merged_count", "still_failed_count" }
```

The reporting-mcp surfaces partial recovery in REPORT.md with a per-item summary.

---

## 11. Boundaries

Partial recovery DOES NOT:
- Apply to atomic phases
- Modify granularity at runtime (declared in workflow only)
- Auto-skip persistently failing items (those count as phase failures after budget)
- Re-validate already-succeeded items (their checksums ensure stability)

It is a budget-saver for granular work, not a get-out-of-jail card.
