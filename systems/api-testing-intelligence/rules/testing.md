# API Testing (System Rule)

> Master rule for the api-testing system. Defines canonical structure, per-status discipline, and phase gating.

---

## Canonical 10-folder output structure (immutable)

```
output/api-qc-packages/<feature>/
├── 01-review/
│   ├── openapi-quality/
│   ├── auth-and-limits/
│   ├── pagination-filtering/
│   ├── test-patterns/
│   ├── oas-snapshot/
│   └── proposals/
├── 02-strategy/
├── 03-scenarios/
│   └── e2e-journeys/
├── 04-traceability/
├── 05-postman/
├── 06-env/
├── 07-data/
├── 08-helpers/
├── 09-performance/
│   ├── k6/
│   ├── newman/
│   ├── jmeter/
│   └── zap/
└── 10-reports/
    ├── raw/
    ├── performance/<run-slug>/
    ├── security-baseline/<run-slug>/
    ├── verification/<run-slug>/
    └── maintenance/<run-slug>/
```

**Rule:** never put loose run folders under `10-reports/` directly; always nest under a report family.

---

## The per-status request rule (ABSOLUTE)

Every operation MUST have **one dedicated Postman request item per documented status code**. A single happy-path request is **never sufficient**.

Naming: `"{Verb Noun} — {CODE} {Label}"` (e.g., `"Create Project — 201 Created"`).

Each per-status request has:
- request body / headers shaped to trigger that specific status
- a distinct `pm.test` assertion block validating status + response shape
- response[] populated with documented example
- env vars referenced as `{{env_var}}` — never hardcoded

Failure of this rule → completeness-gate fails.

---

## Coverage state values (only five allowed)

For every status × operation:
- **Covered** — request exists, executed, and validated
- **Planned** — request scaffold ready; not yet executed
- **Blocked** — cannot test (precondition missing, environment unavailable); reason recorded
- **Out of scope with reason** — explicit decision; rationale documented
- **Unknown / needs confirmation** — insufficient evidence to plan

Never claim "full coverage" if only `200` exists — explicitly state Planned/Blocked/Unknown for the rest.

---

## Phase gating (sequential, no skips)

```
Phase 1 (Review + Strategy)   →  Required Output Files for 01-review/, 02-strategy/
   ↓ gate: completeness, traceability
Phase 2 (Core Pack) ← MOST CRITICAL
   →  Required Output Files for 05-postman/full-api-collection.json, 06-env/, 07-data/
   ↓ gate: per-status coverage (quality-depth-gate rubric: api-postman-7d)
Phase 3 (Scenario Packs)
   →  Required Output Files for 03-scenarios/, additional 05-postman/, 04-traceability/
   ↓ gate: traceability complete
Phase 4 (Non-Functional + Verification)
   →  Required Output Files for 09-performance/, 10-reports/
   ↓ gate: verifier verdict pass / conditional-pass
```

Phase summary required after each phase: ✅/❌ for every Required Output File.

---

## 7-Dimension Postman Quality Rubric (`api-postman-7d`)

Required items (all must pass for completeness):

1. **Per-status request coverage** — every operation × every documented status
2. **Naming convention** — `{Verb Noun} — {CODE} {Label}` (operationId-derived)
3. **Response examples populated** — every `responses[]` entry has at least one example
4. **Test scripts present** — every request has a `pm.test` assertion block (not just `pm.sendRequest`)
5. **Auth env vars wired** — collection-level auth uses `{{ACCESS_TOKEN}}`
6. **Error triggers (negative cases)** — every error response has a request that triggers it
7. **Collection-level pre-request / test scripts** — token refresh, run-id setup, idempotency-key generation

Optional items (advisories):
- Folder structure mirrors OAS tags
- Request descriptions include operationId reference
- Example payloads use synthetic but realistic-looking data

---

## Scenario ID consistency

Scenario IDs MUST be consistent across:
- `02-strategy/test-strategy.md`
- `03-scenarios/*.md`
- `04-traceability/`
- `05-postman/*.json`
- `07-data/*.json`
- `10-reports/*/findings.md`

Drift in IDs → consistency-gate fails.

---

## Forbidden patterns

| Pattern | Why |
|---|---|
| Single happy-path request per operation | Per-status rule |
| Hardcoded credentials | Security; env var contract violated |
| Empty `responses[]` array | Naming-conventions / quality rule |
| Loose run folders under `10-reports/` | Structure rule |
| Renaming an operation outside the proposal flow | Source mutability |
| Curated report claims unsupported by raw evidence | Verification depth |

## Why

A Postman pack that "exists" but lacks per-status coverage doesn't catch the bugs Postman packs are written to catch. The 7-dimension rubric, per-status rule, and phase gating turn an AI-generated pack into a real test asset.
