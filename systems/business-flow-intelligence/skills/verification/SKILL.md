---
skill_id: verification
system: business-flow-intelligence
version: 1.0
---

# Verification Skill

> Independent second-pass verification of the business-flow analysis + mermaid pack.

---

## Steps

1. Load:
   - `02-analysis/business-flow-document.md`
   - `02-analysis/permissions.json`
   - `02-analysis/risk.json`
   - `02-analysis/scenario-seeds.md`
   - `03-generation/state-machine.json`
   - `03-generation/*.mmd`
   - `04-traceability/<feature>.matrix.json` (if present)
   - `01-input/normalized/*.md`
2. Run check categories:
   - **completeness** — 17 sections present + non-stub
   - **consistency** — risk↔seed, state↔transition, actor↔permission, mermaid↔structured
   - **traceability** — every claim cited verbatim; coverage ≥ threshold
   - **quality-depth** — `bf-17-section` rubric items
   - **domain** — domain-pack-specific checks
3. Aggregate findings into `verification-contract@1.0` shape.
4. Compute verdict:
   - `pass` if all required checks pass + coverage ≥ 0.95
   - `conditional-pass` if 0.85 ≤ coverage < 0.95
   - `fail` if any required check fails or any blocker
5. Write `report.md` (human) and `report.json` (machine).

---

## Hard rules

- Read-only on artifacts.
- Use only `verification-mcp` and `traceability-mcp` (no generation MCPs).
- Verdict is mechanical (computed from counts).

---

## Used by

- agent: `business-flow-verifier`
