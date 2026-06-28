## Why

The satellite overlays render as colored imagery with no key, so layers like the Cloud Mask
or the K-Index/Lifted-Index instability indices are hard to interpret — the user can't tell
what a color means. The EUMETSAT WMS already serves a legend for every layer (via a standard
`GetLegendGraphic` request), so we can show it with no backend work.

## What Changes

- For each **active** satellite layer, display its **legend** (the color→meaning key) in the
  Satellite layers panel, beneath that layer's row.
- The legend image is fetched directly from the EUMETSAT WMS `GetLegendGraphic` endpoint,
  built from the `wms_url` + `layer` already returned by `GET /imagery`.
- If a legend fails to load, it is simply omitted (no broken-image placeholder).
- Frontend-only. **No API changes.**

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `satellite-layers`: each active overlay now shows its legend so the colors can be interpreted.

## Impact

- **UI code:** `src/components/layers/LayerControl.tsx` (render the legend per active layer) and
  a small URL helper. Reuses the `WmsLayerParams` (`wms_url`, `layer`) from the existing
  `useImagery` hook.
- **External services:** EUMETSAT WMS `GetLegendGraphic` (keyless, fetched directly by the
  browser — same origin/pattern as the existing tiles).
- **No backend, model, or API changes.**
