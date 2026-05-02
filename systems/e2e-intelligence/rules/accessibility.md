# Accessibility (System Rule)

> WCAG 2.1 AA discipline using `@axe-core/playwright`.

## Default level

WCAG 2.1 AA unless test-strategy specifies AAA or A.

## Axe configuration

```ts
import { injectAxe, checkA11y } from 'axe-playwright'

await injectAxe(page)
await checkA11y(page, null, {
  detailedReport: true,
  rules: {
    'color-contrast': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-roles': { enabled: true },
    // ...full WCAG 2.1 AA ruleset
  },
})
```

## Severity classification

| Axe impact | Reporting category |
|---|---|
| `critical` | P0 system bug |
| `serious` | P0 / P1 system bug |
| `moderate` | P1 / P2 finding |
| `minor` | Advisory |

## Manual a11y checks (complement axe)

Axe catches ~30% of issues. Manual scenarios required:
- Keyboard navigation: tab order matches visual order
- Screen reader: announcements meaningful
- Focus visibility: focus ring on all interactive elements
- Heading hierarchy: h1 → h2 → h3 (no skipping)

## A11y scenarios (per scenario doc)

Tag with `@a11y`. Each scenario:
- Targets a specific user role or page
- Runs `checkA11y()` with appropriate scope
- Adds keyboard-navigation assertions where applicable
- Attaches violation report on failure

## Forbidden

- Suppressing axe rules without justification
- Marking a violation "false positive" without manual verification
- Skipping a11y on public pages
- Treating WCAG A failures as advisories

## Hard rules

- Every public page (no auth required) has at least one `@a11y` scenario
- WCAG A violations = release blocker
- WCAG AA violations on p0 pages = release blocker
- Axe rules tuned per app; not all rules apply universally (justify exclusions)
