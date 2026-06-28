## 1. Place lookup on click

- [x] 1.1 In the `MapView` click handler, query `map.queryRenderedFeatures` over a ±5px box around the click
- [x] 1.2 Filter to place labels: `sourceLayer === 'place'`, `geometry.type === 'Point'`, non-empty `name`; take the topmost
- [x] 1.3 If a place is hit, select `{ lat, lng, name }` from the feature; otherwise fall back to `e.lngLat` (unnamed)
- [x] 1.4 Keep slot rules: plain click → primary, `shiftKey` → comparison

## 2. Verify

- [x] 2.1 `npm run build` and `npm run lint` pass
- [x] 2.2 Live check: click a city label → primary card titled with the place name; Shift+click another label → named comparison; click empty sea/land → unnamed lat/lon selection still works — verified by the user
