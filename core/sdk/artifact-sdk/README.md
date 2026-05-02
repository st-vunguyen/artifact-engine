# artifact-sdk

> **Module:** `core/sdk/artifact-sdk`
> **Purpose:** helpers for systems and agents to create, read, validate, and publish artifacts without re-implementing the contract / frontmatter / checksum logic.

The SDK is what domain agents call when they want to produce or consume an artifact. It hides the boilerplate of contract conformance.

---

## 1. Surface

```ts
namespace artifactSdk {
  function load(path: string, expected_contract?: string): LoadedArtifact
  function listShared(kind: string, contract_range?: string): SharedArtifactRef[]
  function readShared(kind: string, feature: string, contract_range: string): LoadedArtifact

  function startProducing(spec: ProduceSpec): ProductionHandle
  // ProductionHandle has: write, addClaim, addEvidence, addGap, addContradiction, addRiskMitigation, complete

  function publish(handle: ProductionHandle): PublishedArtifact
  function checksum(path: string): string
  function frontmatter(path: string): Frontmatter
}

type ProduceSpec = {
  contract: string                          // "business-flow-contract@1.0"
  feature: string
  scope: { run_id, phase_id, scoped_dir }
  template?: "blank" | "skeleton"           // skeleton pre-populates required sections empty
}

type LoadedArtifact = {
  path: string
  contract: string
  frontmatter: Frontmatter
  body: string                              // for .md
  data?: object                             // for .json
}
```

---

## 2. Why an SDK

Without the SDK, every agent and system would re-implement:

- frontmatter assembly + checksum
- evidence schema construction
- claim / gap / contradiction insertion
- contract version checking
- shared-artifact discovery

These are repetitive and error-prone. Mistakes here cause silent contract drift. The SDK centralizes them.

---

## 3. Key Operations

### `startProducing(spec)`
Initializes a new artifact in `scoped_dir/`, writes a contract-conformant skeleton (if `template: "skeleton"`), and returns a handle.

### `addClaim(handle, claim)`
Inserts a claim with required fields. The handle records:
- the claim text
- its anchor (auto-generated, stable)
- evidence list (mandatory)
- confidence

### `addEvidence(claim_handle, evidence)`
Validates Evidence shape against `traceability-contract.md`. Auto-extracts excerpt verbatim from the source file at the locator (so the agent doesn't have to type it correctly).

### `addGap(handle, gap)`
Inserts a Gap row in the artifact's gap section.

### `addContradiction(handle, contradiction)`
Inserts a Contradiction entry; the consistency-gate later requires this when sources disagree.

### `complete(handle)`
Finalizes:
- recompute checksums
- recompute evidence_coverage
- update validation report (if applicable)
- run artifact-validator inline (early-fail)
- write final file to `scoped_dir/`

### `publish(handle)`
Promotes from `runtime/` → `shared-artifacts/` (orchestrator-supervised). Only available to the orchestrator's publish phase, NOT to general agents.

---

## 4. Shared Artifact Reading

```ts
const flow = artifactSdk.readShared("business-flow", "checkout", "business-flow-contract@^1.0")
// flow.frontmatter.contract === "business-flow-contract@1.2"
// flow.body                    === parsed markdown
// flow.data                    === structured projection (state machine, scenarios, ...)
```

The SDK validates the contract version against the requested range and refuses out-of-range artifacts.

---

## 5. Source Citation Helper

```ts
const cite = artifactSdk.cite({
  source: "input/specs/checkout.md",
  line_range: [42, 47]
})
// cite.evidence: { source, line_range, excerpt: "<auto-extracted>", confidence: undefined }

artifactSdk.addClaim(handle, {
  text: "Order is created when payment succeeds.",
  evidence: [cite.evidence],
  confidence_hint: "high"
})
```

The SDK auto-fills `excerpt` from the source. The agent only chooses sources and locators.

---

## 6. Trace Matrix Generation

Every claim added through the SDK is automatically appended to the run's trace matrix. The publish step writes the matrix to `shared-artifacts/traceability/...`.

This means agents do NOT manually maintain the trace matrix — it's a side-effect of using the SDK.

---

## 7. Validation Hook

The SDK calls `artifact-validator` inline at `complete()`. If validation fails, `complete()` throws — the agent MUST fix and retry. This catches problems at write time, not at gate time.

---

## 8. Contract Versioning

The SDK enforces:
- producer's contract version matches the spec.
- consumer's accepted range is satisfied at read.

Mismatches throw early.

---

## 9. Boundaries

The SDK does NOT:
- Decide what to write (agent decides)
- Modify input/ files
- Bypass contracts
- Talk directly to other systems' agents

It is a typed wrapper around contract-conformant artifact production.

---

## 10. Implementation Note

The artifact-sdk is implemented as a small library available to agent runtimes. Skill packs in `systems/<system>/skills/` reference SDK helpers in their step definitions.

The SDK is independent of any specific LLM runtime; it's pure data.
