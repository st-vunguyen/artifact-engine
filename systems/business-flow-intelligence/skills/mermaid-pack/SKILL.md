---
skill_id: mermaid-pack
system: business-flow-intelligence
version: 1.0
---

# Mermaid Pack Skill

> Generate flowchart, swimlane, and state diagram from a finalized business-flow analysis.

---

## Outputs

- `03-generation/business-flow-mermaid.md` — combined pack with init block + 3 diagrams + commentary
- `03-generation/flowchart.mmd` — flowchart TD
- `03-generation/swimlane.mmd` — flowchart LR + subgraph per actor
- `03-generation/state-diagram.mmd` — stateDiagram-v2

---

## Steps

1. Read `02-analysis/business-flow-document.md` Sections 4 (flow), 11 (state machine).
2. Read `02-analysis/state-machine.preliminary.json`.
3. Run `state-machine-mcp.validate-and-finalize` → finalized state-machine.
4. Build node + edge sets from flow rows; assign classes per visual standards.
5. Render flowchart (TD).
6. Build swimlane: subgraph per Section 4 actor; nodes assigned to subgraphs by row's `actor`.
7. Render state diagram from finalized state machine.
8. Validate each diagram (compile check).
9. Write all four files.

---

## Class system (init block)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontFamily': 'system-ui' }}}%%
flowchart TD
classDef startEnd fill:#0f5132,stroke:#0f5132,color:#fff
classDef process fill:#cfe2ff,stroke:#0d6efd,color:#000
classDef decision fill:#fff3cd,stroke:#ffc107,color:#000
classDef exception fill:#f8d7da,stroke:#dc3545,color:#000
classDef external fill:#e2e3e5,stroke:#6c757d,color:#000
```

---

## Semantic icon tokens

Tokens of form `domain.object.state`. Validated against `assets/icon-manifest.json`. Examples:
- `commerce.cart.empty`
- `payment.charge.failed`
- `user.session.active`

Icons are emitted as Mermaid node labels with FontAwesome / Mermaid built-in icons.

---

## Hard rules

- Diagrams must compile.
- No diagram > 60 nodes (split if larger).
- Every node references a real artifact element.
- Same input → identical output (stable ordering).

---

## Used by

- agent: `mermaid-generator`
