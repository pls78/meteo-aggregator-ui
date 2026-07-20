## 1. Backend contract

- [x] 1.1 Add `times: (string | null)[]` to `WmsLayerParams` in `src/api/types.ts`.
- [x] 1.2 Add a `frames` param to `getImagery` in `src/api/client.ts`.
- [x] 1.3 Request `IMAGERY_FRAMES` frames in `useImagery` (`src/hooks/queries.ts`).

## 2. State

- [x] 2.1 Add `animatingLayer`, `frameIndex`, `frameLoading` + `toggleLayerAnimation`,
  `setFrameIndex`, `setFrameLoading` to `src/store/appStore.tsx`.
- [x] 2.2 Auto-stop when the animating layer is turned off.

## 3. Map rendering

- [x] 3.1 In `MapView`, mount a preloaded raster layer per frame while playing.
- [x] 3.2 Asymmetric swap: snap the current frame on top at full opacity, fade the
  outgoing one out — no basemap flash.
- [x] 3.3 Animation clock (550 ms, ref-driven) stepping oldest→newest and looping.
- [x] 3.4 Report `frameLoading` via `isSourceLoaded`, refreshed on sourcedata/idle.

## 4. Control

- [x] 4.1 New `src/components/map/MapAnimateControl.tsx`: play/pause, layer name,
  frame time, loading spinner; enabled only for a single active layer.
- [x] 4.2 Mount it bottom-center in `App.tsx` (desktop) and `MobileShell.tsx` (mobile).
- [x] 4.3 Lock the layer checklist while a layer plays (`LayerControl`, `MobileLayers`).

## 5. Info page + docs

- [x] 5.1 Remove the Sentinel-3 daily layer from `aboutContent.ts`; mention the time-lapse.
- [x] 5.2 Update `HANDOFF.md` / `CLAUDE.md` for the new state, control, and `/imagery` contract.
