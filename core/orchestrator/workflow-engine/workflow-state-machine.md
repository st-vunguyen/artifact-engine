# Workflow State Machine

> **Module:** `core/orchestrator/workflow-engine/workflow-state-machine`
> **Purpose:** the formal state machine governing workflow lifecycle.

Cross-references `core/orchestrator/execution-engine/execution-lifecycle.md` (which is the run lifecycle). This file is the **workflow-level** state machine that coordinates run lifecycles for cross-workflow chains and global execution policy.

---

## 1. States

| State | Meaning |
|---|---|
| REGISTERED | Workflow definition loaded into registry; not yet started |
| QUEUED | Run requested; waiting for slot |
| ACTIVE | Run in progress (one or more phases running) |
| BLOCKED | Run paused awaiting recovery decision |
| CHAINED | Run completed; awaiting downstream chained workflow |
| TERMINAL | Run reached SUCCEEDED, FAILED, or CANCELLED |

---

## 2. Transitions

```
REGISTERED → QUEUED          (run request received)
QUEUED → ACTIVE              (slot acquired; selector + mapping done)
ACTIVE → BLOCKED             (phase blocker raised; recovery decided ask-user or stop)
BLOCKED → ACTIVE             (user resume or recovery retry)
ACTIVE → CHAINED             (run succeeded; downstream workflow auto-scheduled)
CHAINED → ACTIVE             (downstream slot acquired)
ACTIVE → TERMINAL            (run completes — succeeded/failed/cancelled)
BLOCKED → TERMINAL           (cancellation or unrecoverable)
```

---

## 3. Chained Workflow Coordination

When workflow A produces shared-artifacts that workflow B consumes, and B is registered with `auto_schedule: true`, the state machine:

1. Detects A's `produced_shared` matches B's `consumes_shared`.
2. On A's success, transitions A → CHAINED.
3. Schedules B in QUEUED.
4. When B starts, A → TERMINAL.

This implements the canonical pipeline:

```
business-flow-full-pipeline
   ↓ produces business-flow + risks + scenario-seeds + state-machine
test-strategy-full-pipeline
   ↓ produces test-strategy
api-test-full-pipeline + e2e-full-pipeline (parallel)
   ↓ produce api-analysis + e2e-analysis
regression-analysis (optional)
```

Each step transitions the prior to CHAINED, schedules the next.

---

## 4. Cross-Workflow Cancellation

If workflow A is cancelled while B was scheduled depending on A's outputs:
- B remains in QUEUED with `blocker: "upstream-cancelled"`
- Either user resumes by providing equivalent shared-artifacts, or B is cancelled.

---

## 5. Slot Management

The state machine maintains a slot pool per system:

```
slots = {
  "business-flow-intelligence": { capacity: 1, in_use: 0 },
  "api-testing-intelligence":   { capacity: 2, in_use: 0 },
  ...
}
```

QUEUED workflows wait until their system has a free slot. This prevents resource exhaustion when many runs overlap.

---

## 6. Global Policies

The state machine enforces:

- **One in-flight regeneration per shared kind** — if business-flow-intelligence is regenerating `shared-artifacts/business-flows/checkout.md`, a second run targeting the same feature is QUEUED, not ACTIVE.
- **No infinite chain loops** — chained workflows form a DAG; cycles refused at registration.
- **Time-based eviction** — runs in QUEUED for > 24h are rejected with `timeout-queued`.

---

## 7. Telemetry

State transitions emit:

```
{ "type": "workflow.state_changed", "workflow_id", "run_id", "from": "ACTIVE", "to": "BLOCKED", "reason" }
```

Reporting-mcp uses these for the cross-workflow timeline view.

---

## 8. Boundaries

The workflow state machine does NOT:
- Run individual phases (execution-engine does)
- Decide intra-run recovery (recovery-engine does)
- Modify artifacts

It is the cross-workflow coordinator.
