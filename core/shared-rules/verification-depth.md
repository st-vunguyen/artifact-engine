# Verification Depth — Shared Rule

> **Applies to:** every verifier agent and every validation gate.
> **Authority:** highest. Defines the minimum depth at which the engine accepts an artifact as "verified."

This rule is the contract between "the engine declares it done" and "a careful reviewer would agree."

---

## 1. Surface vs. Depth

| Layer | Question | Tool | Speed |
|---|---|---|---|
| Surface | Does it have the right shape? | structural validators | fast |
| Depth | Are its claims actually true given the sources? | verifier agents + verification-mcp | slower |

**Both are required.** Surface-only acceptance is the most common AI-output failure mode in production. The engine refuses to ship without depth.

---

## 2. The 6-Step Verification Ladder

For every claim or claim-group, the verifier MUST climb this ladder:

```
1. OBSERVATION    — what does the artifact say? (literal)
2. INFERENCE      — what does this imply / depend on?
3. SUPPORT CHECK  — does the cited evidence actually support it?
4. CONTRADICTION CHECK — is anything elsewhere in evidence saying the opposite?
5. ROOT-CAUSE     — if support fails, why did the producer fabricate / hallucinate?
6. RECOMMENDATION — what to fix, prioritized
```

Skipping the ladder = surface-only verification = fail.

---

## 3. Required Verification Categories

Every verifier MUST run checks in these categories at minimum (cf. `verification-contract.md` §8):

1. **completeness** — required outputs exist; required sections present; required schema fields populated
2. **consistency** — no silent contradictions; cross-artifact references resolve
3. **traceability** — every claim has evidence; excerpt verbatim; coverage ≥ threshold
4. **quality-depth** — domain rubric pass (e.g., 17-section completeness, 7-dimension Postman, journey graph integrity)

Domain-relevant additions: `security`, `performance`, `domain-specific`.

---

## 4. Domain Rubrics (carried over from references)

### API testing — Postman 7-dimension rubric
1. Per-status request coverage (every operation × every documented status)
2. Naming convention (operationId-derived, predictable)
3. Response examples populated for all responses[]
4. Test scripts present (assertion blocks, not just sends)
5. Auth env vars wired correctly
6. Error triggers (negative cases) for each error response
7. Collection-level pre-request / test scripts

### Business flow — 17-section completeness
All 17 sections from `business-flow-contract.md` §3 must be present, non-empty, and self-consistent (validation report § matches reality of other sections).

### E2E — Journey graph integrity
1. Every journey has ≥1 entry node and ≥1 outcome node
2. Every step has a role-based selector or testid
3. Every assertion is anchored to expected state (URL, role+name, network, state-machine state)
4. Every fixture cited is reachable
5. Every regression journey cites a prior incident
6. Viewport coverage declared (or explicit "desktop only" with reason)

---

## 5. Cross-Source Reconciliation

When multiple sources cover the same claim:

- AGREE → consolidate; raise confidence; cite all.
- AMBIGUOUS → produce the claim with `confidence: "low"` and surface in advisory findings.
- DISAGREE → emit a **Contradiction** entry (per `business-flow-contract.md` §9). Do NOT silently pick one.

The verifier's contradiction check is:
```
for each claim with multiple sources:
  if sources disagree:
    if a Contradiction entry exists referencing this claim → pass (resolution declared)
    else → blocker: "undeclared contradiction"
```

---

## 6. Root-Cause Discipline (when a check fails)

When a verifier check fails, the verifier writes:

```ts
{
  observation: "claim X says Y",
  inference: "implies Z",
  support_check: "evidence does not support Y; nearest excerpt says W",
  contradiction_check: "no other source contradicts; W is the only relevant evidence",
  likely_root_cause:
    | "agent inferred where source was silent (gap should be declared)"
    | "agent paraphrased; source said something subtly different"
    | "agent confused two similar concepts"
    | "source itself is ambiguous (escalate to stakeholder)"
    | "agent cited wrong source line",
  recommendation: "concrete next step"
}
```

This depth distinguishes a useful verifier from a "yes/no" rubber stamp.

---

## 7. Required Output Files Gate

Every phase declares `required_outputs` in its workflow contract. The verifier MUST confirm:

- Each required path exists.
- Each required path passes its artifact-validator.
- Each required artifact's frontmatter conforms to its declared contract.

A missing required output is a hard blocker — there is no "the agent meant to write it" leniency.

---

## 8. Evidence Coverage Threshold

The verifier MUST compute evidence coverage from the traceability matrix and gate:

- coverage < 0.85 → verdict: `fail` (blocker: low coverage)
- 0.85 ≤ coverage < 0.95 → verdict: `conditional-pass` with advisory listing every unevidenced claim
- coverage ≥ 0.95 → verdict component: pass for traceability

Note: workflow contracts may raise these thresholds further. They cannot lower them.

---

## 9. Verifier Independence

The verifier agent MUST be a separate agent from the generator. It MUST:

- Not modify domain artifacts (read-only on `runtime/.../03-generation/` and `02-analysis/`).
- Not produce new artifacts in the domain shape (only its own verification report).
- Not call generation skills or generation MCP tools.

This separation is structural, not advisory. Generators that "verify their own output" tend to confirm bias.

---

## 10. Forbidden Verifier Behaviors

| Pattern | Why forbidden |
|---|---|
| "Looks plausible to me; pass." | Surface-only. |
| Approving a section because the heading is present, without inspecting content. | Cosmetic compliance. |
| Counting cited evidence without re-checking the excerpt. | Defeats verbatim check. |
| Suppressing contradictions to keep the verdict `pass`. | Worse than failing. |
| Adjusting the artifact under verification to make it pass. | Generator/verifier role-violation. |

---

## 11. Verdict Mapping

```
all required checks pass + no blockers + coverage ≥ 0.95
   → verdict: pass
all required checks pass + no blockers + coverage 0.85–0.95
   → verdict: conditional-pass
any required check fails OR any blocker
   → verdict: fail
```

The verdict computation is mechanical. Verifiers DO NOT manually choose the verdict.

---

## 12. The Reviewer's Sanity Check

A useful mental model: imagine a careful, skeptical reviewer who has 30 minutes and the source files. Could they, by sampling the artifact and chasing citations, reach the same verdict as the verifier? If the answer is "no, they'd find issues the verifier missed," the verifier was not deep enough.
