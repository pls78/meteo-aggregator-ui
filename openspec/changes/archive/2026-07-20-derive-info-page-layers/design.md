## Context

`AboutDialog` renders a static `SATELLITE_LAYERS` array from `aboutContent.ts`
(title, satellite, cadence label + kind, description), a hand-kept mirror of the
backend catalog. `useImagery()` already fetches `GET /imagery`, which returns the
live layer set and, per layer, a `times` array of cadence-stepped frames.

## Goals / Non-Goals

**Goals:**
- Membership and cadence come from the API so they can't drift.
- Keep the richer editorial copy (short name, satellite, description).
- Degrade gracefully for a layer the UI has no metadata for.

**Non-Goals:**
- No backend change (the API stays a data endpoint; descriptions are UI content).
- Not restyling the info page — same card layout and badges.

## Decisions

- **Derive the list from `useImagery().layers`.** Render one card per returned
  layer, in API order. If imagery hasn't loaded yet, show a brief loading line.

- **Derive cadence from frame spacing.** `cadenceFromTimes(times)` takes the gap
  between the two newest timestamps: `< 60 min → "N min"`, `≥ 1 day → "Daily"`,
  else hours; kind is `fast (≤5 min) | daily (≥1 day) | normal`. With only one
  frame (or none) it falls back to `null`, and the card omits the badge.

- **Editorial metadata keyed by stable layer id.** `aboutContent.ts` exposes
  `LAYER_INFO: Record<layerId, { satellite; description; name? }>`. The display
  name is `LAYER_INFO[id].name ?? shortTitle(apiTitle)`; description/satellite
  fall back to the API title / "—". So a new backend layer still lists (with a
  cleaned-up title and generic text) instead of vanishing or 404-ing the page.

- **Share `shortTitle`.** Move the parenthetical/dash-stripping helper out of
  `MapAnimateControl` into `src/lib/layerMeta.ts` and reuse it here.

## Risks / Trade-offs

- **Cadence from data assumes ≥2 frames** → true for near-real-time `/imagery`
  (12 frames); the badge is simply omitted otherwise, no error.
- **A new layer shows generic copy until someone adds a `LAYER_INFO` entry** →
  acceptable and self-evident, and strictly better than the current silent drift.

## Migration Plan

Pure UI refactor of existing content; no data migration, straight revert to roll
back.
