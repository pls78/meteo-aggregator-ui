# HANDOFF

Context for the next agent/developer picking up `meteo-aggregator-ui`. Pairs with
[`CLAUDE.md`](CLAUDE.md) (architecture + backend contract) — read that too. This file focuses
on **current state, workflow, and gotchas** that aren't obvious from the code.

## What this is

A full-screen, map-driven weather UI. A MapLibre GL vector map; click (or search, or click a
place label) to select a location and see aggregated weather overlaid; `Shift`+click adds a
second location for comparison; toggleable EUMETSAT satellite WMS overlays with legends.
Pure frontend (Vite + React 19 + TypeScript + Tailwind v4 + MapLibre GL) talking directly to
the Python/FastAPI **meteo-aggregator** backend in the sibling repo `../meteo-aggregator`.

## Current status (working)

- App is feature-complete for the MVP + six follow-ups; `npm run build` and `npm run lint`
  pass.
- Both dev servers were running during development: UI on `:5173`, backend on `:8000`.
- **Deployed and live:** UI on Cloudflare Pages (<https://meteo-aggregator.pages.dev>),
  API on Google Cloud Run. See "Deployment" below and `CLAUDE.md`.

## Deployment

Two free, separate services; **local dev and the deployed build never collide**
because the API target is chosen by Vite mode:

- `npm run dev` → `.env` (`/api`) → dev proxy → **local** backend `:8000`.
- `npm run build` → committed `.env.production` → **deployed** Cloud Run API.

Redeploy the UI (static, direct upload — no Git integration):

```bash
nvm use && npm run build
npx wrangler pages deploy dist --project-name=meteo-aggregator   # -> meteo-aggregator.pages.dev
```

Gotcha: use the stable `meteo-aggregator.pages.dev` URL, **not** the per-deploy
`<hash>.…pages.dev` alias — the hash changes each upload and is not on the backend
CORS allow-list, so the app would fail with CORS errors there. The backend's
`ALLOWED_ORIGINS` is set to the production Pages origin; update it if that changes.

## Run it

```bash
nvm use                 # Node 22 — REQUIRED (see "Gotchas"); .nvmrc pins it
npm install
npm run dev             # http://localhost:5173
# backend (separate repo), needed for data:
cd ../meteo-aggregator && uvicorn api.main:app --reload   # http://localhost:8000
```

`npm run build` (tsc + vite), `npm run lint` (oxlint), `npm run preview`. No test runner yet.

## Gotchas (learned the hard way this session)

1. **Node version.** The shell defaults to Node 18, which **breaks** Vite 8 / create-vite
   (`styleText` ESM error). Use **Node 22**: `nvm use`, or prefix commands with
   `export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"`. The `openspec` CLI lives on
   Node 18's path and works regardless.
2. **Backend is Python/FastAPI, not PHP — and dev needs NO backend CORS.** The UI reaches the
   backend **same-origin** via a Vite dev proxy: `client.ts` uses a relative base (`/api` by
   default), and `vite.config.ts`'s `server.proxy` forwards `/api/*` to
   `VITE_API_PROXY_TARGET` (default `http://localhost:8000`), stripping the `/api` prefix. So
   in dev the browser only ever talks to `:5173` and no CORS is involved. **Production caveat:**
   the proxy does NOT run in a production build — if the UI and API are served from different
   origins there, the backend must send CORS headers (or the API must be served under a
   same-origin `/api` route), and `VITE_API_BASE_URL` must point at the absolute API URL. This
   is the `api-access` capability (`openspec/specs/api-access/spec.md`).
3. **MapLibre specifics:**
   - `map.boxZoom.disable()` is required, else MapLibre's Shift+drag box-zoom eats **Shift+click**
     (our comparison-selection gesture). Already done in `MapView`.
   - Map **rotation/tilt is enabled by default** (right-drag / two-finger). We chose to keep it.
     If asked to lock north-up: `dragRotate.disable()`, `touchZoomRotate.disableRotation()`,
     `keyboard` rotation off.
   - All layers are **Web Mercator (EPSG:3857)** — vector tiles, WMS overlays (requested with
     `srs=EPSG:3857` + `{bbox-epsg-3857}`), and markers. Don't introduce a source in another CRS.
   - WMS overlays are MapLibre **raster sources** added imperatively in `MapView` (not a separate
     component anymore). Opacity = `raster-opacity` paint property.
   - **Auto-refresh:** `useImagery` re-polls `GET /imagery` every ~60 s (`refetchInterval`), and
     when a layer's snapped `time` (its tile URL) advances, `MapView` swaps the tiles in place via
     `RasterTileSource.setTiles([newUrl])`. Per-layer URL tracking keeps opacity-only updates from
     needlessly reloading tiles. This is the `auto-refresh-overlays` change.
4. **"Current conditions" = `/hourly` hour 0.** `/forecast` only has daily max/min. See
   `LocationCard`.
5. **Satellite legends** come from the WMS `GetLegendGraphic`. Layers without a real legend
   (IR 3.9, Sentinel-3 RGB) return a ~20×20 cross-hatched placeholder — `LayerLegend` hides
   anything `naturalWidth < 64` and stays out of layout until a real legend loads (avoids a bump).
6. **Place-label click** uses `queryRenderedFeatures` filtered to the CARTO style's `place`
   source-layer (not hardcoded layer ids). Empty-area clicks fall back to raw lng/lat.
7. **Benign lint warning:** `appStore.tsx` triggers an oxlint `only-export-components` (fast-refresh)
   warning because it exports both the provider and the `useAppStore` hook. Left as-is.
8. **Bundle size:** ~1.3 MB (MapLibre). Vite prints a chunk-size warning — non-fatal. Code-split
   if it ever matters.

## Accent colors (used in 3 places — keep consistent)

- Primary location: `rgb(37, 99, 235)` / `#2563eb` (blue)
- Comparison location: `rgb(245, 158, 11)` / `#f59e0b` (amber)

Used for: map markers, weather-card bullets, and search-bar dots.

## State model

- **Server data** → React Query hooks in `src/hooks/queries.ts` (`useSearch`, `useForecast`,
  `useHourly`, `useImagery`); forecast/hourly keyed by rounded lat/lon. `useImagery` re-polls
  every ~60 s so overlays stay current (see gotcha #3).
- **Client UI state** → `src/store/appStore.tsx` (Context): `primary`, `comparison`
  (`SelectedLocation | null`), `activeLayers`, `opacity`, `focus`; actions `selectLocation`,
  `clearLocation`, `toggleLayer`, `setOpacity`, `focusOn`. Plain click → primary; Shift → comparison.

## Key files

```
src/api/{types.ts,client.ts}      typed contract (mirror ../meteo-aggregator models) + fetch
src/hooks/queries.ts              React Query hooks
src/store/appStore.tsx            UI state (Context)
src/lib/weatherCode.ts            WMO code -> icon/label
src/components/map/MapView.tsx    MapLibre map: style, click+place-label select, markers, recenter, WMS overlays
src/components/search/{SearchBox,SearchPanel}.tsx   per-slot search + "+" add-comparison
src/components/panels/LocationCard.tsx              current + daily forecast card
src/components/compare/ComparisonPanel.tsx          1 or 2 cards, fade in/out
src/components/layers/LayerControl.tsx              layer toggles, opacity, legends
src/App.tsx                       composition (map + overlays)
```

## OpenSpec workflow (IMPORTANT — this repo is spec-driven)

Do **not** add features ad hoc. Every feature/refactor goes through an OpenSpec change.
The `openspec` CLI (v1.3.1) is installed; `.claude/commands/opsx/*` and `openspec-*` skills
are available.

1. `openspec new change <kebab-name>` (or `/opsx:propose "<idea>"`).
2. Author under `openspec/changes/<name>/`: `proposal.md`, `specs/<capability>/spec.md`
   (delta: `## ADDED|MODIFIED|REMOVED Requirements`, each `### Requirement:` with ≥1
   `#### Scenario:` — exactly 4 hashtags), `design.md`, `tasks.md`.
   - A change **must have at least one spec delta** (even refactors — frame the user-visible
     intent as a requirement; see the `vector-basemap` change for an example).
   - For MODIFIED, copy the existing requirement block from `openspec/specs/<cap>/spec.md` and edit.
3. `openspec validate <name> --strict` and `openspec status --change <name>`.
4. Implement, checking off `tasks.md` (`- [ ]` → `- [x]`).
5. `npm run build` + `npm run lint`; have the user verify live.
6. `openspec archive <name> --yes` (use `--skip-specs` only for true no-spec changes) — this
   syncs deltas into `openspec/specs/` and moves the change to `openspec/changes/archive/`.

Current capabilities (baseline in `openspec/specs/`): `map-view`, `location-selection`,
`location-search`, `weather-display`, `location-comparison`, `satellite-layers`, `api-access`.
Run `openspec list --specs` for the live count.

### Archived changes so far
`meteo-ui-mvp` → `add-comparison-search` → `add-layer-legends` → `vector-basemap`
→ `add-place-label-selection` → `dev-api-proxy` → `auto-refresh-overlays`
(all under `openspec/changes/archive/`).

## Candidate next features (ideas raised, not yet specced)

- **Lock map north-up** (or a "reset north" control) — disable rotation/tilt; purely UX.
- **Code-split** MapLibre to cut the initial bundle.
- **Hourly strip** in the weather card (the `/hourly` data beyond hour 0 is already fetched).
- **Comparison emphasis** — highlight the warmer/wetter side in `ComparisonPanel`.
- **Hover affordance** on place labels (cursor/highlight) to hint they're clickable.

## Notes

- Backend HTTP/response reference: `../meteo-aggregator/api/README.md`; models:
  `../meteo-aggregator/meteo_aggregator/models.py` — keep `src/api/types.ts` in sync.
