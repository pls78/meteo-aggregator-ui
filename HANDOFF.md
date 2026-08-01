# HANDOFF

Context for the next agent/developer picking up `meteo-aggregator-ui`. Pairs with
[`CLAUDE.md`](CLAUDE.md) (architecture + backend contract) — read that too. This file focuses
on **current state, workflow, and gotchas** that aren't obvious from the code.

## What this is

A full-screen, map-driven weather UI. A MapLibre GL vector map; click (or search, or click a
place label) to select a location and see aggregated weather overlaid; `Shift`+click adds a
second location for comparison; toggleable EUMETSAT satellite WMS overlays with legends, and a
per-layer **time-lapse animation** of recent frames. Pure frontend (Vite + React 19 +
TypeScript + Tailwind v4 + MapLibre GL) talking directly to the Python/FastAPI
**meteo-aggregator-api** backend in the sibling repo `../meteo-aggregator-api`.

## Current status (working)

- App is feature-complete for the MVP plus thirteen follow-ups (through the hourly-by-day view,
  the mobile layout, deployment, default-location seeding on load, the in-app info page, and the
  satellite-layer time-lapse animation); `npm run build` and `npm run lint` pass.
- **Shipped since (implemented as direct commits, then backfilled as OpenSpec changes):**
  a **confidence detail** view (tap a day's confidence tag → per-model temperatures, each
  model's blend weight, and how the level was computed, in place of the hourly chart —
  `confidence-detail-view`); an **interactive hourly chart** (fills its width, adapts point
  density 3 h→2 h→1 h to the space, labels each point with its hour, and shows a crosshair +
  value on hover/tap — `interactive-hourly-chart`); and **slightly transparent** map overlays
  (`bg-white/70` + `backdrop-blur` — `overlay-transparency`). These extend `weather-display` /
  `map-view`. The backend confidence-computation capability has its own spec in the sibling repo
  (`../meteo-aggregator-api/openspec/specs/confidence-detail/`).
- **Also shipped (`harden-locate-control`):** the "use my location" control can no longer hang.
  A watchdog bounds the wait (the browser's own `timeout` doesn't cover the permission prompt —
  gotcha #10), a late-arriving fix is still honoured, the button never disables itself into a
  dead end, blocked permission is detected and explained instead of retried into a no-op, and
  the failure message persists until acted on. Same change: the forecast card sizes to its
  widest day so a row can't wrap.
- **Also shipped:** the time-lapse control now stays clear of the open detail sheet
  (`animate-control-clears-forecast` — the control keeps its fixed bottom-centre slot and the
  sheet lifts above it when a layer is active); the sheet rounds all corners while lifted; and
  the Satellite-layers panel was raised to `z-1002` so its options stay clickable when the wide
  sheet overlaps its bottom-left corner (bug fix, direct commit — restores existing behaviour).
- Both dev servers were running during development: UI on `:5173`, backend on `:8000`.
- **Deployed and live:** UI on Cloudflare Pages (<https://meteo-aggregator.pages.dev>),
  API on Google Cloud Run. See "Deployment" below and `CLAUDE.md`.

## Deployment

Two free, separate services; **local dev and the deployed build never collide**
because the API target is chosen by Vite mode:

- `npm run dev` → `.env` (`/api`) → dev proxy → **local** backend `:8000`.
- `npm run build` → `.env.production` (`/api`) → Pages Function proxy
  (`functions/api/`) → **your deployed** backend. No backend URL in the repo or bundle.

Redeploy the UI (static, direct upload — no Git integration):

```bash
nvm use && npm run build
npx wrangler pages deploy dist --project-name=meteo-aggregator   # -> meteo-aggregator.pages.dev
```

The backend URL is **not** in the repo: it is the `API_ORIGIN` secret on the Pages
project (`npx wrangler pages secret put API_ORIGIN --project-name=meteo-aggregator`,
plus `--env preview` for preview deploys). Per-deploy `<hash>.…pages.dev` aliases
work fully now — all calls are same-origin through `functions/api/`, so no CORS
allow-list is involved.

## Run it

```bash
nvm use                 # Node 22 — REQUIRED (see "Gotchas"); .nvmrc pins it
npm install
npm run dev             # http://localhost:5173
# backend (separate repo), needed for data:
cd ../meteo-aggregator-api && uvicorn api.main:app --reload   # http://localhost:8000
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
   in dev the browser only ever talks to `:5173` and no CORS is involved. **Production works the
   same way:** `.env.production` also sets `/api`, and the Cloudflare Pages Function in
   `functions/api/` proxies it to the backend (URL held in the `API_ORIGIN` secret). So CORS is
   never involved in either mode, and no backend URL reaches the bundle. This is the
   `api-access` capability (`openspec/specs/api-access/spec.md`).
3. **MapLibre specifics:**
   - `map.boxZoom.disable()` is required, else MapLibre's Shift+drag box-zoom eats **Shift+click**
     (our comparison-selection gesture). Already done in `MapView`.
   - Map **rotation/tilt is locked north-up** (`dragRotate.disable()`,
     `touchZoomRotate.disableRotation()`, keyboard rotation off), set in the `mobile-ui` change
     because a rotated map confuses the touch A/B selection. Don't re-enable it.
   - All layers are **Web Mercator (EPSG:3857)** — vector tiles, WMS overlays (requested with
     `srs=EPSG:3857` + `{bbox-epsg-3857}`), and markers. Don't introduce a source in another CRS.
   - WMS overlays are MapLibre **raster sources** added imperatively in `MapView` (not a separate
     component anymore). Opacity = `raster-opacity` paint property.
   - **Auto-refresh:** `useImagery` re-polls `GET /imagery` every ~60 s (`refetchInterval`), and
     when a layer's snapped `time` (its tile URL) advances, `MapView` swaps the tiles in place via
     `RasterTileSource.setTiles([newUrl])`. Per-layer URL tracking keeps opacity-only updates from
     needlessly reloading tiles. This is the `auto-refresh-overlays` change.
   - **Time-lapse animation (`add-layer-animation`):** `useImagery` requests `frames=IMAGERY_FRAMES`
     (=12) and each layer returns a `times` array (newest first). Playing **one** layer, `MapView`
     mounts one raster layer per frame (`wms-<layer>-fN`) — all preloaded, since MapLibre loads
     tiles for opacity-0 `visible` layers — and a 550 ms clock steps `frameIndex` oldest→newest.
     **Flash-free swap:** the incoming frame is `moveLayer`'d on top and snapped to full opacity
     instantly while the outgoing one only fades out; a **symmetric** crossfade dips mid-swap and
     flashes, so don't reintroduce it. `frameLoading` (from `map.isSourceLoaded`, refreshed on
     `sourcedata`/`idle`) drives the control's spinner. The floating control is
     `MapAnimateControl` (bottom-center, both layouts); it's enabled only when exactly one overlay
     is active, and the layer checklist is locked while a layer plays. Mixed-cadence layers aren't
     time-aligned (frames step by index), hence single-layer playback.
4. **"Current conditions" = `/hourly` hour 0.** `/forecast` only has daily max/min. See
   `LocationCard`.
5. **Satellite legends** come from the WMS `GetLegendGraphic`. Layers without a real legend
   (e.g. IR 3.9) return a ~20×20 cross-hatched placeholder — `LayerLegend` hides anything
   `naturalWidth < 64` and stays out of layout until a real legend loads (avoids a bump).
   (The Sentinel-3 true-colour daily layer was dropped backend-side.) The info-page layer list is
   now **derived from `GET /imagery`** (`derive-info-page-layers`): membership follows the live
   catalog and cadence is computed from each layer's frame spacing (`lib/layerMeta.ts`). Only the
   editorial copy (short name, satellite, description) is hand-authored, keyed by layer id in
   `aboutContent.ts`'s `LAYER_INFO`, with a fallback so an unknown layer still renders.
6. **Place-label click** uses `queryRenderedFeatures` filtered to the CARTO style's `place`
   source-layer (not hardcoded layer ids). Empty-area clicks fall back to raw lng/lat.
7. **Benign lint warning:** `appStore.tsx` triggers an oxlint `only-export-components` (fast-refresh)
   warning because it exports both the provider and the `useAppStore` hook. Left as-is.
8. **Bundle size:** ~1.3 MB (MapLibre). Vite prints a chunk-size warning — non-fatal. Code-split
   if it ever matters.
9. **Bottom-overlay layering (desktop, `App.tsx`).** Three stacked layers share the bottom of the
   map, so mind the z-order and overlap:
   - The floating overlay wrapper is `z-1000`; the hourly/confidence **detail sheet** is `z-1001`;
     the **Satellite-layers** control is pulled out to `z-1002` so the wide centered sheet can't
     cover its options (it does overlap the bottom-left corner). Don't drop the layer control back
     inside the `z-1000` wrapper — that wrapper is a stacking context, so a child there can never
     rise above the sheet however high its own `z-*`.
   - The **time-lapse control** keeps a fixed `bottom-4` slot; the sheet gets a conditional
     `bottom-20` (vs `bottom-0`) driven by `activeLayers.length > 0` so it lifts above the control
     only when a layer is active (`animate-control-clears-forecast`). The `floating` prop rounds
     all the sheet's corners while lifted.
   - Known, unfixed: the sheet's `pointer-events-auto` wrapper is full-width, so it still eats map
     clicks in the transparent strips beside the centered sheet. Constraining it needs care — the
     chart sizes itself from its container width, so don't wrap it in `w-fit`.
10. **`PositionOptions.timeout` does not bound `getCurrentPosition`.** It excludes the time the
    permission prompt is on screen, so an unanswered prompt invokes **neither** callback — which
    is exactly how `LocateButton` used to spin forever with no way out but a reload. Anything
    calling geolocation needs its own watchdog (`harden-locate-control`). Two consequences worth
    keeping: a fix that lands *after* the watchdog is still accepted (otherwise a slow-but-real
    grant looks like a silent failure), and `navigator.permissions` is treated as **advisory** —
    it's absent on older Safari, so never let it be the thing that decides a request failed.
11. **Known, unfixed: overlay collision on a narrow desktop window.** Around ~900 px with two
    locations compared, the top-right cards overlap the top-left search boxes. This predates the
    variable-width card (fixed `w-72` cards already collided); `harden-locate-control` widened it
    by ~30 px. A real fix means deciding how the two top overlays share a narrow viewport.

## Accent colors (used in 3 places — keep consistent)

- Primary location: `rgb(37, 99, 235)` / `#2563eb` (blue)
- Comparison location: `rgb(245, 158, 11)` / `#f59e0b` (amber)

Used for: map markers, weather-card bullets, and search-bar dots.

## State model

- **Server data** → React Query hooks in `src/hooks/queries.ts` (`useSearch`, `useForecast`,
  `useHourly`, `useHourlyRange`, `useImagery`); forecast/hourly keyed by rounded lat/lon.
  `useImagery` re-polls every ~60 s so overlays stay current (see gotcha #3).
- **Client UI state** → `src/store/appStore.tsx` (Context): `primary`, `comparison`
  (`SelectedLocation | null`), `activeLayers`, `opacity`, `focus`, `selectedDay` (the day open
  in the bottom expansion) and `selectedDayView` (`'hourly'` | `'confidence'` — which view that
  day shows), `activeSlot` (mobile A/B tap target), `aboutOpen` (info dialog), and the
  animation trio `animatingLayer` (layer id playing, or null), `frameIndex` (0 = newest), and
  `frameLoading`; actions `selectLocation`, `clearLocation`, `toggleLayer`, `setOpacity`,
  `toggleLayerAnimation`, `setFrameIndex`, `setFrameLoading`, `focusOn`, `selectDay`,
  `showDayConfidence`, `setActiveSlot`, `setAboutOpen`. `selectDay`/`showDayConfidence` set the
  view; `clearDay` leaves it untouched so the panel's close animation doesn't flip content mid-fade. Plain click → primary; Shift → comparison. `frameIndex` and
  `frameLoading` are driven by `MapView` (the animation clock / tile-load watcher); the control
  only reads them.
- **Startup seeding** → `useInitialLocation()` (called once from `App.tsx`) fills `primary` on
  load from browser geolocation, else `DEFAULT_LOCATION` (`src/lib/config.ts`); silent fallback,
  no persistence, never overrides an existing selection.

## Key files

```
src/api/{types.ts,client.ts}      typed contract (mirror ../meteo-aggregator-api models) + fetch
src/hooks/queries.ts              React Query hooks
src/hooks/useMediaQuery.ts        useMediaQuery / useIsMobile (max-width:767px) — desktop vs mobile
src/hooks/useInitialLocation.ts   seed primary on load (geolocation, else DEFAULT_LOCATION)
src/store/appStore.tsx            UI state (Context)
src/lib/weatherCode.ts            WMO code -> icon/label
src/lib/layerLegends.ts           static colour keys for RGB composite overlays
src/lib/config.ts                 DEFAULT_LOCATION (startup fallback)
src/components/map/MapView.tsx    MapLibre map: style, click+place-label select, markers, recenter, WMS overlays, time-lapse frame stack + clock
src/components/map/MapAnimateControl.tsx   floating time-lapse play/pause + frame time + loading spinner (single active layer)
src/components/search/{SearchBox,SearchPanel}.tsx   per-slot search + "+" add-comparison
src/components/panels/LocationCard.tsx              current + daily forecast card (w-max, grows so a day row never wraps)
src/components/locate/LocateButton.tsx              "use my location" (watchdog-bounded; see gotcha #10)
src/components/compare/ComparisonPanel.tsx          1 or 2 cards, fade in/out
src/components/layers/LayerControl.tsx              layer toggles, opacity, legends
src/components/hourly/{HourlyPanel,HourlyChart}.tsx per-day hourly sheet + inline SVG chart (adaptive density + hover/tap crosshair)
src/components/confidence/{ConfidenceDetail,ConfidenceTag}.tsx   per-model temps + blend weights + why the confidence level; the clickable tag (shared w/ mobile)
src/components/mobile/{MobileShell,MobileTopBar,WeatherSheet,MobileLayers}.tsx   mobile layout
src/components/about/{AboutDialog,AboutButton,aboutContent}.tsx   info / "how it works" page
src/App.tsx                       composition: map + (DesktopOverlays | MobileShell) + AboutDialog
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
`location-search`, `weather-display`, `location-comparison`, `satellite-layers`, `api-access`,
`info-page`. (The hourly view and mobile layout extend `weather-display`/`location-selection`
rather than adding their own spec.) Run `openspec list --specs` for the live count.

### Archived changes so far
`meteo-ui-mvp` → `add-comparison-search` → `add-layer-legends` → `vector-basemap`
→ `add-place-label-selection` → `dev-api-proxy` → `auto-refresh-overlays` → `add-deployment`
→ `add-rgb-color-keys` → `add-hourly-view` → `mobile-ui` → `add-default-location`
→ `add-info-page` → `add-locate-button` → `add-layer-animation` → `derive-info-page-layers`
→ `confidence-detail-view` → `interactive-hourly-chart` → `overlay-transparency`
→ `animate-control-clears-forecast` → `harden-locate-control`
(all under `openspec/changes/archive/`).

> Two small follow-ups to `add-info-page` (copy tightening, and worked examples in the
> aggregation section) shipped as direct commits on `main`, not separate changes — they refine
> content already covered by the `info-page` spec.

## Candidate next features (ideas raised, not yet specced)

- **Code-split** MapLibre to cut the initial bundle.
- **Comparison emphasis** — highlight the warmer/wetter side in `ComparisonPanel`.
- **Hover affordance** on place labels (cursor/highlight) to hint they're clickable.
- **Time-align mixed-cadence animation** — frames currently step by index, so animating layers of
  different cadence together isn't time-synced; the control sidesteps this by allowing only one
  layer at a time. Could snap each layer to the nearest frame for a shared target time.

## Notes

- Backend HTTP/response reference: `../meteo-aggregator-api/api/README.md`; models:
  `../meteo-aggregator-api/meteo_aggregator/models.py` — keep `src/api/types.ts` in sync.
