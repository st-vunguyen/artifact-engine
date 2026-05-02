# Spec Clarity Review (System Rule)

> Domain rule. The quality bar an analysis must clear during extraction.

---

## 1. The Quality Bar

A flow row, decision, transition, or rule passes the clarity bar when ALL hold:

- One actor, one action per row (no comma-separated multi-actions)
- Decision is named with explicit branches (no implicit branches)
- Outcome is observable (someone or something can detect it)
- Source-line cited verbatim
- Confidence labeled (Observed / Inferred / Assumption)

If any item fails, the entry must be:
- Re-extracted from a different source location, OR
- Decomposed into multiple atomic entries, OR
- Demoted to a Gap entry (Section 10).

---

## 2. Allowed Confidence Labels

| Label | Use for |
|---|---|
| Observed | Source explicitly states the fact |
| Inferred | Logically follows from explicit statements |
| Assumption | Required to unblock output; should be confirmed |

Assumptions accumulate; the validation report (Section 17) tracks them. >25% assumption rate is a quality finding.

---

## 3. Forbidden Patterns

| Pattern | Replacement |
|---|---|
| "User does X and then Y" in one row | Two rows, S0n: X; S0n+1: Y |
| "May submit or cancel" without explicit decision | `D01: Choose X or Y` then two branches |
| "System processes payment" (vague) | `Order API → Payment Service: charge(amount)` |
| Missing evidence cite | Demote to Gap or remove |
| Assumed constants ("typically 30 days") | Cite source or label as Assumption with risk-if-wrong |

---

## 4. Decision Discipline

Every decision in Section 6 MUST have:

- `decision_id`: D01, D02, ...
- `condition`: explicit boolean / enum
- `branches`: each named, each leading to specific flow rows
- `evidence`: source line(s) describing the condition

---

## 5. Ambiguity Discipline

When source is ambiguous, options:

1. Cite both readings; emit Contradiction (§16).
2. Pick the more conservative reading; label as Inferred; cite original; record alternate as a Gap.
3. If the ambiguity is too large to choose, emit Gap with proposed clarification question (§8).

Forbidden: silently picking one reading without noting the ambiguity.

---

## 6. Trigger and Outcome Discipline

Every transition / event / step MUST have:

- A named **trigger** (event / action / time)
- A named **outcome** (state change / message / data write)

Without both, the entry is incomplete; demote to Gap.

---

## 7. Examples

### ❌ Bad
```
S03 | User | Goes through checkout flow | Web | Order placed | input/spec.md L40
```
- "Goes through checkout flow" = vague; multi-step
- No decision points
- Outcome generic

### ✅ Good
```
S03 | User | Submits cart total            | – | Web app  | Cart submitted    | input/spec.md L40-L41
S04 | Web app | Validates cart contents    | D01: items in stock? | Web app | If yes → S05; if no → S99 | input/spec.md L42-L46
S05 | User | Confirms billing address      | – | Web app  | Address recorded  | input/spec.md L48-L51
```

---

## 8. Where this rule is enforced

- `analysis-extraction` skill applies the bar per-row.
- `business-flow-verifier` agent re-checks during verification.
- `quality-depth-gate` rubric `bf-r-clarity` validates the count of vague rows.
