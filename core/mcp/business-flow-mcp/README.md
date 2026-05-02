# business-flow-mcp

> **MCP server.** Domain-aware helpers for business-flow analysis.

---

## Purpose

Provides domain-specific reasoning support to the `business-flow-generator` agent: domain pack resolution, semantic search across the corpus, gap-pattern matching.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `resolve-domain(corpus)` | `corpus: NormalizedCorpus` | `{ domain: DomainId, confidence: number, evidence: Evidence[] }` |
| `search(corpus, terms, scope?)` | `corpus, terms: string[], scope?: section` | `Match[]` (line ranges + excerpts) |
| `extract-actors(corpus)` | `corpus` | `Actor[]` |
| `extract-rules(corpus)` | `corpus` | `BusinessRule[]` |
| `match-gap-patterns(corpus, domain)` | `corpus, domain` | `GapCandidate[]` |
| `couple-risks-and-seeds(risks, seeds)` | `risks: Risk[], seeds: ScenarioSeed[]` | `{ uncovered: Risk[], coupled: Pair[] }` |

---

## Domain pack catalog

Loaded from `systems/business-flow-intelligence/configs/domain-pack-config.json`. 13 default domains with `gap_focus` lists that drive `match-gap-patterns`.

---

## Hard rules

- Resolve-domain emits `confidence < 0.5` → require human / agent confirmation
- Gap patterns cite domain-specific evidence
- Search is verbatim (no fuzzy matching that drifts)

---

## Used by

- agent: `business-flow-generator`
- skill: `analysis-extraction`
