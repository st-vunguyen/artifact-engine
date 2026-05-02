# Verification Contract

> **Contract ID:** `verification-contract@1.0`
> **Producer:** every system's verifier agent
> **Consumers:** orchestrator (validation-gates), reporting-mcp, audit

The verification artifact is the structured output of a *verifier agent* — the second-pass evidence-reconciling check that runs after generation and validation. It records what was checked, how, with what depth, and what blockers (if any) remain.

---

## 1. Artifact Location

```
shared-artifacts/verification/<feature>.<system>.report.json
shared-artifacts/verification/<feature>.<system>.report.md   # human-readable
```

Example:

```
shared-artifacts/verification/checkout.business-flow.report.json
shared-artifacts/verification/checkout.api-testing.report.json
```

---

## 2. Frontmatter (`.json`)

```json
{
  "contract": "verification-contract@1.0",
  "verifier": "<agent-id>",
  "system": "business-flow-intelligence | api-testing-intelligence | e2e-intelligence",
  "feature": "<feature-slug>",
  "run_id": "<run-id>",
  "started_at": "<ISO-8601>",
  "finished_at": "<ISO-8601>",
  "checksum": "sha256:<hex>",
  "verdict": "pass | conditional-pass | fail",
  "summary": { /* see §4 */ },
  "checks": [ /* see §5 */ ],
  "blockers": [ /* see §6 */ ],
  "advisory_findings": [ /* see §7 */ ]
}
```

---

## 3. Verdict Semantics

| Verdict | Meaning | Engine action |
|---|---|---|
| `pass` | All required checks passed; no blockers | Allow promotion to `output/` and `shared-artifacts/` |
| `conditional-pass` | All required checks passed; advisory findings exist | Allow promotion; surface findings in REPORT.md |
| `fail` | ≥1 required check failed OR ≥1 blocker exists | Refuse promotion; checkpoint; report blockers |

The engine treats `conditional-pass` as success but visible. `fail` is hard stop.

---

## 4. Summary

```ts
type Summary = {
  checks_total: number
  checks_passed: number
  checks_failed: number
  checks_skipped: number
  blockers: number
  advisory_findings: number
  evidence_coverage: number              // 0..1, fraction of generated claims with cited evidence
  contradictions_outstanding: number
  gaps_outstanding: number
  duration_seconds: number
}
```

---

## 5. Check Schema

```ts
type Check = {
  check_id: string                       // unique within report
  name: string                           // human label
  category: "completeness" | "consistency" | "traceability" | "quality-depth" | "security" | "performance" | "domain"
  severity_if_fail: "info" | "minor" | "major" | "critical"
  status: "pass" | "fail" | "skipped"
  rule_ref?: string                      // path to the rule in core/shared-rules or system rules
  contract_ref?: string                  // path to relevant artifact-contract
  examined: string[]                     // file paths or section ids examined
  evidence: Evidence[]                   // for the verdict itself
  detail: string                         // 1–3 sentences explaining the result
  remediation?: string                   // if fail or advisory: what to fix
}
```

---

## 6. Blocker Schema

A *blocker* is a condition that must be resolved before the artifact can be promoted. Example: a missing required output file, a contradiction left unresolved, a section absent.

```ts
type Blocker = {
  blocker_id: string
  reason: string
  rule_ref: string
  affected_artifacts: string[]           // paths
  remediation: string
  raised_by_check: string                // check_id from §5
}
```

The engine MUST NOT promote the artifact if `blockers.length > 0`.

---

## 7. Advisory Finding Schema

An advisory finding is non-blocking but worth reporting (e.g., low evidence coverage in a low-impact section, optional rule violation).

```ts
type AdvisoryFinding = {
  finding_id: string
  category: string
  detail: string
  evidence: Evidence[]
  recommendation: string
}
```

---

## 8. Required Check Categories (per system)

Every verifier MUST run checks in these categories at minimum:

| Category | Universal? | Examples |
|---|:---:|---|
| completeness | ✓ | Required outputs exist; required sections present |
| consistency | ✓ | No silent contradictions; cross-artifact alignment |
| traceability | ✓ | Every claim has evidence with line range |
| quality-depth | ✓ | Domain rubric (17 sections / 7 dimensions / journey graph integrity) |
| security |   | If domain involves auth/data-sensitive flows |
| performance |   | If domain has performance-critical paths |
| domain |   | System-specific extensions |

---

## 9. Markdown Twin (`.md`)

Every `.json` MUST have a parallel `.md` with the same data, human-readable. The `.md` MUST contain:

- One-line verdict at the top
- Executive summary (table from §4)
- Section per check category (status, count, top failures)
- Blockers section (with remediation)
- Advisory findings section
- Appendix linking to evidence

The reporting-mcp generates the `.md` from the `.json`, but a verifier may write the `.md` directly if it explicitly notes "json-derived: false."

---

## 10. Hard Rules

1. `verdict` MUST be derivable from `summary.checks_failed` and `blockers.length`. Manual override is forbidden.
2. Every failed check MUST have a `remediation`.
3. Every blocker MUST link to a `raised_by_check`.
4. `evidence_coverage` is computed across all artifacts produced by the run, not just the verifier's own examination.
5. The verifier MUST NOT generate or modify domain artifacts. It only reads and reports.

---

## 11. Validators

| Validator | Checks |
|---|---|
| `artifact-validator` | frontmatter + JSON schema |
| `consistency-validator` | verdict ↔ counts coherent |
| `completeness-validator` | required check categories present |

---

## 12. Versioning

- 1.0 — initial.
- 1.x — adding optional fields (e.g., `evidence_coverage_per_section`).
- 2.0 — changing verdict enum or required check categories.
