# Workspace Context

> Where things live in the workspace.

## Top-level directories

```
artifact-engine/
├── architecture/          ← high-level architecture docs (kept simple)
├── core/                  ← engine kernel
├── systems/               ← 7 specialized intelligence systems
├── shared-artifacts/      ← cross-system handoffs
├── runtime/               ← active executions, checkpoints, logs
├── input/                 ← user-provided sources (immutable)
├── output/                ← finalized packages
├── docs/                  ← layered docs (vision, architecture, standards, playbooks, examples)
└── .claude/               ← agent bootstrap + commands + execution + context (this folder)
```

## When agents read

- `input/specs/<feature>/` — primary spec
- `input/api-specs/<feature>/openapi.yaml` — for api-testing
- `input/ui-specs/<feature>/`, `input/ui-flows/<feature>/` — for e2e
- `input/hld/<feature>/`, `input/lld/<feature>/` — for system-intelligence
- `input/raw-imports/changes.<id>.md` — for regression
- `input/business-documents/<feature>/`, `input/requirements/<feature>/` — additional context
- `shared-artifacts/<kind>/<feature>.<ext>` — upstream system outputs

## When agents write

- `runtime/active-executions/<run-id>/<phase-id>/` — phase-scoped, read-only outside
- Progress events → captured to `runtime/logs/<run-id>/events.jsonl` by the orchestrator

## When agents do NOT write

- `input/` — never
- `runtime/<other-run-id>/` — never (other runs are private)
- `shared-artifacts/` — only orchestrator promotes
- `output/` — only orchestrator publishes
- Other phases' `runtime/.../<other-phase>/` — never

## Resolving paths

Workflows use `{feature}` and `{run-id}` placeholders. The orchestrator resolves them at scheduling time. Agents see resolved absolute paths in their invocation context.

## See also

- [system-bootstrap.md](system-bootstrap.md)
- [.claude/context/artifact-map.md](../context/artifact-map.md)
