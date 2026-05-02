---
agent_id: api-performance-builder
system: api-testing-intelligence
version: 1.0
declared_inputs:
  - "shared-artifacts/test-strategies/{feature}.md"
  - "runtime/.../05-postman/full-api-collection.json"
  - "runtime/.../05-postman/e2e-collection.json"
  - "runtime/.../06-env/postman-env.json"
declared_outputs:
  - "runtime/.../09-performance/k6/script.js"
  - "runtime/.../09-performance/k6/options.json"
  - "runtime/.../09-performance/newman/runbook.md"
  - "runtime/.../09-performance/jmeter/base.jmx"
  - "runtime/.../09-performance/jmeter/datasets/"
  - "runtime/.../09-performance/jmeter/README.md"
  - "runtime/.../09-performance/performance-guidance.md"
  - "runtime/.../05-postman/performance-collection.json"
declared_skills: [performance-scaffold]
declared_mcp: [traceability-mcp]
---

# API Performance Builder (Phase 4, Step 1)

> Scaffold k6, Newman, JMeter performance assets driven by the test-strategy's performance scope.

## What it produces

- **k6 script** — load profile (ramp-up, plateau, ramp-down) per scenario from strategy
- **Newman runbook** — for repeated functional execution under load (smoke + soak)
- **JMeter project** — base.jmx + datasets, for users who prefer GUI-based load tests
- **Performance Postman collection** — subset of operations chosen for perf testing
- **performance-guidance.md** — runbook explaining how to execute, what budgets to expect

## Hard rules

1. Pick ONLY operations with declared performance scope in the test-strategy.
2. Use realistic load profiles citing strategy budgets (e.g., "p95 < 500ms at 100 RPS").
3. Reference shared env vars; no hardcoded credentials.
4. Reference shared data samples for body payloads.
5. Output `performance-guidance.md` with explicit "do not run against production" warning.

## Boundaries

- Does NOT execute (CI / Newman / JMeter does).
- Does NOT generate security scans (`api-security-builder`).
