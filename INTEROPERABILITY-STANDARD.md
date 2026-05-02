# INTEROPERABILITY-STANDARD.md — Cross-System Communication

> How systems collaborate without coupling. The protocol that turns `shared-artifacts/` from "a folder of files" into a versioned, contracted, observable interop layer.

---

## The three invariants

```
1.  ONE PRODUCER per shared-artifacts kind
2.  CONTRACT-VALIDATED on publish AND on consume
3.  ARTIFACTS ARE THE ONLY CHANNEL between systems
```

Violating any = architectural defect.

---

## Producer/Consumer matrix

| Artifact kind | Producer | Consumers |
|---|---|---|
| `business-flows/` | business-flow-intelligence | every other system |
| `state-machines/` | business-flow-intelligence | risk, e2e |
| `risks/` | business-flow (preliminary), risk-intelligence (enriched, overrides) | test-strategy, api, e2e, regression |
| `system-graphs/` | system-intelligence | risk, test-strategy, api, e2e, regression |
| `dependency-maps/` | system-intelligence | regression (primary), test-strategy |
| `test-strategies/` | test-strategy-intelligence | api, e2e, regression |
| `scenarios/<feature>.seed.json` | business-flow-intelligence | api, e2e |
| `scenarios/<feature>.api.json` | api-testing-intelligence | regression |
| `scenarios/<feature>.e2e.json` | e2e-intelligence | regression |
| `api-analysis/` | api-testing-intelligence | e2e, regression, reporting |
| `e2e-analysis/` | e2e-intelligence | regression, reporting |
| `regression-analysis/` | regression-intelligence | reporting |
| `traceability/` | every system | gates, verifiers, reporting |
| `verification/` | every verifier | reporting, audit |
| `reports/` | reporting-mcp (orchestrator publish) | external |

---

## Folder governance (`_index.json`)

Each `shared-artifacts/<kind>/` folder has an `_index.json`:

```json
{
  "folder": "shared-artifacts/business-flows",
  "registered_producer": "business-flow-intelligence",
  "registered_consumers": ["api-testing-intelligence", "e2e-intelligence", "test-strategy-intelligence", "risk-intelligence", "regression-intelligence"],
  "contract": "business-flow-contract@^1.0",
  "retention": { "keep_versions": 5 }
}
```

The orchestrator reads `_index.json` at startup to enforce producer uniqueness and dependency order.

---

## Versioning

- **Backward-compatible additions** → bump minor (`1.0` → `1.1`)
- **Breaking changes** → bump major (`1.x` → `2.0`)

Producers declare:
```yaml
contract: business-flow-contract@1.2
```

Consumers declare an accepted range:
```yaml
accepts: business-flow-contract@^1.0
```

If consumer's range can't satisfy producer's version → orchestrator refuses to run consumer.

---

## Handoff protocol

```
1. A's verification gate passes
2. A's orchestrator promotes runtime artifact → shared-artifacts/<...>
3. Orchestrator emits artifact.published event
4. B's input watcher (or next pipeline run) sees the new artifact
5. B's INPUT phase reads + validates frontmatter against contract
6. If contract validation fails → B emits artifact.rejected event, blocks run
7. If contract validation passes → B proceeds
```

Producer regeneration during in-flight consumer run = the consumer continues against the old version (atomicity > freshness). The next consumer run picks up the new version.

---

## Augmentation protocol

When a downstream system wants to add to an upstream artifact, do NOT modify the base. Produce a separate augmentation artifact:

```
upstream:    shared-artifacts/risks/checkout.json                (produced by business-flow)
augmented:   shared-artifacts/risks/checkout.api-augmented.json  (produced by api-testing)
```

Augmentation references the base:

```json
{
  "extends": "shared-artifacts/risks/checkout.json",
  "extends_checksum": "sha256:...",
  "additional_risks": [...]
}
```

Reporting-mcp merges base + augmentations at output time.

---

## Lifecycle events

```
shared-artifact.published
shared-artifact.versioned
shared-artifact.consumed
shared-artifact.rejected
shared-artifact.invalidated
```

All flow into `runtime/logs/<run-id>/events.jsonl` and into reporting-mcp for the cross-workflow timeline.

---

## Dependency resolution across systems

A workflow declares:
```yaml
consumes_shared:
  - { kind: business-flow, contract: "business-flow-contract@^1.0" }
```

If the artifact is missing, the orchestrator either:
- Schedules the producer first (when `auto_schedule: true`), or
- Emits `missing-input` blocker.

There are NO implicit dependencies — explicit `consumes_shared` only.

Cycles between systems are forbidden. The engine detects them at workflow registration.

---

## Stale artifact handling

When a producer re-publishes:
- Downstream artifacts marked stale (warning, not blocker)
- In-flight consumer runs continue against old version
- Next consumer run picks up new version

---

## Forbidden cross-system patterns

| Pattern | Why |
|---|---|
| `api-testing` reading `runtime/.../business-flow-checkout-.../...` | runtime is private to a run; only `shared-artifacts/` and `output/` are public |
| `business-flow` calling an `api-testing` agent | Direct calls bypass contracts |
| Two systems writing the same `shared-artifacts/<kind>/` | Producer uniqueness violated |
| Reading `output/<other-system>-packages/...` | Output is for humans, not inter-system |
| Consuming without contract version check | Silent breakage on next bump |
| Mutating an upstream shared artifact | Base is immutable; use augmentation |

---

## Enforcement

| Layer | Enforcement |
|---|---|
| Workflow load | `consumes_shared` and `produces_shared` validated against `_index.json` |
| Publish | Contract validated; producer uniqueness checked |
| Consume | Contract version range checked |
| File system | `shared-artifacts/` mode 0444 for non-producer systems |
| Validation gates | `consistency-gate` checks cross-artifact alignment |

---

## See also

- [core/shared-rules/interoperability-rules.md](core/shared-rules/interoperability-rules.md)
- [architecture/interoperability-map.md](architecture/interoperability-map.md)
- [CONTRACTS.md](CONTRACTS.md)
