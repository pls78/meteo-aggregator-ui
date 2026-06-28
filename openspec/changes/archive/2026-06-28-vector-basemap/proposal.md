## Why

The basemap is currently raster (CARTO Voyager PNG tiles via Leaflet). Raster forces a
trade-off between crispness and label size on HiDPI screens, and it can never support
interacting with map features (e.g. clicking a city name) because tiles are just pixels. A
**vector** basemap renders crisply at any zoom/DPI and exposes place features for future
interaction.

## What Changes

- Swap the map engine from **Leaflet/react-leaflet** to **MapLibre GL JS**, rendering the
  **CARTO Voyager vector** style (keyless).
- Re-implement the existing map behavior on MapLibre with **no functional change**:
  full-screen pan/zoom, click = primary / Shift+click = comparison selection, primary/comparison
  markers (same blue/amber colors), programmatic recenter (search), and the satellite WMS
  overlays (MapLibre raster source using the `{bbox-epsg-3857}` token) with the opacity control.
- Remove the `leaflet`, `react-leaflet`, and `@types/leaflet` dependencies; add `maplibre-gl`.
- **This is a refactor.** No capability's behavior changes, so there are no spec deltas. The
  follow-up "click a place label to select it" feature (which the vector map enables) is
  intentionally **out of scope** here.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
<!-- None — behavior is unchanged; this swaps the rendering engine only. The map-view,
     location-selection, and satellite-layers capabilities keep their existing requirements. -->

## Impact

- **UI code:** rewrite `src/components/map/MapView.tsx`; remove
  `src/components/map/WmsOverlays.tsx` (overlay logic moves into `MapView` as MapLibre raster
  sources); update `src/index.css` (swap Leaflet CSS for MapLibre CSS + container styles).
  `store`, `hooks`, `search`, `panels`, `compare`, and `layers` (legends) are unaffected.
- **Dependencies:** − `leaflet`, − `react-leaflet`, − `@types/leaflet`; + `maplibre-gl`.
- **External services:** CARTO vector tiles + style (keyless); EUMETSAT WMS unchanged.
- **No backend, model, or API changes.**
