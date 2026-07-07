## 1. Colour-key data

- [x] 1.1 Add `src/lib/layerLegends.ts` — static colour key (swatches + optional
  note) per RGB layer id, from EUMETSAT's standard RGB quick guides

## 2. UI

- [x] 2.1 Add a `RgbColorKey` component in `LayerControl.tsx` that renders the
  colour key for a layer id (nothing if the layer has no entry)
- [x] 2.2 Render it under each active layer, alongside the existing WMS legend

## 3. Verify

- [x] 3.1 `npm run lint` and `npm run build` pass
- [ ] 3.2 Visual check: toggling Airmass/Dust/Convection/Cloud Phase shows the
  colour key; Geo Colour shows its note; single-channel layers still show their
  WMS legend
