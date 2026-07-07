## Why

The new RGB composite overlays (Geo Colour, Dust, Airmass, Convection, Cloud
Phase) have no usable WMS legend — `GetLegendGraphic` returns only a blank ~20x20
placeholder, which the layer control (correctly) hides. So those layers show no
interpretation aid at all. An RGB composite encodes meaning in colour *mixing*
(e.g. Airmass: green = warm air, red = ozone-rich stratospheric intrusion), which
EUMETSAT documents as static "quick guides" rather than a WMS legend.

## What Changes

- Add a small static colour-key table (`src/lib/layerLegends.ts`) keyed by the
  backend layer id, following EUMETSAT's standard RGB interpretations.
- Render it under each active RGB layer in `LayerControl` — coloured swatches with
  short labels, plus a prose note for photographic composites (Geo Colour). Layers
  with a real WMS legend are unchanged.

## Capabilities

### Modified Capabilities
- `satellite-layers`: active RGB composite overlays that lack a WMS legend now show
  a static colour key so the imagery can be interpreted.

## Impact

- **UI only:** a new data module and a small presentational component in
  `LayerControl.tsx`. No API change (the colour key is presentation-side; the layer
  set still comes from `GET /imagery`).
- **No behaviour change** for layers that already have a real WMS legend.
