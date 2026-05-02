# Workflow Parser

> **Module:** `core/orchestrator/workflow-engine/workflow-parser`
> **Purpose:** read YAML/JSON workflow definitions, normalize, validate, return canonical objects.

---

## 1. Interface

```ts
interface WorkflowParser {
  parseFile(path: string): WorkflowDefinition
  parseString(content: string, format: "yaml" | "json"): WorkflowDefinition
  validate(definition: WorkflowDefinition): WorkflowValidationResult
  normalize(definition: WorkflowDefinition): WorkflowDefinition
  computeChecksum(definition: WorkflowDefinition): string
}
```

---

## 2. Parsing Pipeline

```
1. Read file (UTF-8, normalize line endings)
2. Detect format (.yaml/.yml/.json)
3. Parse to in-memory object
4. Apply defaults (defaults.* are pushed into each phase)
5. Validate against workflow-contract@1.0
6. Resolve references (agents/skills/MCPs/validators/gates exist)
7. Topologically order phases by depends_on; detect cycles
8. Compute workflow_checksum (sha256 of normalized definition)
9. Return WorkflowDefinition
```

---

## 3. Normalization Steps

- Phase ids zero-padded if not already (`1-input` → rejected; must be `01-input`)
- Default phase kind inferred from declared fields
- Empty optional arrays inserted (`gates: []`, `skills: []`, etc.)
- Defaults from top-level pushed into each phase missing the override

---

## 4. Validation Errors

Each validation failure is reported with location:

```ts
type WorkflowValidationError = {
  path: string                     // YAML path, e.g., "phases[2].depends_on[0]"
  rule: string                     // e.g., "phase-id-not-found"
  detail: string
  severity: "error" | "warning"
}
```

The parser collects all errors; it does NOT stop at the first.

---

## 5. Reference Resolution

The parser checks that each referenced id exists in registries:

| Reference | Registry |
|---|---|
| `phase.agent` | agents-registry |
| `phase.skills[]` | skills-registry |
| `phase.mcp[]` | mcp-registry |
| `phase.validators[]` | validators-registry |
| `phase.gates[]` | gates-registry |
| `produces_shared[].contract` | contracts-registry |
| `consumes_shared[].contract` | contracts-registry |

Unresolved → validation error.

---

## 6. Cycle Detection

DFS over `depends_on` edges; if back-edge encountered → error with cycle nodes.

---

## 7. Defaults Application

```yaml
defaults:
  default_timeout_seconds: 900
phases:
  - id: 01-input
    # no timeout_seconds → inherits 900
  - id: 02-analysis
    timeout_seconds: 1800        # explicit override
```

After normalize: every phase has explicit `timeout_seconds`.

---

## 8. Checksum

```
checksum = sha256(canonicalize(normalized_definition))
```

`canonicalize` produces a stable byte sequence: sorted keys, no whitespace variance. Used by:
- `runtime/.../workflow.frozen.json` integrity
- Resume strategy's `workflow-changed` detection

---

## 9. Output

```ts
type WorkflowDefinition = {
  workflow_id: string
  system: string
  description: string
  inputs: Input[]
  consumes_shared: SharedRef[]
  produces_shared: SharedRef[]
  phases: Phase[]                       // normalized, fully populated
  checkpoint_after: phase_id[]
  recovery_strategies: Record<failure_kind, Strategy>
  defaults: Defaults
  checksum: string                      // computed
  source_path?: string                  // file path, for diagnostics
}
```

---

## 10. Integration

- `core/sdk/workflow-sdk` exposes the parser to authors for CI lint.
- The orchestrator's selector calls the parser at run start.

---

## 11. Boundaries

The parser does NOT:
- Run workflows
- Resolve runtime state
- Modify the source file

It is a pure read+validate+normalize step.
