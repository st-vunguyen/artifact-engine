# Visual Regression (System Rule)

## Snapshot configuration (required)

```ts
// playwright.config.ts
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.01,
    threshold: 0.2,
    animations: 'disabled',
  },
},
snapshotDir: 'tests/e2e/specs',
snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
```

## Baseline discipline

- Baselines committed to git under `tests/e2e/specs/<spec>-snapshots/`.
- One baseline per (spec, project, screenshot label).
- Update via `--update-snapshots` only after explicit visual review.
- Never auto-accept baseline drift.

## Dynamic content masking

Mask elements that legitimately change between runs:
- Timestamps
- Auto-generated IDs
- Dynamic counters (notifications, etc.)
- Animations / transitions

```ts
await expect(page).toHaveScreenshot('home.png', {
  mask: [page.getByTestId('timestamp')],
})
```

## Cross-viewport baselines

Each viewport project (`Desktop`, `Tablet`, `Mobile`) maintains its own baseline.
Same logical screenshot label → 3 actual files.

## Visual helpers

`helpers/visual-helpers.ts`:
- `checkOverflow(element)` — verifies no horizontal overflow
- `checkCutoffText(selector)` — verifies text isn't truncated
- `checkElementVisibility(selector)` — verifies element in viewport
- `checkBoundingBox(selector, expectedBox)` — layout-precise check

## When NOT to use visual regression

- Subjective design quality (color preference, font weight choice) — Manual-only
- Animations smoothness — Manual-only or specialized perf tests
- Cross-browser font rendering minutiae — usually flaky; use semantic checks instead

## Hard rules

- Mask discipline applied for any dynamic element
- Threshold tuned per spec, not blanket-relaxed
- Baselines pre-checked before suite runs
- Visual diffs reviewed manually before declaring system bug
