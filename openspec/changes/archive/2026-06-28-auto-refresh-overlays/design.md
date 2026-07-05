## Context

`GET /imagery` returns, per layer, a WMS template plus a `time` snapped to that
layer's cadence boundary (`eumetview.py:_snap`; cadences in
`config.EUMETVIEW_LAYERS`, 5–15 min or daily). The UI fetches this once via
`useImagery` (`staleTime: 5min`, no `refetchInterval`) and `MapView` builds a
maplibre raster source whose tile URL embeds `&time=…`. Today an active layer's
source is created once; subsequent `imagery` changes only adjust opacity, so the
embedded `time` never advances.

## Goals / Non-Goals

**Goals:**
- Active overlays track the latest frame the backend reports, hands-free.
- No flicker or opacity reset when refreshing; no reload when nothing changed.
- Negligible cost (poll a local, no-upstream endpoint; re-fetch tiles only when
  `time` advances).

**Non-Goals:**
- A time-slider / animation / history scrubber (only "latest" matters here).
- Per-layer poll cadences or backend changes (snapping already exists).
- Compensating for publish latency (snapping to `now`'s boundary may briefly
  request a not-yet-published frame; noted as a risk).

## Decisions

**1. One poll on the single `/imagery` query — not per-layer timers.**
The backend returns all layers in one response, so one `refetchInterval` covers
them. React Query structural sharing diffs the response: layers whose snapped
`time` is unchanged keep their object identity, so only advanced layers trigger
work in `MapView`.
- *Alternative:* split into per-layer queries each polling at its own cadence —
  rejected: needs a per-layer endpoint or N queries for no real gain.

**2. Interval = 60 s (named constant `IMAGERY_REFETCH_MS`).**
The fastest cadence is 5 min, so 60 s bounds detection lag to ≤60 s after a frame
lands while keeping polls cheap (the call computes params, no upstream HTTP).
Background polling stays off (React Query default); `refetchOnWindowFocus`
already covers returning to the tab.
- *Alternative:* derive the interval from the minimum cadence — rejected: the
  backend does not expose `cadence_minutes` to the UI, and a fixed 60 s is
  simpler and adequate.

**3. Refresh tiles via `RasterTileSource.setTiles([url])`, not remove/re-add.**
`setTiles` swaps the source's tile URLs in place and refetches — no layer
removal, so no flash and no opacity reset. The effect tracks each active layer's
last URL in a ref and calls `setTiles` only when `wmsTileUrl(params)` actually
changed, so opacity-only runs don't force a reload.
- *Alternative:* `removeLayer`/`removeSource` then re-add — rejected: visible
  flicker and re-applies paint each time.

**4. Lean on structural sharing to avoid churn between boundaries.**
Between cadence boundaries `/imagery` returns an identical payload; structural
sharing yields the same `imagery` reference, so the `useEffect` (dep `imagery`)
does not even run. No extra guarding needed for the common case.

## Risks / Trade-offs

- **[Publish latency / tile gaps]** Snapping to `now`'s boundary can request a
  frame EUMETSAT has not published yet → transparent tiles until it lands; the
  prior frame is replaced only when the new URL resolves. → Acceptable; the next
  poll (≤60 s) still reflects it once available. A one-step safety margin is
  possible later but out of scope.
- **[setTiles on the wrong source type]** Only raster overlay sources are touched
  (ids `wms-*`), guarded by `getSource`/`getLayer` existence checks.
- **[Tile caching]** The WMS URL embeds the new `time`, so a refreshed frame is a
  distinct URL — no stale-cache risk.

## Migration Plan

Pure frontend, no data migration. Rollback = remove the `refetchInterval` and the
`setTiles` branch (revert to opacity-only). `npm run build` + `npm run lint` and a
live check on a fast layer gate the change.
