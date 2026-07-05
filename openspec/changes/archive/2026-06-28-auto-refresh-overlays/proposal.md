## Why

Satellite overlays are effectively frozen after the first load. `useImagery` has
no `refetchInterval`, so `GET /imagery` is never re-polled — and even if it were,
`MapView`'s WMS effect only updates **opacity** for an already-active layer
(`src/components/map/MapView.tsx:150`), never swapping the tile URL. So a live
weather situation goes stale: a 5-minute lightning/rapid-scan layer never
advances on the map even though the backend would happily report a newer frame.

## What Changes

- Add a `refetchInterval` to `useImagery` (`src/hooks/queries.ts`) so `/imagery`
  is re-polled (~60 s) and the backend re-snaps each layer's `time` to the latest
  cadence boundary. Cheap: `/imagery` makes **no upstream HTTP calls** (it only
  computes WMS params), and React Query's structural sharing means an unchanged
  response between boundaries does not churn the UI.
- In `MapView`'s WMS overlay effect, when an active layer's snapped `time` (i.e.
  its tile URL) has advanced, refresh the raster source **in place** via
  `RasterTileSource.setTiles([newUrl])` (maplibre-gl 5). Track each active
  layer's current URL so opacity-only effect runs do not needlessly reload tiles.
- Add a requirement to the `satellite-layers` capability: active overlays refresh
  to the latest available frame.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `satellite-layers`: add a requirement that active overlays auto-refresh to the
  latest frame the backend reports (the existing toggle / opacity / compose /
  legend requirements are unchanged).

## Impact

- **UI code:** `src/hooks/queries.ts` (`refetchInterval` + interval constant);
  `src/components/map/MapView.tsx` (refresh source tiles when the snapped `time`
  changes; per-layer URL tracking).
- **Backend:** none — the cadence catalog and time-snapping already exist
  (`meteo_aggregator/config.py`, `providers/eumetview.py`).
- **Dependencies:** none (uses the existing maplibre-gl 5 `setTiles` API).
- **External services:** EUMETSAT WMS tiles re-fetched only when a layer's `time`
  actually advances (≤ once per its cadence), not on every poll.
