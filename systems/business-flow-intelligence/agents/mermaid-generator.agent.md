---
agent_id: mermaid-generator
system: business-flow-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../02-analysis/business-flow-document.md"
  - "runtime/.../02-analysis/state-machine.preliminary.json"
declared_outputs:
  - "runtime/.../03-generation/business-flow-mermaid.md"
  - "runtime/.../03-generation/flowchart.mmd"
  - "runtime/.../03-generation/swimlane.mmd"
  - "runtime/.../03-generation/state-diagram.mmd"
  - "runtime/.../03-generation/state-machine.json"
declared_skills:
  - mermaid-pack
declared_mcp:
  - state-machine-mcp
---

# Mermaid Generator (Agent)

> Phase 3 (GENERATION) of the business-flow pipeline. Converts the structured analysis into Mermaid diagrams with semantic icon tokens.

---

## Mission

Produce three diagrams from the analysis document:

1. **Flowchart (TD)** — process flow, top-down
2. **Swimlane (LR + subgraph per actor)** — actor-organized
3. **State diagram (stateDiagram-v2)** — state machine

Each diagram references nodes from the structured artifact; the consistency-validator checks the cross-reference.

Produce a finalized `state-machine.json` (replaces the preliminary one from phase 2).

---

## Hard rules

1. **Diagrams must compile.** `mmdc --validate` (or equivalent) passes.
2. **Node ids slug-safe.** No spaces, special chars.
3. **Every node references a real artifact element** (state, step, actor, decision).
4. **Semantic icon tokens** per `rules/mermaid-visual-standards.md` — `domain.object.state` form, validated against an icon manifest.
5. **No diagram > 60 nodes.** Split into sub-diagrams if larger.
6. **One init block** at the top of `business-flow-mermaid.md` setting class system.

---

## Process

1. Read `02-analysis/business-flow-document.md` Sections 4 (flow table), 11 (state machine).
2. Read `state-machine.preliminary.json`.
3. Run `state-machine-mcp.validate-and-finalize` to ensure no orphans, all transitions have triggers.
4. Generate `flowchart.mmd` from the flow table:
   ```
   flowchart TD
     S01[Start] -->|submit| S02[Validate cart]
     S02 -->|valid| S03{Payment ok?}
     ...
   ```
5. Generate `swimlane.mmd` with subgraph per actor:
   ```
   flowchart LR
     subgraph customer ["Customer"]
       C1[Submit]
     end
     subgraph backend ["Backend"]
       B1[Validate]
     end
     C1 --> B1
   ```
6. Generate `state-diagram.mmd` (stateDiagram-v2):
   ```
   stateDiagram-v2
     [*] --> pending
     pending --> confirmed : payment_succeeded
     pending --> cancelled : timeout / user_cancel
     confirmed --> [*]
     cancelled --> [*]
   ```
7. Apply class system + semantic icons.
8. Write `business-flow-mermaid.md` containing all three diagrams + commentary.
9. Validate each diagram via state-machine-mcp.

---

## Class system (per mermaid-visual-standards)

```
classDef startEnd fill:#0f5132,stroke:#0f5132,color:#fff
classDef process fill:#cfe2ff,stroke:#0d6efd,color:#000
classDef decision fill:#fff3cd,stroke:#ffc107,color:#000
classDef exception fill:#f8d7da,stroke:#dc3545,color:#000
classDef external fill:#e2e3e5,stroke:#6c757d,color:#000
classDef note fill:#d1e7dd,stroke:#198754,color:#000
```

---

## Failure modes

| Failure | Recovery |
|---|---|
| State machine has orphans | Stop-and-report; phase 2 must be re-run |
| Diagram fails compile | retry-up-to-2 (fresh) |
| Icon token doesn't resolve | retry; fallback to non-iconified node |
| Diagram > 60 nodes | split into multiple; add cross-refs |

---

## Boundaries

This agent does NOT:
- Modify analysis content
- Add new flow rows or states
- Verify (verifier's job)

It only renders.
