---
skill_id: analysis-extraction
system: business-flow-intelligence
version: 1.0
---

# Analysis Extraction Skill

> Extract the canonical 17-section business-flow document from a normalized corpus.

---

## Sub-skills (called per section)

| Section | Sub-skill |
|---|---|
| 1 Scope | `extract-scope` |
| 2 Source Inventory | `extract-sources` |
| 3 Summary | `summarize` |
| 4 Flow Table | `extract-flow-rows` |
| 5 Narrative | `compose-narrative` |
| 6 Decisions | `extract-decisions` |
| 7 Traceability | `build-trace-table` |
| 8 Open Questions | `extract-questions` |
| 9 Assumptions | `enumerate-assumptions` |
| 10 Gap Taxonomy | `detect-gaps` |
| 11 State Machine | `extract-states` |
| 12 Permissions | `extract-permissions` |
| 13 Async Events | `extract-async` |
| 14 Risk Hotspots | `enumerate-risks` |
| 15 Scenario Seeds | `seed-scenarios` |
| 16 Contradictions | `detect-contradictions` |
| 17 Validation Report | `self-assess` |

---

## Process per section

For each section:

1. Read relevant corpus regions (use `business-flow-mcp.search` with section keywords).
2. Apply the sub-skill's extraction logic.
3. For each emitted claim, call `traceability-mcp.cite` to attach evidence.
4. Validate against the section's rubric item via `rule-analysis-mcp.evaluate-rubric-item`.
5. If sub-skill cannot produce a substantive entry, emit Gap.

---

## Coupling Sub-skills

After all sections drafted, run coupling checks:

- `couple-risks-and-seeds` — every Section 14 risk severity ≥ high → ≥1 abuse-failure seed in §15
- `couple-states-and-transitions` — every transition.from / transition.to declared in §11
- `couple-actors-and-permissions` — every Section 4 actor → row in §12

---

## Inputs / Outputs

| Input | Output |
|---|---|
| `01-input/normalized/*.md` | `02-analysis/business-flow-document.md` |
| `01-input/manifest.json` | `02-analysis/permissions.json` |
| | `02-analysis/risk.json` |
| | `02-analysis/scenario-seeds.md` |
| | `02-analysis/state-machine.preliminary.json` |

---

## Hard rules

- Every claim cites evidence (line range from corpus).
- Use `executionSdk.deterministicId(...)` for ids so reruns are stable.
- Never fabricate numbers, names, or paths.
- Use Gap entries when source is silent — no "TODO".

---

## Used by

- agent: `business-flow-generator`
- modules: `actor-extractor`, `rule-extractor`, `flow-builder`, `state-machine-builder`, `critical-path-detector`
