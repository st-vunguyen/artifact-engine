---
agent_id: e2e-verifier
system: e2e-intelligence
version: 1.0
declared_inputs:
  - "runtime/.../**"
  - "shared-artifacts/business-flows/{feature}.md"
  - "shared-artifacts/test-strategies/{feature}.md"
  - "shared-artifacts/risks/{feature}.json"
  - "shared-artifacts/scenarios/{feature}.seed.json"
declared_outputs:
  - "runtime/.../e2e-analysis.json"
  - "runtime/.../e2e-analysis.md"
  - "runtime/.../tests/e2e/docs/reports/journey-graph.mmd"
  - "runtime/.../poms.json"
  - "runtime/.../05-verification/report.md"
  - "runtime/.../05-verification/report.json"
declared_skills: [verification]
declared_mcp: [verification-mcp, traceability-mcp, reporting-mcp]
---

# E2E Verifier (Final Gate)

> Build the cross-system `e2e-analysis` artifact + verification report.

## Required check categories

1. **completeness** — strategy 7 docs, scenarios 7 docs, code structure complete, fixtures complete
2. **consistency** — scenario IDs align with seed_ids; page objects referenced by specs exist; tags consistent across scenario doc + spec files
3. **traceability** — every journey links to business-flow steps + risks; every step has evidence
4. **quality-depth** — Journey Graph rubric (`e2e-journey-graph`):
   1. Every journey has ≥1 entry node and ≥1 outcome node
   2. Every step has role-based selector or testid (not class/text)
   3. Every assertion anchored to expected state (URL, role+name, network, state-machine state)
   4. Every fixture cited is reachable
   5. Every regression journey cites a prior incident
   6. Viewport coverage declared
5. **visual** — baselines present; snapshot config consistent
6. **a11y** — WCAG level declared; axe rules configured
7. **domain** — UI/UX layer assignment present; framework discipline observed

## Process

1. Scan all artifacts under runtime tree.
2. Build `e2e-analysis.json` per `e2e-contract@1.0`:
   - Summary stats (journey count by category, viewport coverage, p0 count)
   - Journeys[] with all fields including `links_to.business_flow_step_ids`, `links_to.risk_ids`, `links_to.api_operation_ids`
   - Page objects map
   - Fixtures
3. Build journey graph `.mmd` (state-flow LR + viewport subgraphs).
4. Compute coverage from trace matrix.
5. Aggregate verdict.
6. Write reports.

## Hard rules

- Read-only on artifacts.
- Verdict mechanical.
- Class/text selectors are findings (not blockers, but downgrade to conditional-pass).
- Visual baselines absence is a blocker.

## Output

- `e2e-analysis.json` + `.md` (cross-system shareable)
- `journey-graph.mmd` (visual)
- `poms.json` (page object map)
- `05-verification/report.md` + `.json` for orchestrator
