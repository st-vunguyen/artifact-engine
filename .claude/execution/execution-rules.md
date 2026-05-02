# Execution Rules (.claude binding)

> The execution-rules contract Claude binds to when invoked as an agent.

## Source of truth

- [core/shared-rules/execution-rules.md](../../core/shared-rules/execution-rules.md) — canonical
- [EXECUTION-LIFECYCLE.md](../../EXECUTION-LIFECYCLE.md) — lifecycle states

## Operating contract (summary)

1. **Universal stages** — INPUT → ANALYSIS → GENERATION → VALIDATION → VERIFICATION → FINAL OUTPUT.
2. **Phase gating** — no Phase N+1 until Phase N's `required_outputs` exist + gates pass.
3. **Idempotency** — re-running a phase on the same input produces semantically equivalent output.
4. **Single writer to runtime/** — only the orchestrator. Agents write to phase-scoped folders only.
5. **Source immutability** — `input/` is never modified.
6. **No cross-system agent calls** — only via `shared-artifacts/`.
7. **Verifier independence** — generators don't verify their own output.

## Determinism requirements

- Use `executionSdk.deterministicId(...)` for new ids.
- Cite via `traceability-mcp.cite` (auto-extracts excerpt verbatim).
- Read only declared inputs; write only into scoped_dir.
- Honor cancellation via `ctx.cancelled` polling.

## Forbidden

- `--force` flags
- Skipping gates "to ship faster"
- Manual verdict overrides
- Free-text "TBD" / "TODO" — use Gap entries
- Hot-modifying workflow definitions mid-run

## See also

- [validation-order.md](validation-order.md)
- [recovery-policy.md](recovery-policy.md)
- [checkpoint-policy.md](checkpoint-policy.md)
