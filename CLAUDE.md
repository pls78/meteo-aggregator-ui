# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A map-driven weather UI: a full-screen Leaflet map where the user clicks (or searches) to
select a location and sees aggregated weather overlaid; `Shift`+click adds a second location
for side-by-side comparison; satellite WMS layers can be toggled onto the map. It is a pure
frontend (Vite + React + TypeScript + Tailwind v4 + react-leaflet) that talks directly to the
Python/FastAPI **meteo-aggregator** backend in the sibling repo `../meteo-aggregator`.

## Node version

The toolchain (Vite 8 / create-vite) requires **Node ≥ 20.19** (use `v22`, see `.nvmrc`).
The default shell may be on Node 18 — run `nvm use` first, or commands will fail with a
`styleText`/ESM error.

## Commands

```bash
nvm use            # Node 22 (see .nvmrc)
npm install
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # tsc -b && vite build (typecheck + production build)
npm run lint       # oxlint
npm run preview    # serve the production build
```

There is no test runner configured yet.

## Backend dependency

The UI needs the aggregator running and reachable at `VITE_API_BASE_URL` (default
`http://localhost:8000`, see `.env`):

```bash
cd ../meteo-aggregator && uvicorn api.main:app --reload
```

**CORS:** because the browser calls FastAPI cross-origin, the backend must allow the UI
origin. Add `CORSMiddleware` (allow `http://localhost:5173`) in
`../meteo-aggregator/api/main.py`. Without it, all data requests fail in the browser.

## Architecture

- **`src/api/`** — the typed contract. `types.ts` mirrors the backend pydantic models
  (`../meteo-aggregator/meteo_aggregator/models.py`) — **keep them in sync**. `client.ts` is
  a thin `fetch` wrapper (one function per endpoint).
- **`src/hooks/queries.ts`** — React Query hooks (`useSearch`, `useForecast`, `useHourly`,
  `useImagery`). Forecast/hourly query keys include rounded lat/lon so locations cache
  independently and aren't refetched on tiny coordinate changes.
- **`src/store/appStore.tsx`** — client UI state only (selected primary/comparison locations,
  active WMS layers, overlay opacity, map focus). Server data stays in React Query, never here.
- **`src/components/map/`** — `MapView` (the full-screen map + base tiles + markers + recenter),
  `WmsOverlays` (active satellite layers via `L.tileLayer.wms`).
- **`src/components/`** — `search/SearchBox`, `panels/LocationCard`, `compare/ComparisonPanel`,
  `layers/LayerControl`. `App.tsx` composes the map with absolutely-positioned overlays.
- **`src/lib/weatherCode.ts`** — WMO `weather_code` → icon/label.

### Backend contract (consumed, not owned here)

Four keyless GET endpoints; full reference in `../meteo-aggregator/api/README.md`:

| Endpoint | Notes |
|----------|-------|
| `GET /search?name` | `Place[]` — name → coordinates for the search box |
| `GET /forecast?lat&lon&days` | daily consensus; `values` keyed by variable, plus `confidence` + per-model `breakdown` |
| `GET /hourly?lat&lon&hours` | hourly consensus; **`hours[0]` = current conditions** (`/forecast` has only daily max/min) |
| `GET /imagery?time` | EUMETSAT WMS layer params (`EPSG:3857`, transparent PNG). Tiles are fetched **directly from EUMETSAT by the browser**, not proxied; `time: null` ⇒ WMS serves the latest image |

`values` is `Record<string, number | string | null>`; `weather_code` is a WMO code, and
`sunrise`/`sunset` are strings (non-blendable). Units are metric throughout.

## Conventions

- Metric units only. No auth, no i18n.
- `tsconfig` uses `verbatimModuleSyntax` — import types with `import type`.

## OpenSpec workflow (spec-driven)

This repo uses OpenSpec, like the backend. Specs and change proposals live in `openspec/`.
Don't add features ad hoc — go through a change:

- `/opsx:propose "<idea>"` (or `openspec new change <name>`) → author `proposal.md`,
  `specs/<capability>/spec.md`, `design.md`, `tasks.md`.
- `/opsx:apply <name>` → implement the tasks, checking them off as you go.
- `/opsx:archive <name>` → archive once complete (syncs delta specs into `openspec/specs/`).
- `openspec list` / `openspec validate <name>` / `openspec status --change <name>` to inspect.

The initial build is captured by the `meteo-ui-mvp` change.
