# CONTRACTS.md — Artifact Contracts Index

> Every cross-boundary artifact has a typed contract. Producers MUST conform; consumers MUST validate.

---

## Workflow contracts

| Contract | Purpose | File |
|---|---|---|
| `workflow-contract@1.0` | Workflow definition shape | [core/artifact-contracts/workflow-contract.md](core/artifact-contracts/workflow-contract.md) |
| `phase-contract@1.0` | Per-phase definition | [core/artifact-contracts/workflow-contracts/phase-contract.md](core/artifact-contracts/workflow-contracts/phase-contract.md) |
| `execution-contract@1.0` | Runtime behavior of a phase | [core/artifact-contracts/workflow-contracts/execution-contract.md](core/artifact-contracts/workflow-contracts/execution-contract.md) |

## Intelligence contracts (cross-system artifacts)

| Contract | Producer | Consumers | File |
|---|---|---|---|
| `business-flow-contract@1.0` | business-flow-intelligence | every other | [core/artifact-contracts/business-flow-contract.md](core/artifact-contracts/business-flow-contract.md) |
| `system-graph-contract@1.0` | system-intelligence | risk, test-strategy, api, e2e, regression | [core/artifact-contracts/intelligence-contracts/system-graph-contract.md](core/artifact-contracts/intelligence-contracts/system-graph-contract.md) |
| `risk-contract@1.0` | risk-intelligence (BF emits preliminary) | test-strategy, api, e2e, regression | [core/artifact-contracts/risk-contract.md](core/artifact-contracts/risk-contract.md) |
| `test-strategy-contract@1.0` | test-strategy-intelligence | api, e2e, regression | [core/artifact-contracts/intelligence-contracts/test-strategy-contract.md](core/artifact-contracts/intelligence-contracts/test-strategy-contract.md) |
| `api-analysis-contract@1.0` | api-testing-intelligence | e2e, regression, reporting | [core/artifact-contracts/intelligence-contracts/api-analysis-contract.md](core/artifact-contracts/intelligence-contracts/api-analysis-contract.md) |
| `e2e-contract@1.0` | e2e-intelligence | regression, reporting | [core/artifact-contracts/intelligence-contracts/e2e-contract.md](core/artifact-contracts/intelligence-contracts/e2e-contract.md) |
| `regression-contract@1.0` | regression-intelligence | api, e2e, reporting | [core/artifact-contracts/intelligence-contracts/regression-contract.md](core/artifact-contracts/intelligence-contracts/regression-contract.md) |
| `scenario-contract@1.0` | BF (seeds), api (api scenarios), e2e (journeys) | downstream tooling | [core/artifact-contracts/scenario-contract.md](core/artifact-contracts/scenario-contract.md) |
| `traceability-contract@1.0` | every system | gates, verifiers, reporting | [core/artifact-contracts/traceability-contract.md](core/artifact-contracts/traceability-contract.md) |
| `verification-contract@1.0` | every verifier agent | orchestrator, reporting | [core/artifact-contracts/verification-contract.md](core/artifact-contracts/verification-contract.md) |

## Validation contracts (output shapes from validators / gates)

[core/artifact-contracts/validation-contracts/README.md](core/artifact-contracts/validation-contracts/README.md)

## Metadata schemas (machine-readable)

| Schema | File |
|---|---|
| Universal frontmatter | [core/artifact-contracts/metadata/artifact-metadata-schema.json](core/artifact-contracts/metadata/artifact-metadata-schema.json) |
| Execution state | [core/artifact-contracts/metadata/execution-state-schema.json](core/artifact-contracts/metadata/execution-state-schema.json) |

---

## Versioning

```
<name>-contract@<major>.<minor>
```

- Backward-compatible additions → bump minor: `1.0` → `1.1`
- Breaking changes → bump major: `1.x` → `2.0`

Producers declare the version; consumers declare a range:
```yaml
# producer
contract: business-flow-contract@1.2

# consumer
accepts: business-flow-contract@^1.0
```

If a consumer's range can't satisfy a producer's version → orchestrator refuses to run until upgraded.

---

## Hard rules

1. Every artifact in `shared-artifacts/` has frontmatter declaring its contract.
2. The orchestrator validates contract conformance at publish time.
3. The consumer validates contract version range at consume time.
4. Two systems writing to the same shared kind = forbidden (one producer per kind).
5. Augmentation artifacts (e.g., `<feature>.api-augmented.json`) are separate, not edits.

See [INTEROPERABILITY-STANDARD.md](INTEROPERABILITY-STANDARD.md) for full handoff protocol.
