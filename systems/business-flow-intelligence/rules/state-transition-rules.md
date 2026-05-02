# State Transition Rules (System Rule)

> Domain rule. Discipline for Section 11 (State Machine) of business-flow.

---

## 1. State Machine Integrity

A state machine is valid when ALL hold:

1. ≥1 initial state declared.
2. ≥1 terminal state declared (or explicit "no terminal" justification).
3. Every state reachable from at least one initial state.
4. Every terminal state has zero outgoing transitions.
5. Every transition's `from` and `to` reference a declared state.
6. Every transition has a non-empty `trigger`.

Violations are caught by `consistency-validator` and the consistency-gate.

---

## 2. Required Transition Fields

```
{
  from: <state_id>,
  to: <state_id>,
  trigger: <event | action | condition>,
  guard?: <boolean expression>,
  side_effects?: [<observable side-effect>],
  evidence: [<Evidence>]
}
```

- `trigger` MUST be a verb phrase or named event (not "happens").
- `guard` is the condition under which the transition fires (e.g., `amount > 0`).
- `side_effects` are observable (e.g., "send confirmation email").

---

## 3. Required State Fields

```
{
  id: <slug>,
  description: <one-line meaning>,
  on_enter?: [<side-effect>],
  on_exit?: [<side-effect>],
  evidence: [<Evidence>]
}
```

- `id` MUST be a kebab slug (`pending`, `payment-failed`).
- `description` clarifies what being-in-this-state means for the user / system.

---

## 4. Common Patterns to Avoid

| Anti-pattern | Fix |
|---|---|
| Implicit "anything → terminal" | Declare each transition explicitly |
| State with no incoming transitions (other than initial) | Either remove or declare it reachable from initial |
| Trigger reused as state id | Triggers describe events; states describe conditions |
| Side effects not in source | Cite or remove |
| Silent retry loop | Make explicit: `pending → retrying → pending` with max-attempts guard |

---

## 5. Mermaid Twin

The mermaid `state-diagram.mmd` MUST match the structured `state-machine.json`:

- Same set of states
- Same set of transitions
- Same trigger labels
- Same initial / terminal markers

The `state-machine-mcp.validate-twin` enforces this.

---

## 6. Enriched Later

After the system-graph is built, `state-machine.json` MAY be augmented with:
- `state.held_in_component_id` (which service owns this state)
- `transition.crosses_boundary` (does this transition cross a system boundary)

These augmentations live in `runtime/.../enriched-state-machine.json` and the publish step references them.

---

## 7. Why This Matters

State machines are the contract that downstream systems (api-testing, e2e) bind to:
- API testing generates per-state assertion sets.
- E2E generates state-anchored journey assertions.
- Regression prioritizes paths that cross critical states.

A loose state machine produces brittle downstream tests. The discipline above keeps it tight.
