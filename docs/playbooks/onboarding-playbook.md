# Onboarding Playbook

> First 30 minutes in the artifact-engine repo.

## Goals after this playbook

- You know what the engine is + what it isn't
- You know where things live
- You can locate the contract for any artifact kind
- You can find the workflow for any system

---

## Step 1 — Read these (≤10 min)

1. [README.md](../../README.md) — project intro
2. [CLAUDE.md](../../CLAUDE.md) → [AGENTS.md](../../AGENTS.md) — operating rules
3. [ARCHITECTURE.md](../../ARCHITECTURE.md) — layered model
4. [WORKFLOWS.md](../../WORKFLOWS.md) — pipelines
5. [docs/vision/execution-philosophy.md](../vision/execution-philosophy.md) — the mindset

## Step 2 — Tour the structure (≤10 min)

```
core/                  ← engine kernel
├── artifact-contracts/    ← what every artifact looks like
├── shared-rules/          ← what every agent obeys
├── orchestrator/          ← how work runs
├── validators/            ← what's checked
├── sdk/                   ← what agents call
└── mcp/                   ← shared capabilities

systems/               ← 7 specialized systems
├── business-flow-intelligence/  (root)
├── system-intelligence/
├── risk-intelligence/
├── test-strategy-intelligence/  (bridge)
├── api-testing-intelligence/    (executable; per-status rule)
├── e2e-intelligence/             (executable; Playwright)
└── regression-intelligence/      (cross-cutting consumer)

shared-artifacts/      ← cross-system handoffs
runtime/               ← active executions
input/                 ← user-provided sources
output/                ← finalized packages
```

## Step 3 — Trace a feature (≤10 min)

Pick one of the canonical flows and trace it through the systems:

```
input/specs/checkout/
  → business-flow-full-pipeline → shared-artifacts/business-flows/checkout.md
                                  shared-artifacts/state-machines/checkout.json
                                  shared-artifacts/risks/checkout.json
                                  shared-artifacts/scenarios/checkout.seed.json
  → system-graph-pipeline       → shared-artifacts/system-graphs/checkout.json
  → enrich-risks-pipeline       → shared-artifacts/risks/checkout.json (enriched)
  → test-strategy-pipeline      → shared-artifacts/test-strategies/checkout.md
  → api-test-full-pipeline      → output/api-qc-packages/checkout/
                                  shared-artifacts/api-analysis/checkout.json
  → e2e-full-pipeline           → output/e2e-packages/checkout/
                                  shared-artifacts/e2e-analysis/checkout.json
  → regression-analysis-pipeline (when changes arrive) → shared-artifacts/regression-analysis/checkout.json
```

## Step 4 — Common questions

**Q: "Where do I add a new agent?"**
A: `systems/<x>-intelligence/agents/<id>.agent.md` with frontmatter declaring inputs/outputs.

**Q: "Where do I find the contract for X artifact?"**
A: `core/artifact-contracts/intelligence-contracts/<kind>-contract.md`.

**Q: "How do I add a new artifact kind?"**
A: Define the contract first (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).

**Q: "Why does Phase N+1 not run?"**
A: Phase N's required outputs missing or its gates failed. Check `runtime/.../<run-id>/run.state.json`.

## Step 5 — Don't do this

- Don't generate artifacts without a contract
- Don't bypass validation gates
- Don't write to `input/`
- Don't have systems call each other directly
- Don't override verdicts manually

## Next playbooks

- [execution-playbook.md](execution-playbook.md) — how to run a workflow
- [debugging-playbook.md](debugging-playbook.md) — when things fail
- [recovery-playbook.md](recovery-playbook.md) — when to retry / resume / restart
- [validation-playbook.md](validation-playbook.md) — how to interpret gate failures
