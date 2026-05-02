# /run-full-quality-suite

Run the full canonical pipeline end-to-end.

## Args

- `--feature <slug>` (required)
- `--mode <quick|deep|enterprise>` (default: deep)
- `--include <list>` (default: all 7 systems)
- `--exclude <list>` (e.g., to skip regression when no change input)
- `--change-input <path>` (required if regression included)

## Chain

```
1. business-flow-full-pipeline      → BF + state-machine + risks (preliminary) + scenario seeds
2. system-graph-pipeline             → system-graph + dependency-map
3. enrich-risks-pipeline             → enriched risks + blast-radius + mitigations
4. test-strategy-pipeline            → 7-section test strategy
5a. api-test-full-pipeline           → 10-folder API test pack (parallel with 5b)
5b. e2e-full-pipeline                → Playwright E2E pack (parallel with 5a)
6. regression-analysis-pipeline      → regression set (when --change-input present)
```

## Time profile (typical)

| Stage | Typical duration |
|---|---|
| BF (1) | 15–45 min |
| system-graph (2) | 5–20 min |
| risks (3) | 5–15 min |
| test-strategy (4) | 8–25 min |
| api + e2e (5a, 5b parallel) | 30–90 min |
| regression (6) | 5–15 min |
| **total** | 1–3 hours |

## Hard timeout default

8 hours (workflow chain).

## Failure semantics

If a stage fails, the chain stops. Resume from `pnpm run resume --run-id <id>`.

Stages 5a + 5b run independently; one can fail without blocking the other.

## Outputs

A complete artifact tree under:
- `shared-artifacts/<kind>/<feature>.<ext>` — handoffs
- `output/<system>-packages/<feature>/` — deliverables
- `output/executive-summaries/<run-id>/` — cross-system roll-up

## See also

- [WORKFLOWS.md](../../WORKFLOWS.md)
- [PIPELINES.md](../../PIPELINES.md)
- [docs/playbooks/execution-playbook.md](../../docs/playbooks/execution-playbook.md)
