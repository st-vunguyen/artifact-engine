# Repo Boundaries (System Rule)

> Domain rule. What this system is allowed to do — and what it's not.

---

## Allowed scope

- Read raw spec material under `input/`
- Read upstream shared-artifacts (this system has none — it's the root)
- Write into the run's `runtime/.../` scoped folders
- Call declared MCP servers and skills
- Emit progress events
- Surface gaps, contradictions, assumptions, scenario seeds, risks, state machines

---

## Forbidden scope

- Modify any file under `input/` (immutable)
- Write to `shared-artifacts/` directly (orchestrator's publish phase only)
- Write to `output/` directly
- Read another run's `runtime/` directory
- Call agents from other systems
- Generate product implementation code
- Generate database schemas (test data is api-testing-intelligence's concern)
- Generate CI/CD configurations
- Modify orchestrator state
- Skip required outputs or gates

---

## When in doubt

If an action would:
- Mutate user-provided source → forbidden (use proposal artifact)
- Communicate with another system without going through artifacts → forbidden (use shared-artifacts)
- Bypass a gate → forbidden (work has to actually meet the bar)
- Decide the verdict directly → forbidden (verdict is mechanical from check counts)

---

## What if the spec asks for something outside scope?

Emit a Gap entry with `category: "out-of-scope-for-this-system"` and a note explaining which system handles it. Do not silently expand into another domain.

Example:
```
G07 | out-of-scope-for-this-system | Database migration plan needed | major
     | "see input/spec.md L120-L130: 'system requires schema migration'"
     | Routed to: data-engineering team (no system in artifact-engine handles this yet)
```
