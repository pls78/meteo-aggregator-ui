## Context

`MapView` uses react-leaflet (`MapContainer`, `TileLayer`, `Marker`, `useMapEvents`,
`useMap`) and `WmsOverlays` uses `L.tileLayer.wms`. The store, query hooks, and overlay UI are
engine-agnostic. Verified: CARTO Voyager GL style (`https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`)
is keyless and its `place` source-layer carries city/town label features (relevant to the
future click-to-name feature, not built here).

## Goals / Non-Goals

**Goals:**
- Vector basemap (CARTO Voyager) via MapLibre GL with identical user-facing behavior.
- Keep markers, selection, recenter, WMS overlays, opacity, and legends working exactly as now.

**Non-Goals:**
- No click-to-select-by-place-name (separate future change).
- No new visual features, controls, or rotation UX changes.

## Decisions

- **Use `maplibre-gl` directly** (no `react-map-gl`) to avoid React 19 compatibility risk and
  keep the dependency surface small. `MapView` manages one `maplibre.Map` imperatively via
  refs + effects.
- **Effects mirror the previous declarative pieces:**
  - init (once): create `Map` with the Voyager style, center `[12.5, 42.5]`, no nav controls
    (matches the removed zoom buttons); attach a `click` handler reading
    `e.originalEvent.shiftKey` to choose the slot.
  - markers: one `maplibregl.Marker({ color })` per slot (blue `#2563eb`, amber `#f59e0b`),
    added/moved/removed as `primary`/`comparison` change.
  - recenter: `map.flyTo` when the store `focus` changes.
  - overlays: for each active layer, `addSource` (raster) + `addLayer`; remove on toggle-off;
    update `raster-opacity` when opacity changes. Guard all of this behind the style `load`.
- **WMS as a MapLibre raster source** using the documented tile template with the
  `{bbox-epsg-3857}` token:
  `…/wms?service=WMS&version=1.1.1&request=GetMap&layers=<layer>&styles=&format=image/png&transparent=true&srs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}[&time=…]`.
  (Version 1.1.1 + `srs` avoids WMS 1.3.0 axis-order pitfalls.)
- **Zoom scale:** start at MapLibre zoom 5 (≈ the previous Leaflet zoom 6, since MapLibre uses
  512px tiles).

## Risks / Trade-offs

- **WMS axis order / token** → use 1.1.1 + `srs=EPSG:3857` + `{bbox-epsg-3857}` (well-supported by GeoServer).
- **Manipulating sources before style load** → gate overlay/marker effects on a `loaded` flag set on the map `load` event.
- **Bundle size** → maplibre-gl is larger than leaflet; acceptable for the rendering/feature gains.

## Open Questions

- None.
