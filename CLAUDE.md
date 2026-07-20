# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A map-driven weather UI: a full-screen MapLibre GL map where the user clicks (or searches) to
select a location and sees aggregated weather overlaid; `Shift`+click adds a second location
for side-by-side comparison; tapping a day opens an hour-by-hour bottom sheet for that day
(both locations overlaid when two are selected); satellite WMS layers can be toggled onto the
map. On load it seeds a starting location (browser geolocation, else a configured default), and
an info button opens a "how it works" page. Below the `md` breakpoint it switches to a
**mobile layout** — a draggable weather bottom sheet, an on-screen **A/B tap target** in place
of Shift+click, and a satellite-layers sheet. It is a pure frontend (Vite + React + TypeScript
+ Tailwind v4 + MapLibre GL) that talks directly to the Python/FastAPI **meteo-aggregator**
backend in the sibling repo `../meteo-aggregator`.

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

The UI needs the aggregator running. In dev the Vite proxy forwards `/api` to it
(target `VITE_API_PROXY_TARGET`, default `http://localhost:8000`, see `.env`):

```bash
cd ../meteo-aggregator && uvicorn api.main:app --reload
```

**CORS:** in dev the browser talks to the Vite server **same-origin** — it calls
`/api/*` (`VITE_API_BASE_URL` defaults to `/api`) and Vite's `server.proxy`
forwards that to the backend, so **no backend CORS is needed** in development. In
**production** the proxy does not run: the deployed build calls the backend's
absolute origin cross-origin, so the backend must allow the UI origin. This is
wired up — see "Deployment" below.

## Deployment

Deployed as two free, separate services:

- **UI** → Cloudflare Pages (static, direct upload): <https://meteo-aggregator.pages.dev>
- **API** → Google Cloud Run (scale-to-zero container): `https://your-backend.example.com`

The API target is selected by Vite mode, so **local and deployed never collide**:

- `npm run dev` (development mode) → `.env` (`/api`) → dev proxy → **local** backend on `:8000`.
- `npm run build` (production mode) → **committed** `.env.production` (`VITE_API_BASE_URL` = Cloud Run URL) → **deployed** backend.

`.env` is gitignored (local); `.env.production` is committed (public URL, no secret).

Redeploy the UI:

```bash
nvm use && npm run build
npx wrangler pages deploy dist --project-name=meteo-aggregator
```

Use the stable `meteo-aggregator.pages.dev` URL — the per-deploy `<hash>.…pages.dev`
alias changes each upload and is **not** on the backend CORS allow-list. The
backend's `ALLOWED_ORIGINS` env var is set to `https://meteo-aggregator.pages.dev`
(see `../meteo-aggregator/api/README.md`); update it if the UI origin changes.

## Architecture

- **`src/api/`** — the typed contract. `types.ts` mirrors the backend pydantic models
  (`../meteo-aggregator/meteo_aggregator/models.py`) — **keep them in sync**. `client.ts` is
  a thin `fetch` wrapper (one function per endpoint).
- **`src/hooks/queries.ts`** — React Query hooks (`useSearch`, `useForecast`, `useHourly`,
  `useHourlyRange`, `useImagery`). Forecast/hourly query keys include rounded lat/lon so
  locations cache independently and aren't refetched on tiny coordinate changes. `useHourly`
  fetches 24 h for current conditions; `useHourlyRange` lazily fetches the full 168 h week,
  enabled only while a day is open in the hourly view.
- **`src/store/appStore.tsx`** — client UI state only (selected primary/comparison locations,
  active WMS layers, overlay opacity, map focus, `selectedDay` — the day open in the hourly
  view — `activeSlot`, which slot a plain map tap fills, `aboutOpen`, the info dialog's
  visibility, and the time-lapse trio `animatingLayer`/`frameIndex`/`frameLoading` (the layer
  playing, its current frame, and whether that frame's tiles are still loading — the latter two
  driven by `MapView`). `activeSlot` is the mobile A/B target; it stays `'primary'` on desktop so
  plain-click/Shift are unchanged). Server data stays in React Query, never here.
- **`src/components/map/`** — `MapView` (the full-screen map + base tiles + markers + recenter +
  WMS overlays). Rotation and pitch are locked (kept north-up). A plain tap fills `activeSlot`;
  Shift+click always fills comparison. Active satellite layers are rendered imperatively in
  `MapView`; when one plays a time-lapse it mounts a preloaded raster layer per frame (see
  HANDOFF gotcha #3). `MapAnimateControl` is the floating play/pause control (single active layer).
- **`src/components/`** (desktop overlays) — `search/SearchBox` (accepts a `className` for
  width), `panels/LocationCard` (day rows are buttons that open the hourly view),
  `compare/ComparisonPanel`, `layers/LayerControl` (exports `LayerLegend`/`RgbColorKey` for
  reuse), and `hourly/` — `HourlyPanel` (full-width bottom sheet) + `HourlyChart`
  (dependency-free inline SVG; temperature line and precipitation bars in **separate stacked
  panels** sharing one x-axis — never a dual-axis chart).
- **`src/components/mobile/`** — the layout shown below the `md` breakpoint. `MobileShell`
  composes `MobileTopBar` (search + A/B target), `WeatherSheet` (draggable peek/half/full sheet
  with an A/B tab, embedding `HourlyChart`), and `MobileLayers` (Layers FAB + modal sheet).
- **`src/components/about/`** — the in-app info / "how it works" dialog (opened from an info
  button in both layouts; state via `appStore.aboutOpen`). `AboutDialog` is a light modal
  documenting features, data sources, the aggregation/weighting algorithm (with worked
  examples), and the satellite layers; `AboutButton` is the trigger; `aboutContent.ts` holds
  the static figures **transcribed from the backend `config.py`/`aggregation.py`** — keep the
  models/weights in sync if the backend changes. The **satellite-layer list is derived from
  `GET /imagery`** (membership + cadence, via `lib/layerMeta.ts`); only per-layer editorial copy
  is hand-authored in `aboutContent.ts`'s `LAYER_INFO`, keyed by layer id with a fallback.
- **`src/hooks/useMediaQuery.ts`** — `useMediaQuery`/`useIsMobile` (`max-width: 767px`).
  `App.tsx` renders `DesktopOverlays` or `MobileShell` over the shared `MapView` based on it.
- **`src/hooks/useInitialLocation.ts`** — on load, seeds the primary location from the browser
  geolocation, falling back silently to `DEFAULT_LOCATION` in **`src/lib/config.ts`** when it's
  denied/unavailable. Runs once per mount; never overrides an existing selection; no persistence.
- **`src/lib/weatherCode.ts`** — WMO `weather_code` → icon/label.

> **Two layouts, one behavior:** presentation of selection / weather / layers is duplicated
> across the desktop overlays and `src/components/mobile/`. Changing one usually means changing
> the other. The map, store, and React Query hooks are shared, so keep behavior in those.
> The `index.html` viewport is intentionally locked (`maximum-scale=1, user-scalable=no`) — the
> map owns zoom; without it iOS zooms into focused inputs and never restores. Don't re-enable it.

### Backend contract (consumed, not owned here)

Four keyless GET endpoints; full reference in `../meteo-aggregator/api/README.md`:

| Endpoint | Notes |
|----------|-------|
| `GET /search?name` | `Place[]` — name → coordinates for the search box |
| `GET /forecast?lat&lon&days` | daily consensus; `values` keyed by variable, plus `confidence` + per-model `breakdown` |
| `GET /hourly?lat&lon&hours` | hourly consensus; **`hours[0]` = current conditions** (`/forecast` has only daily max/min). Timestamps are **location-local** (backend uses `timezone=auto`), matching the daily `date`, so the hourly view groups hours under a tapped day via `date.slice(0,10)` — **do not** assume UTC here |
| `GET /imagery?time&frames` | EUMETSAT WMS layer params (`EPSG:3857`, transparent PNG). Each layer has `time` and a `times` array (`frames` recent frames, newest first; `time === times[0]`) for the time-lapse. Tiles are fetched **directly from EUMETSAT by the browser**, not proxied; `time: null` ⇒ WMS serves the latest image |

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
