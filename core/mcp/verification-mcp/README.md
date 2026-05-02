# verification-mcp

> **MCP server.** Cross-source reconciliation, contradiction detection, deep-verification helpers.

---

## Purpose

The verification-mcp is what verifier agents call to do the heavy lifting: compare claims across sources, detect contradictions, classify findings, climb the 6-step verification ladder.

---

## Tools

| Tool | Args | Returns |
|---|---|---|
| `run-checks(scope, categories)` | `scope, categories: CheckCategory[]` | `CheckResult[]` |
| `contradiction-check(claims, sources)` | `claims, sources` | `Contradiction[]` |
| `classify-finding(observation)` | `Observation` | `{ class: FindingClass, root_cause, recommendation }` |
| `climb-ladder(claim, evidence)` | `{ claim, evidence }` | `{ observation, inference, support_check, contradiction_check, root_cause, recommendation }` |
| `reconcile-raw-vs-curated(raw, curated)` | `{ raw_path, curated_path }` | `{ supported: Claim[], unsupported: Claim[] }` |
| `compute-verdict(checks, blockers, coverage)` | as named | `verdict: pass \| conditional-pass \| fail` |

---

## Check categories

- `completeness` — required outputs / sections / fields
- `consistency` — cross-artifact alignment, no silent contradictions
- `traceability` — every claim cited, verbatim, coverage threshold
- `quality-depth` — domain rubric pass
- `security` — auth / secrets / scope (when applicable)
- `performance` — load profile + budget (when applicable)
- `domain` — system-specific extensions

---

## Finding classification (mandatory)

Every important finding maps to exactly one:
- `spec-gap`, `documentation-gap`, `testing-asset-issue`, `likely-target-system-issue`, `execution-blocker`, `unknown-needs-confirmation`

---

## Verdict computation (mechanical)

```
all required pass + coverage ≥ 0.95         → pass
all required pass + 0.85 ≤ coverage < 0.95  → conditional-pass
any required fail OR any blocker            → fail
```

No manual override.

---

## Used by

- every system's verifier agent
- gate: `quality-depth-gate`
- skill: `verification`
