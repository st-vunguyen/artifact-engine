# Intent Router

> **Module:** `core/orchestrator/router/intent-router`
> **Purpose:** receive a user/system request, classify intent, hand off to the workflow-selector.

The intent router is the entry point of the orchestrator. It does not run workflows; it decides which workflow to run.

---

## 1. Inputs

```ts
type IntentRequest = {
  source: "user-cli" | "api" | "watcher" | "schedule" | "internal"
  raw: string                              // free text or structured payload
  hints?: {
    feature?: string                       // hint to narrow scope
    system?: string                        // hint to narrow which system
    workflow_id?: string                   // direct selection
    inputs?: { kind: string, path: string }[]
  }
  context?: {
    cwd?: string
    user?: string
  }
}
```

---

## 2. Outputs

```ts
type RoutedIntent = {
  intent: Intent
  candidates: WorkflowCandidate[]          // ranked
  selected: WorkflowCandidate | null
  rationale: string
  needs_disambiguation?: DisambiguationPrompt
}

type Intent =
  | "produce-business-flow"
  | "produce-api-test-pack"
  | "produce-e2e-pack"
  | "verify-existing-artifact"
  | "resume-run"
  | "list-runs"
  | "explain-blocker"
  | "unknown"

type WorkflowCandidate = {
  workflow_id: string
  system: string
  score: number                            // 0..1
  why: string
}
```

---

## 3. Classification Rules

The router classifies by:

1. **Direct match** — `hints.workflow_id` present → bypass classification, set as selected.
2. **System hint** — `hints.system` narrows to that system's workflows.
3. **Verb extraction** — common verbs map to intents:
   - "analyze," "extract," "produce business flow" → `produce-business-flow`
   - "test," "scenarios," "postman," "openapi" → `produce-api-test-pack`
   - "e2e," "playwright," "user journey," "flow test" → `produce-e2e-pack`
   - "verify," "check," "audit" → `verify-existing-artifact`
   - "resume," "continue," "pickup" → `resume-run`
4. **Input shape** — file extensions and folder hints:
   - `input/api/openapi.yaml` → API testing likely
   - `input/specs/*.docx` → business flow likely
   - `input/ui-flows/*` → e2e likely
5. **Fallback** — if no rule matches confidently, return `intent: unknown` with `needs_disambiguation`.

---

## 4. Scoring

A candidate's score is the sum of:

```
+0.50  intent matches workflow.intent_alias
+0.20  required input shapes are present in input/
+0.15  hint.system matches workflow.system
+0.10  hint.feature is consistent with workflow's input scope
+0.05  workflow has no consumes_shared dependencies blocking
```

Capped at 1.0. A score < 0.4 disqualifies the candidate.

---

## 5. Disambiguation Prompt

When multiple candidates score similarly (top two within 0.15), the router emits:

```ts
type DisambiguationPrompt = {
  question: string
  options: { workflow_id: string, label: string, why: string }[]
  default?: string
}
```

The CLI / caller surfaces this; the user picks; the router resolves.

In non-interactive contexts (e.g., CI), ambiguity is a hard failure with `intent: unknown`.

---

## 6. Resume Routing

If `intent === "resume-run"`:

1. Read `runtime/checkpoints/<run-id>/`.
2. Identify the latest checkpoint.
3. Hand off to `core/orchestrator/checkpoint-system/resume-strategy.md`.

The router does not start a new workflow for a resume; it dispatches to the resume path.

---

## 7. Verification-Only Routing

If `intent === "verify-existing-artifact"`:

1. Resolve which artifact(s) the user means (path, feature slug, or folder).
2. Pick the corresponding system's verifier workflow (`<system>-verify.workflow.json`).
3. Skip the generation phases; run only verification.

Each system MUST register a verify-only workflow.

---

## 8. Rationale Output

For every selected candidate, the router records `rationale` — a short string explaining why this candidate was chosen. Examples:

- "Direct workflow_id selection from hints."
- "Verb 'analyze' + presence of input/specs/*.md → business-flow-full-pipeline."
- "Disambiguation: user chose 'business-flow-full-pipeline' (other candidate score 0.62 vs 0.71)."

The rationale is logged to `runtime/logs/<run-id>/router.json`.

---

## 9. Error Conditions

| Condition | Result |
|---|---|
| No candidate scores ≥ 0.4 | `intent: unknown`, ask user |
| Top candidate exists but its `consumes_shared` is unsatisfied | Suggest the producer workflow first; otherwise ask |
| Hint.workflow_id doesn't exist | Hard error |
| Resume target run-id missing | Hard error |
| Watcher fired on an event the router can't classify | `intent: unknown` logged; no run started |

---

## 10. Test Vectors

The router's classification is testable. Each system contributes test vectors:

```
systems/<system>/router-test-vectors.json
[
  { "input": { "raw": "make a postman pack from openapi" }, "expected_workflow": "api-test-full-pipeline" },
  { "input": { "raw": "extract business flow from spec" }, "expected_workflow": "business-flow-full-pipeline" },
  ...
]
```

CI runs the router against vectors on every change.

---

## 11. Boundaries

The router DOES NOT:
- Modify workflows
- Validate inputs (that's the workflow load step)
- Start phases
- Make user-visible suggestions beyond candidate ranking

It only classifies and dispatches.
