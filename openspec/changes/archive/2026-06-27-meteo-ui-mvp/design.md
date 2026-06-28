## Context

Greenfield web client for the `../meteo-aggregator` FastAPI service. The backend exposes four
keyless GET endpoints (`/search`, `/forecast`, `/hourly`, `/imagery`) and explicitly leaves
image bytes out of the imagery endpoint — it returns WMS parameters for the client to fetch
tiles directly from EUMETSAT. The product is map-first: the map is the main surface, weather
is overlaid in context, and comparison is a core interaction (Shift+click).

Constraints: metric units only, no auth, no i18n. The UI runs on a different origin than the
backend during development, so cross-origin access is required.

## Goals / Non-Goals

**Goals:**
- A fast, map-centric SPA where selecting a location (click or search) shows aggregated weather.
- Two-location comparison via Shift+click with an aligned, readable layout.
- On-demand satellite overlays driven by the backend's `/imagery` parameters.
- Types that mirror the backend's pydantic models so the contract is explicit and checked.

**Non-Goals:**
- No backend code in this repo (CORS enablement is a backend task, flagged separately).
- No auth, accounts, i18n, unit switching, or PWA/offline in this change.
- No custom tile server — base map uses public OSM raster tiles; satellite tiles come from EUMETSAT.

## Decisions

- **Vite + React + TypeScript + Tailwind.** Lightweight SPA, fast dev server; Tailwind for
  quick, consistent overlay/card styling. (Alternative: Next.js — rejected, no SSR/SEO need.)
- **react-leaflet / Leaflet** for the map. Leaflet's built-in `L.tileLayer.wms` maps 1:1 onto
  the backend's documented imagery usage (EPSG:3857, transparent PNG). (Alternative: MapLibre
  GL — rejected for MVP; WMS raster overlays need manual raster-source setup.)
- **@tanstack/react-query** for all backend reads (`/search`, `/forecast`, `/hourly`,
  `/imagery`). Gives caching, dedupe, and loading/error states for free. Query keys include
  rounded lat/lon so the same location isn't refetched and the two compared locations cache
  independently.
- **Small client store** (`src/store/useAppStore.ts`) holds UI state that isn't server data:
  the primary location, the comparison location, the set of active satellite layers, and
  overlay opacity. (A minimal store/Context — kept tiny; server data stays in React Query.)
- **Typed API seam** (`src/api/types.ts` + `client.ts`) mirrors the backend models
  (`Place`, `AggregatedForecast`/`DayConsensus`, `AggregatedHourlyForecast`/`HourConsensus`,
  `SatelliteImagery`/`WmsLayerParams`). `values` is `Record<string, number | string | null>`.
- **"Current conditions" = `/hourly` hour 0.** `/forecast` only provides daily max/min, so the
  current temperature/humidity/condition come from `hourly[0].values`.
- **Base URL via `VITE_API_BASE_URL`** (default `http://localhost:8000`), read from
  `import.meta.env` — no hardcoded host.
- **WMO `weather_code` → icon/label** via a small lookup in `src/lib/weatherCode.ts`.

## Risks / Trade-offs

- **CORS** → The browser cannot call the backend cross-origin until the backend enables CORS
  for the UI origin. Mitigation: documented as an external dependency; sane error states so the
  failure is legible during setup.
- **Pre-archive imagery layers** (`time: null`) → some layers predate their archive for a given
  time. Mitigation: still renderable (WMS serves latest); no special handling required for MVP.
- **Marker click vs map click** → Shift state must be read from the original DOM event. Mitigation:
  use react-leaflet `useMapEvents` and read `e.originalEvent.shiftKey`.
- **EUMETSAT availability/rate** → overlays depend on a third-party WMS. Mitigation: overlays are
  opt-in; base map and weather work without them.

## Open Questions

- Should an hourly strip be part of MVP weather-display or a follow-up? (Plan: optional, lowest
  priority; daily + current are required.)
