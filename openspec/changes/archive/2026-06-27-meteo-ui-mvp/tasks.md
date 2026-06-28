## 1. Project scaffold

- [x] 1.1 Create the Vite React + TypeScript app at the repo root (alongside `openspec/`)
- [x] 1.2 Add deps: `leaflet`, `react-leaflet`, `@tanstack/react-query`; dev deps for Tailwind v4 (`tailwindcss`, `@tailwindcss/vite`) and `@types/leaflet`
- [x] 1.3 Configure Tailwind v4 (`@tailwindcss/vite` plugin + `@import "tailwindcss"` in `src/index.css`) and import `leaflet/dist/leaflet.css`
- [x] 1.4 Add `.env` with `VITE_API_BASE_URL=http://localhost:8000` and `.env.example`
- [x] 1.5 Wrap the app in `QueryClientProvider` in `main.tsx`

## 2. API layer (typed contract)

- [x] 2.1 `src/api/types.ts`: mirror backend models — `Location`, `Place`, `Confidence`, `DayConsensus`, `AggregatedForecast`, `HourConsensus`, `AggregatedHourlyForecast`, `WmsLayerParams`, `SatelliteImagery`; `DailyValues = Record<string, number | string | null>`
- [x] 2.2 `src/api/client.ts`: `searchPlaces`, `getForecast`, `getHourly`, `getImagery` using `VITE_API_BASE_URL`; throw on non-OK responses
- [x] 2.3 `src/hooks/queries.ts`: React Query hooks `useSearch`, `useForecast`, `useHourly`, `useImagery` with location-keyed query keys (rounded lat/lon)

## 3. Client state

- [x] 3.1 `src/store/appStore.tsx`: primary + comparison locations (set/clear), active satellite layer ids, overlay opacity, map focus
- [x] 3.2 `src/lib/weatherCode.ts`: WMO `weather_code` → `{ icon, label }` lookup

## 4. Map (map-view + location-selection)

- [x] 4.1 `src/components/map/MapView.tsx`: full-screen Leaflet map with OSM base tiles + attribution
- [x] 4.2 Click handler via `useMapEvents`: plain click → set primary; `e.originalEvent.shiftKey` → set comparison
- [x] 4.3 Markers for primary and comparison locations (visually distinct)
- [x] 4.4 Recenter/flyTo (`Recenter` component + store `focusOn`) used by search selection

## 5. Search (location-search)

- [x] 5.1 `src/components/search/SearchBox.tsx`: debounced input over `useSearch`, results dropdown
- [x] 5.2 Selecting a result sets the primary location and recenters the map; handle no-results state

## 6. Weather display (weather-display)

- [x] 6.1 `src/components/panels/LocationCard.tsx`: current conditions from `/hourly` hour 0 (temp, humidity, condition icon) + daily forecast rows (icon, max/min, precipitation, confidence)
- [x] 6.2 Loading and error states for forecast/hourly queries

## 7. Comparison (location-comparison)

- [x] 7.1 `src/components/compare/ComparisonPanel.tsx`: render two `LocationCard`s side by side when both locations are selected; single card otherwise
- [x] 7.2 Per-card close button wired to clear the corresponding location

## 8. Satellite layers (satellite-layers)

- [x] 8.1 `src/components/layers/LayerControl.tsx`: list layers from `useImagery`, toggle active set, opacity slider
- [x] 8.2 `src/components/map/WmsOverlays.tsx`: render active layers via `L.tileLayer.wms` (wms_url + layer params, transparent, opacity); clicks still reach the map

## 9. Compose + verify

- [x] 9.1 `src/App.tsx`: map + SearchBox + LayerControl + LocationCard/ComparisonPanel overlay
- [x] 9.2 `npm run build` and `npm run lint` pass (typecheck clean)
- [x] 9.3 Manual verification against a running backend (search, click, Shift+click compare, toggle a layer) — verified live with the FastAPI backend (CORS enabled)
