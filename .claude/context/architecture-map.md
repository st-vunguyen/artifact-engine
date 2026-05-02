# Architecture Map

> One-page reference Claude binds at start of every session.

```
artifact-engine/
│
├── ROOT GOVERNANCE
│   ├── README.md                    # project intro
│   ├── CLAUDE.md → AGENTS.md        # agent operating manual
│   ├── ARCHITECTURE.md              # layered model
│   ├── WORKFLOWS.md                 # pipelines + chained execution
│   ├── PIPELINES.md                 # per-system workflow index
│   ├── CONTRACTS.md                 # all artifact contracts
│   ├── EXECUTION-LIFECYCLE.md       # run state machine
│   ├── VALIDATION-GOVERNANCE.md     # gates + verifiers
│   ├── RECOVERY-POLICY.md           # failure handling
│   ├── INTEROPERABILITY-STANDARD.md # cross-system protocol
│   ├── ROADMAP.md                   # future
│   └── CONTRIBUTING.md              # how to extend
│
├── core/                            # ENGINE KERNEL
│   ├── artifact-contracts/          # typed shapes
│   │   ├── workflow-contract.md
│   │   ├── workflow-contracts/{phase, execution}-contract
│   │   ├── intelligence-contracts/{system-graph, test-strategy, api-analysis, e2e, regression}-contract
│   │   ├── business-flow-contract.md
│   │   ├── risk-contract.md
│   │   ├── scenario-contract.md
│   │   ├── verification-contract.md
│   │   ├── traceability-contract.md
│   │   ├── validation-contracts/
│   │   └── metadata/{artifact-metadata, execution-state}-schema.json
│   ├── shared-rules/                # universal discipline
│   │   ├── evidence-and-traceability.md
│   │   ├── verification-depth.md
│   │   ├── artifact-quality-rules.md
│   │   ├── execution-rules.md
│   │   ├── naming-conventions.md
│   │   └── interoperability-rules.md
│   ├── orchestrator/
│   │   ├── router/{intent-router, workflow-selector, execution-mapping}
│   │   ├── execution-engine/{phase-runner, execution-lifecycle, retry-engine, execution-state-manager}
│   │   ├── workflow-engine/{workflow-definition, workflow-parser, workflow-executor, workflow-state-machine}
│   │   ├── checkpoint-system/{checkpoint-format, checkpoint-manager, resume-strategy}
│   │   ├── recovery-system/{recovery-engine, partial-recovery, failure-strategies}
│   │   └── validation-gates/{completeness, consistency, traceability, quality-depth}-gate
│   ├── validators/{artifact, consistency, traceability, completeness}-validator
│   ├── sdk/{artifact, workflow, validation, execution, reporting}-sdk
│   └── mcp/
│       ├── spec-parser-mcp
│       ├── business-flow-mcp
│       ├── traceability-mcp
│       ├── verification-mcp
│       ├── reporting-mcp
│       ├── state-machine-mcp
│       ├── dependency-analysis-mcp
│       ├── risk-analysis-mcp
│       ├── regression-analysis-mcp
│       ├── rule-analysis-mcp
│       └── artifact-analysis-mcp
│
├── systems/                         # 7 SPECIALIZED SYSTEMS
│   ├── business-flow-intelligence/
│   ├── system-intelligence/
│   ├── risk-intelligence/
│   ├── test-strategy-intelligence/
│   ├── api-testing-intelligence/
│   ├── e2e-intelligence/
│   └── regression-intelligence/
│
├── shared-artifacts/                # cross-system handoffs
│   ├── business-flows/, state-machines/, risks/, scenarios/
│   ├── system-graphs/, dependency-maps/
│   ├── test-strategies/
│   ├── api-analysis/, e2e-analysis/, regression-analysis/
│   ├── traceability/, verification/, reports/
│
├── runtime/                         # active state
│   ├── active-executions/<run-id>/
│   ├── checkpoints/<run-id>/
│   ├── logs/<run-id>/
│   └── recovery/, snapshots/, execution-cache/, ...
│
├── input/                           # user-provided sources (immutable)
│   ├── specs/, requirements/, hld/, lld/
│   ├── api-specs/, ui-specs/, ui-flows/
│   ├── business-documents/, raw-imports/
│
├── output/                          # finalized packages
│   ├── business-flow-packages/
│   ├── system-analysis-packages/
│   ├── risk-analysis-packages/
│   ├── test-strategy-packages/
│   ├── api-qc-packages/
│   ├── e2e-packages/
│   ├── regression-packages/
│   └── verification-reports/, executive-summaries/
│
├── docs/                            # layered documentation
│   ├── vision/      (4 files)
│   ├── architecture/(8 files)
│   ├── standards/   (5 files)
│   ├── playbooks/   (5 files)
│   └── examples/    (4 sample folders)
│
└── .claude/                         # agent bootstrap (this folder)
    ├── bootstrap/   (system, workspace context)
    ├── commands/    (8 user-facing slash commands)
    ├── execution/   (rules, validation order, recovery, checkpoint)
    └── context/     (architecture, systems, artifact maps)
```

## See also

- [systems-map.md](systems-map.md)
- [artifact-map.md](artifact-map.md)
