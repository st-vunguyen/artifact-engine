# Interoperability Map

> Which systems produce which artifacts, who consumes them, and the contracts that govern the handoff.

---

## 1. The Producer/Consumer Matrix

| Artifact | Producer | Consumers | Contract |
|---|---|---|---|
| `shared-artifacts/business-flows/<feature>.md` | business-flow-intelligence | api-testing-intelligence, e2e-intelligence | `business-flow-contract.md` |
| `shared-artifacts/state-machines/<feature>.json` | business-flow-intelligence | api-testing-intelligence, e2e-intelligence | `business-flow-contract.md` (state-machine section) |
| `shared-artifacts/state-machines/<feature>.mmd` | business-flow-intelligence | (visual; also embedded in reports) | `business-flow-contract.md` |
| `shared-artifacts/risks/<feature>.json` | business-flow-intelligence | api-testing-intelligence, e2e-intelligence | `risk-contract.md` |
| `shared-artifacts/scenarios/<feature>.seed.json` | business-flow-intelligence (seeds) | api-testing-intelligence (expand to API scenarios), e2e-intelligence (expand to journeys) | `scenario-contract.md` |
| `shared-artifacts/scenarios/<feature>.api.json` | api-testing-intelligence | (downstream tooling) | `scenario-contract.md` |
| `shared-artifacts/scenarios/<feature>.e2e.json` | e2e-intelligence | (downstream tooling) | `scenario-contract.md` |
| `shared-artifacts/verification/<feature>.report.json` | each system's verifier | reporting-mcp, final-reports | `verification-contract.md` |
| `shared-artifacts/traceability/<feature>.matrix.json` | each system | reporting-mcp, audit | `traceability-contract.md` |

---

## 2. The Canonical Flow

```
                  ┌──────────────────────────────────┐
                  │  business-flow-intelligence      │
                  │  (the foundational layer)        │
                  └──────────────┬───────────────────┘
                                 │
   produces ─────────────────────┼─────────────────────
                                 │
   ┌─────────────────┐  ┌────────▼────────┐  ┌─────────────────┐
   │ business-flow   │  │ state-machine   │  │ risks +         │
   │ .md             │  │ .json + .mmd    │  │ scenario seeds  │
   └─────────────────┘  └─────────────────┘  └─────────────────┘
            │                    │                    │
            │                    │                    │
            ├─────── consumed by ─┴────────┬───────────┤
            │                              │           │
   ┌────────▼────────────┐         ┌───────▼──────────┐
   │ api-testing-        │         │ e2e-             │
   │ intelligence        │         │ intelligence     │
   │ + input/api/        │         │ + input/ui-flows/│
   │   openapi.yaml      │         │                  │
   └──────────┬──────────┘         └────────┬─────────┘
              │                             │
              ▼                             ▼
   shared-artifacts/                shared-artifacts/
   scenarios/<f>.api.json           scenarios/<f>.e2e.json
              │                             │
              ▼                             ▼
   output/api-qc-packages/<f>/      output/e2e-packages/<f>/
```

Key invariants:

1. business-flow runs first; api-testing and e2e run after (and can run in parallel with each other).
2. api-testing and e2e never call business-flow — they only read its published artifacts.
3. api-testing and e2e never call each other.

---

## 3. Contract Versioning

Each contract has a version: `business-flow-contract@1.0`. When a contract evolves:

- **Backward-compatible additions** (new optional fields) → bump minor: `1.0` → `1.1`
- **Breaking changes** (rename, removal, type change) → bump major: `1.x` → `2.0`

Producers declare the contract version they produce. Consumers declare the range they accept:

```yaml
# producer
contract: business-flow-contract@1.2

# consumer
accepts: business-flow-contract@^1.0   # any 1.x
```

If a consumer's accepted range cannot satisfy a producer's version, the orchestrator refuses to run the consumer until either the producer downgrades the artifact or the consumer is upgraded.

---

## 4. Handoff Protocol

When System A publishes an artifact and System B is registered as a consumer:

```
1. A's verification gate passes
2. A's orchestrator promotes runtime artifact → shared-artifacts/<...>
3. Orchestrator emits artifact.published event
4. B's input watcher (or next pipeline run) sees the new artifact
5. B's INPUT phase reads the artifact + validates frontmatter against contract
6. If contract validation fails → B emits artifact.rejected event, blocks B's run
7. If contract validation passes → B proceeds with its own pipeline
```

If A regenerates the artifact (new run-id, new checksum), prior B-runs are *not* automatically rerun. B's next run will pick up the new version. This is by design — interrupting consumers mid-run would violate atomicity.

---

## 5. Multi-Producer / Multi-Consumer Cases

### Case 1 — Two systems propose conflicting updates to the same shared artifact
**Not allowed.** Each shared artifact has exactly ONE registered producer. If api-testing wants to enrich the business flow with API-derived facts, it produces a *different* artifact (`shared-artifacts/business-flows/<feature>.api-enrichment.md`) that references the original.

### Case 2 — A consumer needs an artifact that doesn't exist yet
The consumer's pipeline declares `requires: [...]` in its workflow contract. If a required artifact is absent, the orchestrator either:
- Schedules the producer first (if known), or
- Emits a `missing-input` blocker and stops.

### Case 3 — A producer updates an artifact while consumers are running
The orchestrator tracks "in-flight reads." A producer update during an in-flight read marks the consumer's run as "stale-input"; the consumer completes its current run, then the next run picks up the new version.

---

## 6. Shared Artifact Governance

Each shared artifact subfolder has an `_index.json`:

```json
{
  "folder": "shared-artifacts/business-flows",
  "registered_producer": "business-flow-intelligence",
  "registered_consumers": ["api-testing-intelligence", "e2e-intelligence"],
  "contract": "business-flow-contract@^1.0",
  "retention": { "keep_versions": 5 }
}
```

The orchestrator reads `_index.json` at startup to enforce producer uniqueness and to plan dependency order across systems.

---

## 7. Inputs vs Shared-Artifacts (don't confuse them)

```
input/         ← user-provided sources of truth (specs, OpenAPI, UI docs)
                 IMMUTABLE, hand-authored, not produced by the engine
shared-artifacts/  ← engine-produced cross-system handoffs
                 PRODUCED by some system, CONSUMED by another
                 always typed with a contract
```

If an artifact is hand-authored and never modified by the engine, it goes in `input/`. If it's engine-produced and crosses a system boundary, it goes in `shared-artifacts/`.

---

## 8. The Orchestrator's Role at the Boundary

The orchestrator owns the shared-artifacts/ namespace. Specifically it:

1. Validates contract conformance on publish.
2. Maintains the `_index.json` registry per folder.
3. Versions artifacts on regeneration.
4. Emits lifecycle events (`artifact.published`, `artifact.consumed`, etc.).
5. Refuses publish if contract validation fails (the artifact stays in `runtime/`, never reaches `shared-artifacts/`).
6. Refuses consume if the consumer's accepted range doesn't match the artifact's version.

Domain systems do not write directly to `shared-artifacts/`. They produce in `runtime/` and request a publish; the orchestrator performs the actual write.

---

## 9. Forbidden Cross-System Patterns

| Pattern | Why forbidden |
|---|---|
| `api-testing-intelligence` reading `runtime/.../business-flow-checkout-.../...` | runtime is private to a run; only `shared-artifacts/` and `output/` are public |
| `business-flow` calling an `api-testing` agent | direct calls bypass contracts |
| Two systems writing to the same `shared-artifacts/<folder>` | non-unique producer; conflict resolution is undefined |
| A system reading `output/<other-system>-packages/...` | output is for humans / external tools, not for inter-system data |
| A consumer reading shared-artifacts without verifying frontmatter contract | silent contract mismatch later |

The interoperability validator (`core/orchestrator/validation-gates/consistency-gate.md`) detects and blocks these.

---

## 10. Future Cross-System Pairs (not in v1, but designed-for)

| Future system | Reads | Produces | Why |
|---|---|---|---|
| `performance-intelligence` | business-flow + api-testing scenarios | `shared-artifacts/performance/` | derive load profiles from real flows |
| `security-intelligence` | OpenAPI + business-flow | `shared-artifacts/security/threats.json` | threat model from flow + spec |
| `accessibility-intelligence` | UI flows + business-flow | `shared-artifacts/a11y/` | a11y test plans from journeys |

The contracts and orchestrator already accommodate these — they only need a new entry in the producer/consumer matrix.
