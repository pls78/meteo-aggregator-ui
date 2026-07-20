## Why

Satellite overlays showed a single still frame, so users couldn't see how cloud,
dust, or storms evolve. The backend now returns several recent frames per layer
(`GET /imagery?frames=N`), so the UI can loop them into a time-lapse without any
new data source.

## What Changes

- Request `frames=12` from `GET /imagery`; consume the new per-layer `times`
  array (newest first).
- Add a floating **time-lapse control** overlaid on the map (bottom-center,
  desktop + mobile): play/pause plus the layer name and the current frame's
  local time.
- Animate **one layer at a time**. The control is enabled only when exactly one
  overlay is active; with two or more it is visible but disabled. While a layer
  plays, the layer checklist is locked so the active set can't change mid-play.
- Render frames **flash-free**: mount one preloaded raster layer per frame and,
  on each step, snap the incoming frame on top instantly while fading the
  outgoing one out — so the vector basemap never shows through between frames.
- Show a **loading spinner** beside the frame time while the current frame's
  tiles are still fetching (e.g. just after pan/zoom).
- Drop the removed Sentinel-3 true-colour daily layer from the info page and
  mention the time-lapse in the features list.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `satellite-layers`: overlays gain a per-layer time-lapse animation (frames
  request, single-layer playback control on the map, flash-free frame rendering,
  and a tile-loading indicator).

## Impact

- Code: `src/api/{types.ts,client.ts}` (`times`, `frames`), `src/hooks/queries.ts`
  (`IMAGERY_FRAMES`), `src/store/appStore.tsx` (`animatingLayer`, `frameIndex`,
  `frameLoading` + actions), `src/components/map/MapView.tsx` (frame stack +
  clock + load watcher), new `src/components/map/MapAnimateControl.tsx`,
  `LayerControl`/`MobileLayers` (checklist lock), `App.tsx`/`MobileShell.tsx`
  (mount the control), `src/components/about/aboutContent.ts`.
- No new dependencies. Tiles are still fetched client-side directly from EUMETSAT.
