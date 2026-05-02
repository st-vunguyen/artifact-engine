# Artifact-Driven Intelligence (Vision)

> Why AI workflows must communicate through typed artifacts, not conversation.

## The premise

A "prompt collection" treats AI as a free-form conversational partner. Each prompt is a thread; outputs are unstructured text; downstream consumers re-parse.

The artifact engine treats AI as a process in a typed system. Each phase produces structured artifacts conforming to contracts. Downstream consumers bind to the contract, not the prose.

## What changes when artifacts are typed

| Concern | Free-form | Artifact-driven |
|---|---|---|
| Producer/consumer evolution | Tightly coupled (parsing breaks) | Independently evolvable (contract is the seam) |
| Inspection | Read prose | Query JSON |
| Validation | Manual review | Automated gates |
| Replay | Re-run prompt | Re-derive from frozen inputs |
| Diff | Free-text diff | Semantic diff |
| Caching | Impossible | Content-addressable |
| Cross-system handoff | Untyped | Contracted |

## Practical implications

1. **Every output has a contract.** Producers declare; consumers validate.
2. **Every claim has evidence.** No fabrication; gaps are first-class.
3. **Identity is content-addressable.** Same input + same agent + same producer = same artifact.
4. **Boundaries are versioned.** Producers and consumers evolve independently within a major version.

## What this enables

- A 4th system added without touching the first 3
- Replay a 6-month-old run with the same outputs
- Diff a flow's analysis between two spec versions
- Audit any claim back to a source line

## See also

- [execution-philosophy.md](execution-philosophy.md)
- [architecture/artifact-flow.md](../architecture/artifact-flow.md)
- [CONTRACTS.md](../../CONTRACTS.md)
