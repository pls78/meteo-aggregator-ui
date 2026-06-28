## 1. Dependencies

- [x] 1.1 Add `maplibre-gl`; remove `leaflet`, `react-leaflet`, `@types/leaflet`
- [x] 1.2 `npm install`

## 2. Styles

- [x] 2.1 In `src/index.css`, replace the Leaflet CSS import with `maplibre-gl/dist/maplibre-gl.css`
- [x] 2.2 Replace `.leaflet-container` rule with a MapLibre map-container rule (full size + loading background)

## 3. Rewrite MapView (MapLibre GL)

- [x] 3.1 Create the map with the CARTO Voyager vector style, center `[12.5, 42.5]`, zoom 5, no nav controls
- [x] 3.2 Click handler: plain click → primary, `e.originalEvent.shiftKey` → comparison
- [x] 3.3 Primary/comparison markers (`maplibregl.Marker` colored blue/amber), updated on store changes
- [x] 3.4 Recenter via `map.flyTo` on store `focus`

## 4. WMS overlays in MapLibre

- [x] 4.1 For each active layer add a raster source (`{bbox-epsg-3857}` WMS template) + raster layer; remove on toggle-off
- [x] 4.2 Update `raster-opacity` from the store opacity; gate all overlay/marker ops on style `load`
- [x] 4.3 Delete `src/components/map/WmsOverlays.tsx`

## 5. Verify

- [x] 5.1 `npm run build` and `npm run lint` pass
- [x] 5.2 Live check: vector basemap renders crisp; pan/zoom; click = primary, Shift+click = comparison (box-zoom disabled); search recenters; toggle a satellite layer + opacity; legends still show — verified by the user
