## Why

The info page's satellite-layer list was a hardcoded copy of the backend
catalog, kept in sync by hand — it drifted when the catalog changed (e.g. the
Sentinel-3 layer had to be deleted in two places). `GET /imagery` already reports
the live layer set and each layer's cadence-stepped `times`, so the page can
derive the list itself.

## What Changes

- The info page's layer list is built from the layers returned by `GET /imagery`
  (membership follows the live catalog — a removed layer disappears, a new one
  appears), instead of a hardcoded array.
- Each layer's **update cadence** is derived from the spacing of its `times`
  frames (e.g. two frames 10 min apart → "10 min"), not hand-authored.
- The editorial bits that aren't in the API — the short name, satellite, and
  description — live in a UI map keyed by the stable WMS layer id, with a
  graceful fallback (derived short title + generic text) for any layer with no
  entry, so an unknown/new layer still renders.
- Remove the now-stale "plus the polar-orbiting Sentinel-3" wording.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `info-page`: the documented satellite-layer list is derived from the live
  `/imagery` catalog (membership and cadence), not a hand-maintained copy.

## Impact

- Code: `src/components/about/aboutContent.ts` (array → id-keyed metadata map),
  `src/components/about/AboutDialog.tsx` (render from `useImagery`), new
  `src/lib/layerMeta.ts` (short-title + cadence-from-frames helpers, shared with
  `MapAnimateControl`).
- No backend change; no new dependencies.
