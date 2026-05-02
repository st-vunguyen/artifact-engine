# Validation Playbook

> How to read gate failures + interpret verdicts.

## The 4 gates

| Gate | What it checks |
|---|---|
| `completeness-gate` | Required outputs present + populated |
| `consistency-gate` | Cross-artifact alignment, no silent contradictions |
| `traceability-gate` | Every claim cited, verbatim, coverage threshold |
| `quality-depth-gate` | Domain rubric pass |

## Verdict interpretation

```
pass             → publish allowed
conditional-pass → publish allowed; advisories logged in REPORT.md
fail             → publish refused; checkpoint + blockers
```

## When the gate fails: triage

### completeness-gate fails

```
findings: missing-required-output | missing-required-section | empty-required-field | invalid-frontmatter | empty-required-collection | stub-language-detected
```

Action: re-run the producing phase; check that the agent's prompt template includes the missing element.

### consistency-gate fails

```
findings: cross-reference-broken | silent-contradiction | coupling-violation | frontmatter-body-mismatch | cross-system-inconsistent
```

Action:
- Cross-reference broken → producer's output references something not in target artifact; producer fix
- Silent contradiction → emit Contradiction entry explicitly; do not let agent silently pick one source
- Coupling violation (e.g., risk↔seed) → producer didn't link; rerun with stricter framing

### traceability-gate fails

```
findings: TR-01 (matrix missing) | TR-02 (coverage threshold) | TR-03 (verbatim drift) | TR-04 (locator invalid) | TR-05 (uncited claim) | TR-07 (anchor unresolvable)
```

Action by drift kind:
- paraphrase → `retry-with-altered-prompt: literal-quoting`
- truncated → re-cite with longer line range
- typo → fix locator
- wrong-locator → fix locator to correct line
- not-found → emit Gap or remove claim

### quality-depth-gate fails

```
findings: rubric required item failed (e.g., bf-r-04, api-r-03)
```

Action: read the rubric item; the failure message tells you exactly which structural / coverage / coupling rule was violated.

## Coverage thresholds

```
pass             ≥ 0.95
conditional-pass 0.85 .. 0.95
fail             < 0.85
```

## Reading the trace matrix

```
shared-artifacts/traceability/<feature>.<system>.matrix.json
```

Look for `claims_unevidenced_blocking > 0` rows — those are the violations.

## Reading the verifier report

```
runtime/.../05-verification/report.md     (human)
runtime/.../05-verification/report.json   (machine)
```

Sections:
- Summary (verdict + counts)
- Failed Checks (specific rule + remediation)
- Advisory Findings (non-blocking)
- Coverage Detail
- Recommendations (Do-now / Do-next / Later)

## Recovery actions

| Failure | Recovery |
|---|---|
| Coverage < 0.85 | retry with altered prompt: stricter-evidence |
| Verbatim drift | retry with altered prompt: literal-quoting |
| Missing per-status | retry with altered prompt: explicit-per-status |
| Missing required output | retry up to 2 (fresh) |
| Coupling violation | retry up to 2 (fresh) |
| Silent contradiction | retry with altered prompt: request-disambiguation |

See [RECOVERY-POLICY.md](../../RECOVERY-POLICY.md).

## See also

- [VALIDATION-GOVERNANCE.md](../../VALIDATION-GOVERNANCE.md)
- [debugging-playbook.md](debugging-playbook.md)
- [core/shared-rules/verification-depth.md](../../core/shared-rules/verification-depth.md)
