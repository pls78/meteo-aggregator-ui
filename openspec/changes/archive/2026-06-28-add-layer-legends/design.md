## Context

`LayerControl` already lists layers from `useImagery` and tracks `activeLayers`. Each
`WmsLayerParams` carries `wms_url` and `layer`, which is all that's needed to build a
`GetLegendGraphic` URL. Legends are static color scales (independent of `time`), verified to
return `image/png` for every configured layer.

## Goals / Non-Goals

**Goals:**
- Show the correct legend for each active layer, in context, with zero backend changes.
- Degrade gracefully if a legend image is missing.

**Non-Goals:**
- No legend for inactive layers (avoids clutter and needless requests).
- No custom-rendered legends; use the WMS-provided image as-is.

## Decisions

- **Build the legend URL client-side** from `wms_url` + `layer`:
  `?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=<layer>&format=image/png&transparent=true`.
  A small helper `legendUrl(params)` keeps it out of the JSX.
- **Render inline under each active layer row** in `LayerControl`, as an `<img>` constrained to
  the panel width (`max-w-full h-auto`). This ties the key directly to its toggle.
- **Graceful failure:** the `<img>` uses `onError` to hide itself, satisfying the
  "legend unavailable" scenario without a broken-image icon.

## Risks / Trade-offs

- **Legend wider than the panel** → constrain with `max-w-full`; the WMS legends are short
  horizontal bars that scale down acceptably.
- **Extra network requests** → only for active layers, and browser-cached; negligible.

## Open Questions

- None.
