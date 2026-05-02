# Workflow Definition

> **Module:** `core/orchestrator/workflow-engine/workflow-definition`
> **Purpose:** the canonical YAML/JSON shape that describes a workflow declaratively.

A workflow is data, not code. It declares phases, dependencies, gates, and recovery — never imperative logic. The workflow-engine reads the definition and dispatches to the execution-engine.

This complements `core/artifact-contracts/workflow-contract.md` (which is the typed contract). This file is the **author-facing** reference.

---

## 1. File Format

Workflows live in `systems/<system>/pipelines/<workflow>.workflow.yaml` (preferred) or `.workflow.json`. Both are equivalent; YAML is the human-friendly source of truth.

---

## 2. Top-Level Structure

```yaml
workflow_id: business-flow-full-pipeline@1.0
system: business-flow-intelligence
description: "Spec → 17-section analysis → Mermaid pack → verification → output"

defaults:
  default_timeout_seconds: 900
  hard_timeout_seconds: 7200
  max_total_retries: 6

inputs:
  - name: spec_corpus
    kind: directory
    path: input/specs/
    required: true
    validator: spec-corpus-validator
  - name: requirements
    kind: directory
    path: input/requirements/
    required: false
  - name: hld
    kind: directory
    path: input/hld/
    required: false

consumes_shared: []

produces_shared:
  - kind: business-flow
    path_template: shared-artifacts/business-flows/{feature}.md
    contract: business-flow-contract@^1.0
  - kind: state-machine
    path_template: shared-artifacts/state-machines/{feature}.json
    contract: business-flow-contract@^1.0
  - kind: risks
    path_template: shared-artifacts/risks/{feature}.json
    contract: risk-contract@^1.0
  - kind: scenario-seeds
    path_template: shared-artifacts/scenarios/{feature}.seed.json
    contract: scenario-contract@^1.0

phases:
  - id: 01-input
    name: "Source Intake"
    agent: spec-analyzer
    skills: [spec-intake]
    mcp: [spec-parser-mcp]
    required_outputs:
      - "01-input/normalized/*.md"
      - "01-input/manifest.json"
    gates: [completeness-gate]

  - id: 02-analysis
    name: "17-Section Analysis"
    agent: business-flow-generator
    skills: [analysis-extraction]
    mcp: [traceability-mcp, rule-analysis-mcp, business-flow-mcp]
    required_outputs:
      - "02-analysis/business-flow-document.md"
      - "02-analysis/permissions.json"
      - "02-analysis/risk.json"
      - "02-analysis/scenario-seeds.md"
    depends_on: [01-input]
    gates: [completeness-gate, traceability-gate]

  - id: 03-generation
    name: "Mermaid Pack"
    agent: mermaid-generator
    skills: [mermaid-pack]
    mcp: [state-machine-mcp]
    required_outputs:
      - "03-generation/business-flow-mermaid.md"
      - "03-generation/flowchart.mmd"
      - "03-generation/swimlane.mmd"
      - "03-generation/state-diagram.mmd"
    depends_on: [02-analysis]
    gates: [completeness-gate, consistency-gate]

  - id: 04-validation
    name: "Schema + Rule Validation"
    validators: [artifact-validator, consistency-validator, completeness-validator]
    depends_on: [02-analysis, 03-generation]
    required_outputs: []
    gates: [consistency-gate, quality-depth-gate]

  - id: 05-verification
    name: "Evidence Reconciliation"
    agent: business-flow-verifier
    mcp: [verification-mcp, traceability-mcp]
    required_outputs:
      - "05-verification/report.md"
      - "05-verification/report.json"
    depends_on: [04-validation]
    gates: [traceability-gate, quality-depth-gate]

  - id: 06-publish
    name: "Promote to Shared + Output"
    actor: orchestrator
    depends_on: [05-verification]
    required_outputs: []

checkpoint_after:
  - 02-analysis
  - 03-generation
  - 05-verification

recovery_strategies:
  agent_error:
    kind: retry-up-to-n
    n: 2
  agent_timeout:
    kind: retry-up-to-n
    n: 1
  validation_failed:
    kind: stop-and-report
  gate_failed:
    kind: stop-and-report
  mcp_unavailable:
    kind: retry-with-backoff
    max: 3
    base_seconds: 10
  agent_low_coverage:
    kind: retry-with-altered-prompt
    n: 2
    alteration:
      kind: stricter-evidence
```

---

## 3. Phase Definition

See `core/artifact-contracts/workflow-contracts/phase-contract.md` for full phase schema.

---

## 4. Defaults Override

Each phase MAY override:
- `timeout_seconds`
- `max_retries`
- `recovery_strategies` (per-failure-kind)
- `checkpoint_after` (boolean override)

---

## 5. Validation

The workflow-sdk validates against `workflow-contract.md` at load time:
- Schema conformance
- DAG cycle detection
- Reference resolution (agents, skills, MCPs, validators, gates exist)
- Required outputs glob well-formedness
- consumes_shared / produces_shared kinds known
- recovery_strategies are valid combinations

Failing → workflow refused at registration; orchestrator does not start it.

---

## 6. Loading

The workflow-parser (in this same folder) reads YAML/JSON, normalizes, validates, and produces a `WorkflowDefinition` consumable by the execution-engine.

---

## 7. Versioning

- Bump `@<minor>` for backward-compatible additions.
- Bump `@<major>` for breaking changes.
- Multiple versions of the same workflow may coexist; the router picks based on hints / latest.
