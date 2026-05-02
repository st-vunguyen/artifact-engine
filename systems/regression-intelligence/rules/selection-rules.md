# Selection Rules (System Rule)

> Default rules + override discipline for the regression set.

## Default rule catalog (always applied)

```yaml
rules:
  - id: direct-api-impact
    when: "change.artifacts_touched.api_operations is non-empty"
    select: "api scenarios where scenario.endpoints[].path matches changed operation"
    priority: p0
    why: "Direct contract change must be re-tested"

  - id: transitive-api-impact
    when: "change.artifacts_touched.components is non-empty"
    select: "api scenarios for operations exposed by transitively-impacted components"
    priority: p1
    why: "Indirect impact via dependency chain"

  - id: e2e-impact
    when: "change.artifacts_touched.business_flow_steps or ui_routes"
    select: "e2e journeys linking those steps/routes"
    priority: p0
    why: "User-visible path affected"

  - id: high-risk-affected
    when: "any change links to a risk with severity ≥ high"
    select: "abuse-failure scenarios linked to that risk"
    priority: p0
    why: "High-severity risk regression must be validated"

  - id: incident-replay
    when: "change.source == 'incident'"
    select: "regression scenarios already linked to the incident"
    priority: p0
    why: "Don't repeat the incident"

  - id: always-run-smoke
    when: "any change at all"
    select: "scenarios tagged @smoke"
    priority: p1
    why: "Sanity baseline"
```

## Override discipline

Workflows MAY add custom rules:

```yaml
- id: custom-perf-touch
  when: "change.artifacts_touched.components includes 'svc-search'"
  select: "performance scenarios on /search"
  priority: p0
```

Workflows MAY NOT remove default rules. They can adjust priorities (downward) but `incident-replay` and `direct-api-impact` always remain p0.

## Per-rule transparency

Every selection records which rule(s) selected it (`selected_because[]`). Multiple rules selecting the same scenario → all reasons recorded.

## Hard rules

- Every default rule MUST be evaluated (no silent skip)
- `incident-replay` p0 priority cannot be downgraded
- `direct-api-impact` p0 priority cannot be downgraded
- Custom rules cite their motivation in `why`
- Rule evaluation logged to `runtime/logs/<run-id>/selection-trace.jsonl`

## Why

Regression selection is the place where "we'll just run everything" becomes "we have a coherent reason for every test we run." Codifying rules + tracing every selection makes the regression set defensible and auditable.
