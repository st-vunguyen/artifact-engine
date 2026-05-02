---
skill_id: strategy-composition
system: test-strategy-intelligence
version: 1.0
---

# Strategy Composition Skill

> Compose Section 4 (Testing Approach) and assemble the final 7-section document from the per-section partials.

## Steps

1. **Section 4 composition:**
   - For each Scope row, decide test_levels and test_types based on:
     - State machine reach → integration / system level
     - UI surface → e2e level
     - API surface → contract / integration level
     - Risk linkage → abuse-failure / security types
     - Performance criticality → performance type
   - Apply automation thresholds (per `rules/automation-thresholds.md`).
   - Pick tool from catalog.
   - Emit `ApproachRow`.
   - `manual_pct + auto_pct + ai_pct = 100`.
2. **Assembly:**
   - Read partials: `02-scope/general-purpose.md`, `02-scope/scope.json`, `03-approach/approach.json`, `04-risk-map/risk-mitigation.json`, `05-regression/regression-plan.json`, `06-dod/dod.json`.
   - Render the 7-section markdown using `templates/test-strategy-template.md`.
   - Render `system-overview.mmd` from system-graph + scope (in-scope green, out-of-scope red).
   - Compute frontmatter (checksum, evidence_coverage).
   - Write final files.

## Hard rules

- Same input → identical document (deterministic ordering).
- Don't lose any partial content.
- Cite evidence in narrative sections; tables already have `links_to.*`.

## Used by

- agent: `strategy-builder`
