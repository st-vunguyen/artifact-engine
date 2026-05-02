# Execution Philosophy

> The way the engine **thinks** about doing work. This is upstream of any code; it is the discipline every system must obey.

---

## 1. The Five Pillars

```
1.  EVIDENCE-DRIVEN     ─ no claim without a source
2.  PHASE-GATED         ─ no Phase N+1 until Phase N is verified
3.  ARTIFACT-NATIVE     ─ communication happens through typed artifacts, not chatter
4.  RECOVERABLE         ─ every step writes a checkpoint; resume is first-class
5.  VERIFICATION-DEEP   ─ surface-level "looks plausible" is not done
```

If a workflow violates any pillar, it is not "fast" — it is broken.

---

## 2. The Universal Execution Model

Every workflow — regardless of domain — follows the same shape:

```
INPUT
  ↓ normalize
ANALYSIS
  ↓ extract structured model
GENERATION
  ↓ produce artifacts
VALIDATION              ← gate
  ↓
VERIFICATION            ← gate (deeper, evidence-reconciling)
  ↓
FINAL OUTPUT
  ↓ checkpoint + report
```

This shape is enforced by `core/orchestrator/execution-engine/`. Domain systems plug their phase logic in but cannot reorder, skip, or bypass these stages.

### Stage definitions

| Stage | Purpose | Output | Gate before exit |
|---|---|---|---|
| INPUT | Receive raw sources, normalize encoding, line-number for citation | `runtime/active-executions/<run>/01-input/` | Source manifest exists, checksums recorded |
| ANALYSIS | Extract a typed model (business flow, OAS snapshot, journey graph) | `runtime/.../02-analysis/` + structured artifact | Model matches its contract |
| GENERATION | Produce domain deliverables from the model | `runtime/.../03-generation/` | Artifacts conform to their contracts |
| VALIDATION | Schema, structural, and rule validation | validation report | All artifacts pass; no required output missing |
| VERIFICATION | Cross-source evidence reconciliation, contradiction detection, depth checking | verification report | All evidence claims supported; no unresolved contradictions |
| FINAL OUTPUT | Promote artifacts to `output/<package>/`, write final report | `output/<package>/` | Package signed (manifest + index) |

---

## 3. Evidence-Driven Generation

A "claim" is any fact written into an artifact. Examples of claims:

- "Endpoint X returns 422 on invalid email."
- "User can transition from `pending` to `cancelled`."
- "Field `total` must equal sum of `lineItems[].subtotal`."

Every claim must be backed by:

```
{ claim, evidence: [ { source_file, line_range, excerpt, confidence } ] }
```

If evidence is missing, the engine MUST emit a **gap item**, not a fabricated claim:

```
{ kind: "gap", topic, why_unknown, what_to_ask, severity }
```

> **Rule:** "Plausible-looking output without evidence" is the highest-severity defect this system can produce. The engine is biased toward producing fewer claims with strong evidence over more claims with weak evidence.

---

## 4. Phase Gating

Each phase publishes a **required output set**. The phase is not "complete" until:

1. Every required file exists.
2. Every required file passes its contract validator.
3. The phase verification gate passes.

The orchestrator refuses to advance past a failing gate. There is no `--force-skip-validation` flag. If a phase cannot pass its gate, the engine writes a checkpoint, reports the blocker, and stops.

This matches the discipline already enforced in the reference systems' `00-run-phase-N.prompt.md` files: each phase declares "Required Outputs" and the next phase refuses to start without them.

---

## 5. Artifact-Native Communication

Domain systems do not call each other's agents, share memory, or pass strings around. They communicate through artifacts:

```
business-flow-intelligence
   ↓ writes
shared-artifacts/business-flows/<feature>.md  (conforms to business-flow-contract.md)
   ↑ reads
api-testing-intelligence    e2e-intelligence
```

Benefits:

- Evolve either side independently as long as the contract holds
- Inspect the handoff (it's a file)
- Replay/resume across system boundaries
- Diff to detect regressions

A direct cross-system call is an architectural violation.

---

## 6. Recoverable Execution

The engine treats interruption as normal, not exceptional.

- Every phase boundary writes a checkpoint to `runtime/checkpoints/<run-id>/`.
- A checkpoint contains: phase index, completed artifacts hash list, validation results, next-phase plan.
- Resume reads the latest checkpoint and continues from the next pending phase.
- Partial failure → recovery system selects strategy (retry, partial recover, escalate to user).

> **Implication for agents:** every step must be idempotent. Re-running a phase with the same input must produce a semantically equivalent output. No hidden state.

---

## 7. Verification Depth

Validation answers: "Does the artifact conform to its shape?"
Verification answers: "Are the artifact's claims actually true given the evidence?"

The engine demands BOTH. Reference patterns from existing systems show the depth required:

- **API testing** — 7-dimension Postman quality checklist; raw report vs curated reconciliation; per-status coverage.
- **Business flow** — 17-section completeness; every flow row has source citation; every Mermaid node grounded.

Verification is performed by:

1. **Validation gates** in `core/orchestrator/validation-gates/` — automated, fast, blocking.
2. **Verifier agents** in each system — deeper reasoning, cross-source reconciliation, gap surfacing.

Both must pass before FINAL OUTPUT.

---

## 8. The "Three Audiences" Test

Every artifact must satisfy three readers:

1. **The next phase** — does it contain everything needed downstream?
2. **A reviewing human** — can they verify any claim by following its evidence trail?
3. **A future replay** — could the engine reconstruct this output from the checkpoint?

If any of the three fails, the artifact is not done.

---

## 9. What "Done" Means

A workflow is "done" only when:

- ☑ All phases completed
- ☑ All validation gates passed
- ☑ All verification gates passed
- ☑ Final output package written to `output/`
- ☑ Manifest signed (file list + checksums + run-id + agent versions)
- ☑ Report contains: artifacts produced, gaps surfaced, contradictions resolved, evidence coverage %

A workflow that produced "all the files" but skipped a gate is **not done**. It's a broken run that happened to terminate.

---

## 10. Anti-Patterns the Philosophy Rejects

| Anti-pattern | Why it's banned |
|---|---|
| "Generate first, verify later" | Verification finds problems too late; rework is expensive. |
| "If unsure, make a reasonable guess" | A guess that looks confident is worse than a labeled gap. |
| "Skip the verifier for this run, we're in a hurry" | Verifier is the gate. Skipping = not done. |
| "Re-run the whole pipeline if anything fails" | Wastes work; checkpoint + recovery exists for this. |
| "Pass data between agents in conversation" | Untyped, unobservable, irreproducible. Use artifacts. |
| "Trust the orchestrator's plan; don't validate inputs" | The orchestrator validates structure; agents validate semantics. Both, always. |

---

## 11. The Default Stance

When in doubt, the engine prefers:

- **Less output, more confidence** over more output, less confidence
- **Surfacing a gap** over filling it with plausible-looking content
- **Stopping at a failed gate** over forcing through with caveats
- **Asking for missing evidence** over inferring it
- **Writing a checkpoint** over holding state in memory

This stance is intentional. AI workflows fail by being too eager, never by being too disciplined.
