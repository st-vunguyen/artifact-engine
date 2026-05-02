# Interoperability Rules — Shared

> **Applies to:** every cross-system handoff via `shared-artifacts/`.
> **Authority:** highest. Defines the protocol that lets specialized systems collaborate without coupling.

These rules turn `shared-artifacts/` from "a folder of files" into a versioned, contracted, observable interop layer.

---

## 1. The Three Invariants

```
1.  ONE PRODUCER per shared-artifacts kind
2.  CONTRACT-VALIDATED on publish AND on consume
3.  ARTIFACTS ARE THE ONLY CHANNEL between systems
```

Violating any invariant is an architectural defect.

---

## 2. Producer Uniqueness

### R-I-01 — Each `shared-artifacts/<kind>/` folder has exactly one registered producer
Declared in the folder's `_index.json`:

```json
{
  "folder": "shared-artifacts/business-flows",
  "registered_producer": "business-flow-intelligence",
  "registered_consumers": ["api-testing-intelligence", "e2e-intelligence"],
  "contract": "business-flow-contract@^1.0",
  "retention": { "keep_versions": 5 }
}
```

Two systems writing the same kind of artifact = forbidden. If a system needs to enrich another's artifact, it produces a *different* artifact (e.g., `<feature>.api-augmented.json`) that references the base.

---

## 3. Contract Validation

### R-I-02 — On publish, the orchestrator validates frontmatter against the declared contract
Failure = no publish. The artifact stays in `runtime/`.

### R-I-03 — On consume, the consumer validates the artifact's contract version against its accepted range
Failure = consumer refuses input; emits `contract-mismatch` blocker.

### R-I-04 — Major version bumps require coordinated upgrade
A producer cannot ship `2.0` until consumers accept `^2.0`. The orchestrator detects un-accepting consumers and refuses the bump until they upgrade.

---

## 4. Channel Discipline

### R-I-05 — Systems communicate exclusively via `shared-artifacts/`
No agent calls. No memory sharing. No file access into another system's `runtime/`. No reading other systems' `output/`.

### R-I-06 — `shared-artifacts/` is read-only for non-producer systems
Permission enforced by the orchestrator at the file level (mode 0444 once published).

### R-I-07 — A consumer that "needs more context" requests a richer contract, not a side channel
If api-testing needs additional detail from business-flow, the path is: extend `business-flow-contract.md` (minor bump), update business-flow-intelligence to populate the new field, then api-testing reads it. Not a private API.

---

## 5. Versioning

### R-I-08 — Artifacts carry their producing contract version in frontmatter
```yaml
contract: business-flow-contract@1.2
```

### R-I-09 — Consumers declare an accepted range
In their workflow's `consumes_shared`:
```json
{ "kind": "business-flow", "contract": "business-flow-contract@^1.0" }
```

### R-I-10 — Old versions are kept until consumers re-run
Per `_index.json.retention.keep_versions`. The current symlink/file is `<feature>.<ext>`; older versions are `<feature>.v<N>.<ext>`.

---

## 6. Lifecycle Events

The orchestrator emits these events for `shared-artifacts/`:

| Event | When | Recorded |
|---|---|---|
| `shared-artifact.published` | new artifact written | path, contract, producer, run-id |
| `shared-artifact.versioned` | producer re-publishes | new version, prior preserved |
| `shared-artifact.consumed` | consumer reads it | consumer system, run-id |
| `shared-artifact.rejected` | consumer refused | reason (contract mismatch, frontmatter invalid) |
| `shared-artifact.invalidated` | producer regenerates → downstream marked stale | reason |

These events feed reporting-mcp and audit.

---

## 7. Dependency Resolution Across Systems

### R-I-11 — A workflow declares `consumes_shared`; the engine refuses to start without those artifacts
Or it schedules the producer first if the producer workflow is registered.

### R-I-12 — There are NO implicit dependencies
"api-testing usually runs after business-flow" is meaningless to the engine; it requires the explicit `consumes_shared` declaration.

### R-I-13 — Cycles between systems are forbidden
The producer/consumer DAG must be acyclic. The engine detects cycles at workflow registration time.

---

## 8. Stale Artifact Handling

### R-I-14 — When a producer re-publishes, downstream artifacts are marked stale
Stale = their listed input version is no longer the current. Stale-marked artifacts continue to exist (not deleted), but the orchestrator emits warnings on next consumer run.

### R-I-15 — In-flight consumer runs continue to completion against the old version
The new version takes effect from the next consumer run. Atomicity > freshness.

---

## 9. Augmentation Protocol

When a downstream system wants to add to an upstream artifact:

```
upstream:    shared-artifacts/risks/checkout.json                (produced by business-flow)
augmented:   shared-artifacts/risks/checkout.api-augmented.json  (produced by api-testing)
```

The augmentation artifact:
```json
{
  "extends": "shared-artifacts/risks/checkout.json",
  "extends_checksum": "sha256:...",
  "additional_risks": [ /* ... */ ]
}
```

Reporting-mcp merges base + all augmentations into a unified view at output time. The base is never mutated.

---

## 10. Forbidden Patterns

| Pattern | Why forbidden |
|---|---|
| Two systems writing to the same `shared-artifacts/<kind>/` | Producer uniqueness |
| Reading from another system's `runtime/` | Private to that run |
| Calling another system's agent directly | Channel discipline |
| Citing another system's `output/<package>/` as a source | Output is for humans/external; intra-engine sources are `input/` and `shared-artifacts/` |
| Publishing without contract validation | Defeats the contract |
| Consuming without version check | Silent breakage on next bump |

---

## 11. Where This Is Enforced

| Layer | Enforcement |
|---|---|
| Workflow load | `consumes_shared` and `produces_shared` validated against `_index.json` |
| Publish | Contract validated; producer uniqueness checked |
| Consume | Contract version range checked |
| File system | `shared-artifacts/` mode 0444 for non-producer systems |
| Validation gates | `core/orchestrator/validation-gates/consistency-gate.md` checks cross-artifact alignment |

---

## 12. The Underlying Principle

Specialized systems collaborate when handoffs are typed, observable, and versioned. They drift apart when handoffs are conventions, comments, or copies. The artifact engine treats interoperability as a contract, not a habit.
