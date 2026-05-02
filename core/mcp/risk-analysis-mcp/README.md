# risk-analysis-mcp

> **MCP server.** Risk discovery, severity computation, failure-mode enumeration, mitigation generation.

---

## Purpose

Risk-intelligence uses this MCP for: detecting risks from system-graph patterns, computing severity from likelihood × impact, enumerating failure modes from a catalog, generating mitigations.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `detect-{category}(graph, bf, ...)` | varies per category | `RiskCandidate[]` |
| `compute-severity(likelihood, impact)` | as named | `SeverityLevel` (deterministic matrix) |
| `failure-modes(risk)` | `Risk` | `FailureMode[]` (instantiated from catalog) |
| `propose-mitigations(risk)` | `Risk` | `Mitigation[]` (preventive + detective + corrective per severity) |
| `lint-openapi(oas)` | `OpenAPI` | `LintFinding[]` (covers schema, response, auth, naming, pagination, security definitions) |
| `compute-coverage(risks, seeds)` | `{ risks, seeds }` | `risk_to_seed_coverage: number` |

---

## Categories supported

`data-integrity | permission | auth | input-validation | concurrency | async-failure | performance | security | ux-confusion | compliance | operability | external-dependency`

Each has a dedicated `detect-{category}` heuristic.

---

## Severity matrix (canonical, hardcoded)

Implements the `risk-contract.md` matrix:

| ↓ likelihood / → impact | negligible | minor | moderate | major | catastrophic |
|---|---|---|---|---|---|
| almost-certain | low | medium | high | critical | critical |
| likely | low | medium | high | high | critical |
| possible | low | medium | medium | high | critical |
| unlikely | info | low | medium | high | high |
| rare | info | low | low | medium | high |

Manual override forbidden — agents pass likelihood + impact; MCP returns severity.

---

## Failure-mode catalog

Maintained alongside `systems/risk-intelligence/modules/failure-point-analysis/`. Adding new modes requires citation of source / precedent.

---

## Used by

- agent: `risk-detector`, `failure-mode-enumerator`, `mitigation-generator`, `api-spec-reviewer`, `risk-prioritizer`
- skill: `risk-extraction`, `api-analysis`
