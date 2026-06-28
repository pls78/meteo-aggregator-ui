## Context

The MapLibre map (`MapView`) already has a `click` handler that selects `e.lngLat` into the
primary/comparison slot. The CARTO Voyager style exposes place labels via the `place`
source-layer (verified: `place_city_*`, `place_town`, `place_village`, etc.), whose features
are `Point` geometries carrying a `name` property — queryable with
`map.queryRenderedFeatures`.

## Goals / Non-Goals

**Goals:**
- Clicking a place label selects that named place (name + the label's coordinates).
- Preserve raw-coordinate selection when not clicking a label.
- Keep the slot rules (plain = primary, Shift = comparison) unchanged.

**Non-Goals:**
- No new UI, no highlighting/hover affordance for labels (could be a later polish).
- No reliance on specific style layer IDs (filter by source-layer so it survives style tweaks).

## Decisions

- **Query a small box around the click** (`±5px`) rather than the exact pixel, so labels are
  easy to hit: `queryRenderedFeatures([[x-5,y-5],[x+5,y+5]])`.
- **Filter to place features** by `feature.sourceLayer === 'place'`, `geometry.type === 'Point'`,
  and a non-empty `name`. Take the **topmost** match (render order). This avoids hardcoding the
  many `place_*` style layer IDs.
- **Use the feature's own coordinates** (the label's point) for the selected location, and its
  `name` (with `name:en`/`name_en` fallbacks) — so the marker snaps to the place and the card
  title / search bar show the name.
- **No auto-recenter** on a label click (the place is already under the cursor); plain
  coordinate clicks also don't recenter, consistent with today.
- **Fallback** to `e.lngLat` (unnamed) when no place feature is found.

## Risks / Trade-offs

- **Overlapping labels** → pick the topmost feature; good enough for selection.
- **Localized names** → prefer `name`, then `name:en`/`name_en`; acceptable for an Italy-centric map.

## Open Questions

- None.
