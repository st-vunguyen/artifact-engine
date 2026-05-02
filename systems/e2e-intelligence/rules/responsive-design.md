# Responsive Design (System Rule)

## Default viewport matrix

```ts
projects: [
  { name: 'Desktop', viewport: { width: 1280, height: 720  } },
  { name: 'Tablet',  viewport: { width: 768,  height: 1024 } },
  { name: 'Mobile',  viewport: { width: 375,  height: 667  } },
]
```

Custom viewports added per feature when test-strategy specifies (e.g., wide desktop 1920×1080, ultrawide).

## Coverage

Every p0 / p1 functional UI scenario MUST run on:
- Desktop (always)
- Mobile (always)
- Tablet (when test-strategy mode is `enterprise`)

P2 scenarios run only on Desktop unless test-strategy expands.

## Tag

Scenarios that depend on responsive behavior tagged `@responsive`.

## Layout assertions

Per `helpers/visual-helpers.ts`:
- `checkOverflow` — no horizontal scroll
- `checkCutoffText` — text not truncated
- `checkBoundingBox` — element within expected dimensions per viewport

## Cross-viewport baselines

Each viewport produces its own snapshot directory. Visual regression tagged `@visual` runs per-viewport automatically (Playwright projects).

## Hard rules

- Viewport dimensions explicit (no "small / medium / large" without numbers)
- `@responsive` tag applied on any viewport-sensitive scenario
- Mobile-first content priorities respected (key actions reachable above fold)
- Touch targets ≥ 44×44 dp on mobile (WCAG 2.5.5 — checked by axe)

## Forbidden

- "Looks fine on mobile" without programmatic check
- Skipping mobile when test-strategy includes mobile users
- Hard-coded pixel positions (use bounding-box ratios)
