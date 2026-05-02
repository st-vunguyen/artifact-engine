# Validation Philosophy (Vision)

> Why validation is structural, not stylistic.

## Surface vs depth

| Layer | Question | Tool |
|---|---|---|
| Surface | Does it have the right shape? | Structural validators |
| Depth | Are its claims true given the sources? | Verifier agents + verification-mcp |

Both are required. Surface-only acceptance is the most common AI-output failure mode in production.

## What "validation" really means

- **Schema conformance** — JSON shape, frontmatter, naming
- **Cross-artifact consistency** — references resolve, no silent contradictions
- **Traceability** — every claim cited verbatim, coverage threshold met
- **Quality depth** — domain rubric pass

## The 6-step verification ladder

For every claim:

```
1. OBSERVATION    — what does the artifact say?
2. INFERENCE      — what does it imply / depend on?
3. SUPPORT CHECK  — does evidence support it?
4. CONTRADICTION  — does anything elsewhere disagree?
5. ROOT-CAUSE     — if support fails, why?
6. RECOMMENDATION — what to fix, prioritized
```

Skipping = surface-only = fail.

## Verdict is mechanical

```
all required pass + coverage ≥ 0.95         → pass
all required pass + 0.85 ≤ coverage < 0.95  → conditional-pass
any required fail OR any blocker            → fail
```

No manual override. No "I think this is good enough." The verdict is computed; humans interpret.

## See also

- [execution-philosophy.md](execution-philosophy.md)
- [VALIDATION-GOVERNANCE.md](../../VALIDATION-GOVERNANCE.md)
- [core/shared-rules/verification-depth.md](../../core/shared-rules/verification-depth.md)
