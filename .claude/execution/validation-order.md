# Validation Order

> The order in which validators + gates run within a phase.

## Per-phase order

```
1. Phase agent / validators / gate runner produces files in scoped_dir
2. Orchestrator scans scoped_dir against required_outputs glob
   → if missing → blocker(missing-required-output)
3. Validators run (in declaration order):
   - artifact-validator         (frontmatter + schema + naming)
   - completeness-validator     (sections / fields / no stub language)
   - traceability-validator     (verbatim + locator + coverage)
   - consistency-validator      (cross-references + coupling)
4. Gates run (in declaration order):
   - completeness-gate
   - consistency-gate
   - traceability-gate
   - quality-depth-gate
5. Verdict aggregated; if any blocker → recovery engine
```

## Validation failures → recovery

| Failure | Strategy |
|---|---|
| missing-required-output | retry-up-to-2 (fresh) |
| schema-invalid | retry-up-to-2 (fresh) |
| coverage < 0.85 | retry-with-altered-prompt: stricter-evidence |
| verbatim-drift | retry-with-altered-prompt: literal-quoting |
| cross-reference-broken | retry-up-to-2 (fresh) |
| silent-contradiction | retry-with-altered-prompt: request-disambiguation |
| coupling-violation (e.g., risk↔seed) | retry-up-to-2 (fresh) |
| rubric-required-failed | stop-and-report |

## Verdict computation

```
all required pass + coverage ≥ 0.95         → pass
all required pass + 0.85 ≤ coverage < 0.95  → conditional-pass
any required fail OR any blocker            → fail
```

## Workflow override

Workflows MAY:
- Add gates to a phase (not remove)
- Tighten thresholds (not loosen)
- Add custom validators

## See also

- [VALIDATION-GOVERNANCE.md](../../VALIDATION-GOVERNANCE.md)
- [docs/playbooks/validation-playbook.md](../../docs/playbooks/validation-playbook.md)
