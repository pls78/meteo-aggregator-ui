## Context

Overlays are MapLibre raster sources added imperatively in `MapView`, one per
active layer, showing the single snapped `time` from `GET /imagery`. The backend
now returns a `times` array (newest first) and accepts `frames=N`. The WMS serves
any past frame via its TIME dimension, so animating is pure client work — no new
data source, tiles still fetched directly from EUMETSAT.

## Goals / Non-Goals

**Goals:**
- Loop a single layer's recent frames smoothly, with no basemap flash.
- Keep the static (non-animating) rendering path unchanged.
- Surface loading state so the user knows when a frame isn't ready yet.

**Non-Goals:**
- Multi-layer synchronized animation (frames step by index, and layers of
  different cadence aren't time-aligned — hence single-layer playback only).
- Server-side tiling/proxying or a scrubber timeline.

## Decisions

- **Single-layer playback, gated in the control.** Animation state is
  `animatingLayer: string | null` in the store. The map control targets the one
  active overlay; it's disabled with ≠1 active. `LayerControl`/`MobileLayers`
  disable their checkboxes while `animatingLayer` is set. Rationale: index-based
  frame stepping isn't time-aligned across cadences, so animating several layers
  together would be misleading.

- **Preloaded frame stack + asymmetric swap for flash-free playback.** When a
  layer plays, `MapView` mounts one raster layer per frame (`wms-<layer>-fN`).
  MapLibre loads tiles for all of them (opacity-0 layers are still `visible`), so
  every frame is preloaded. On each tick the current frame is moved to the top and
  snapped to full opacity instantly, while the previous frame only fades out
  beneath it. This avoids both the basemap gap and the mid-crossfade brightness
  dip that a symmetric fade produced. Static mode keeps the single-layer path.

- **Animation clock in `MapView`.** A 550 ms interval (re-armed only when
  `animatingLayer` changes) advances `frameIndex` oldest→newest via a ref, so
  ticks don't re-arm the timer. `IMAGERY_FRAMES = 12` frames (≈ 2 h at 10-min
  cadence, 3 h at 15-min).

- **Loading flag from `isSourceLoaded`.** `MapView` records the current frame's
  source id and pushes `frameLoading` to the store, recomputed per step and
  refreshed on the map's `sourcedata`/`idle` events; guarded against a
  source removed mid-teardown. The control shows a spinner when it's true.

## Risks / Trade-offs

- **Frames not preloaded right after pan/zoom** → the incoming frame may briefly
  lack tiles. Mitigation: the loading spinner signals it; the asymmetric swap keeps
  the outgoing frame until the incoming is ready to cover.
- **Response/scene cost grows with frame count** → bounded by `IMAGERY_FRAMES`;
  payload is just timestamps and the raster layers are transparent overlays.

## Migration Plan

Additive and backward compatible with the existing overlay behavior. No data
migration; rollback is a straight revert.
