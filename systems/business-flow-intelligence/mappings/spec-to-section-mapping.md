# Spec → Section Mapping

> Heuristics that map source-spec phrases to their target section in the 17-section document.

## Mapping table

| Spec phrase pattern | Target section | Notes |
|---|---|---|
| "User can / shall / must / should" | §3 Flow Table; §12 Permissions | Verb determines action; modal indicates rule |
| "If X then Y" / "When X..." | §6 Decisions | Branch with condition |
| "Status / state changes from A to B" | §11 State Machine | Explicit transition |
| "On error / failure / timeout" | §6 Exceptions; §13 Async (if async) | Failure path |
| "Notification / email / webhook" | §13 Async Events | Async event candidate |
| "Admin / merchant / customer / role" | §12 Permissions | Role mention |
| "TBD / TODO / unclear / ?" | §10 Gap Taxonomy | Source-flagged gap |
| "Conflicts with / contradicts / vs prior" | §16 Contradictions | Cross-source disagreement |
| "Risk / concern / dangerous / sensitive" | §14 Risk Hotspots | Risk language |
| "Test / scenario / case" (in spec) | §15 Scenario Seeds | Pre-existing seed hint |

## Application

The `analysis-extraction` skill scans the corpus for these patterns; each match becomes a candidate entry in the corresponding section. The agent then refines / dedupes / cites each candidate.

## Why

Without explicit mapping, agents over-fit a single phrase to the wrong section. The mapping forces structural discipline.
