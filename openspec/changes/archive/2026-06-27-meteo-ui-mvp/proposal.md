## Why

The `meteo-aggregator` backend already serves an aggregated multi-model forecast, hourly
data, place search, and satellite imagery parameters over HTTP, but there is no web client.
Coordinates and JSON are not how people read weather. We want a map-first UI where a user
picks a location by clicking the map (or searching), sees the aggregated forecast overlaid
in place, and can drop a second location to compare — plus optional live satellite layers
on the map. This is the first client the backend's README anticipated.

## What Changes

- Introduce a new React (Vite + TypeScript + Tailwind) single-page app that consumes the
  FastAPI backend directly over HTTP (no PHP, no backend changes in this repo).
- A full-screen Leaflet map is the primary surface. Clicking selects a **primary** location;
  `Shift`+click selects a **comparison** location.
- A search box resolves place names via `GET /search` and recenters/selects the result.
- Selected locations show overlaid cards with current conditions (`GET /hourly`, hour 0) and
  the daily forecast (`GET /forecast`); two locations render side by side for comparison.
- A layer control toggles EUMETSAT WMS satellite overlays from `GET /imagery` with an
  opacity control; tiles are fetched directly from EUMETSAT by the map.
- **External dependency (not in this repo):** the backend must enable CORS for the dev
  origin so the browser can call it directly.

## Capabilities

### New Capabilities
- `map-view`: A full-screen, pannable/zoomable base map that hosts all interaction and overlays.
- `location-selection`: Select a primary location by click and a comparison location by Shift+click; clear either.
- `location-search`: Resolve a place-name query to coordinates and select/recenter on the chosen result.
- `weather-display`: Show current conditions and the daily forecast for a selected location in an overlay card.
- `location-comparison`: Display two selected locations' weather side by side with aligned variables.
- `satellite-layers`: Toggle satellite/WMS overlays on the map with adjustable opacity.

### Modified Capabilities
<!-- None — this is a greenfield client; the backend's capabilities are untouched. -->

## Impact

- **New code:** a Vite React/TS app at the repo root (`src/api`, `src/hooks`, `src/store`,
  `src/components`, `src/lib`). New dependencies: `react`, `react-dom`, `leaflet`,
  `react-leaflet`, `@tanstack/react-query`, Tailwind toolchain.
- **External services:** the `../meteo-aggregator` FastAPI service (data) and EUMETSAT
  EUMETView WMS (`view.eumetsat.int`, satellite tiles, fetched directly by the browser).
- **External dependency:** backend CORS must allow the UI origin (e.g. `http://localhost:5173`).
- **No breaking changes** — greenfield.
