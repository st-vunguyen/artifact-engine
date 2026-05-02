# CONTRIBUTING.md — Artifact Engine

> How to extend the engine without breaking it.

---

## Read first

Before any non-trivial PR:

1. [ARCHITECTURE.md](ARCHITECTURE.md)
2. [CLAUDE.md](CLAUDE.md) (or [AGENTS.md](AGENTS.md))
3. The relevant contract in [`core/artifact-contracts/`](core/artifact-contracts/)
4. The relevant shared rule in [`core/shared-rules/`](core/shared-rules/)

---

## Layer-aware contributions

| You're adding... | Where it goes | What you must update |
|---|---|---|
| New artifact kind | `core/artifact-contracts/intelligence-contracts/<kind>.md` | [CONTRACTS.md](CONTRACTS.md), `_index.json` for the shared folder, validators |
| New universal rule | `core/shared-rules/<rule>.md` | All systems must align (no contradictions) |
| New domain rule | `systems/<x>/rules/<rule>.md` | Reference shared-rules; don't contradict |
| New agent | `systems/<x>/agents/<id>.agent.md` | Frontmatter declares `declared_inputs/outputs/skills/mcp` |
| New skill | `systems/<x>/skills/<id>/SKILL.md` | Frontmatter declares `skill_id` + version |
| New MCP server | `core/mcp/<name>-mcp/` (README + tools/schemas/validators/outputs) | Register in workflow tooling |
| New workflow | `systems/<x>/pipelines/<id>.workflow.yaml` (+ `<id>.md`) | Conform to `workflow-contract` |
| New module | `systems/<x>/modules/<name>/README.md` | Brief spec; used-by references |

---

## Discipline checklist (per PR)

- [ ] No `runtime/`, `output/`, `shared-artifacts/<feature>` files committed (those are runtime artifacts)
- [ ] No real secrets in `.env.example` / templates
- [ ] No emoji in artifacts (status icons in REPORT.md OK)
- [ ] No marketing language ("seamless", "robust")
- [ ] All claims in docs cite their source (spec, contract, rule)
- [ ] Cross-references resolve (no broken links)
- [ ] Naming conforms to [core/shared-rules/naming-conventions.md](core/shared-rules/naming-conventions.md)

---

## Contract evolution

| Change | Version bump |
|---|---|
| Add optional field | minor |
| Add enum value | minor |
| Add new section to a markdown contract | minor |
| Rename / remove field | major |
| Restructure section ordering | major |
| Tighten validation rule (existing artifacts may now fail) | major |

When bumping major:
1. Update contract file with new version
2. Update CONTRACTS.md
3. Migration note in `docs/standards/<contract>-migration.md`
4. All consumer workflows update their `accepts:` range

---

## Adding a new system

1. Create `systems/<name>-intelligence/` mirroring an existing system's shape
2. Define one or more intelligence contracts (`core/artifact-contracts/intelligence-contracts/<name>-contract.md`)
3. Update [INTEROPERABILITY-STANDARD.md](INTEROPERABILITY-STANDARD.md) producer/consumer matrix
4. Update [WORKFLOWS.md](WORKFLOWS.md) chained pipeline
5. Update [ROADMAP.md](ROADMAP.md)
6. Add `_index.json` entries for new shared-artifacts kinds

---

## Testing

- **Workflow lint** — `pnpm run lint:workflows` validates every `.workflow.yaml` against `workflow-contract`
- **Contract validation** — `pnpm run lint:contracts` validates contract files
- **Agent frontmatter** — `pnpm run lint:agents` validates declared_inputs/outputs match referenced contracts
- **Cross-link validation** — `pnpm run lint:docs` checks markdown link integrity

(These commands are designed-for; the v0.1 release is design-only.)

---

## Commit style

```
<scope>: <imperative summary>

<body explaining why, not what>

Refs: <issue/contract/rule>
```

Examples:
- `core/artifact-contracts: bump test-strategy-contract to 1.1`
- `systems/api-testing: add coverage-state validator for per-status rule`
- `docs: clarify validation-governance verdict computation`

---

## Forbidden in PRs

- `--force` flags
- Disabling gates / validators / hooks
- Skipping shared rules "for this case"
- Auto-formatting that changes semantic content
- Dependency upgrades bundled with feature work

---

## See also

- [docs/playbooks/onboarding-playbook.md](docs/playbooks/onboarding-playbook.md)
- [docs/standards/](docs/standards/)
