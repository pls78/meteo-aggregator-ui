# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A map-driven weather UI: a full-screen MapLibre GL map where the user clicks (or searches) to
select a location and sees aggregated weather overlaid; `Shift`+click adds a second location
for side-by-side comparison; tapping a day opens an hour-by-hour bottom sheet for that day
(both locations overlaid when two are selected); satellite WMS layers can be toggled onto the
map. On load it seeds a starting location (browser geolocation, else a configured default), and
an info button opens a "how it works" page. Below the `md` breakpoint it switches to a
**mobile layout**: a draggable weather bottom sheet, an on-screen **A/B tap target** in place
of Shift+click, and a satellite-layers sheet. It is a pure frontend (Vite + React + TypeScript
+ Tailwind v4 + MapLibre GL) reading from the Python/FastAPI **meteo-aggregator-api**
backend in the sibling repo `../meteo-aggregator-api`.

## Node version

The toolchain (Vite 8 / create-vite) requires **Node ≥ 20.19** (use `v22`, see `.nvmrc`).
The default shell may be on Node 18, so run `nvm use` first or commands fail with a
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
cd ../meteo-aggregator-api && uvicorn api.main:app --reload
```

**CORS: never involved, in either mode.** The browser always calls `/api/*` on
its own origin. In dev, Vite's `server.proxy` forwards it; in production, the
Cloudflare Pages Function in `functions/api/` does. The backend still has an
`ALLOWED_ORIGINS` allow-list, but nothing in this app depends on it: the proxy
calls the backend server-side, where CORS does not apply.

## Deployment

Deployed as two free, separate services:

- **UI** → Cloudflare Pages (static, direct upload): <https://meteo-aggregator.pages.dev>
- **API** → your own Cloud Run (or any container host), reached only through the
  Pages Function proxy; the repo ships no backend URL

The API target is selected by Vite mode, so **local and deployed never collide**:

- `npm run dev` (development mode) → `.env` (`/api`) → dev proxy → **local** backend on `:8000`.
- `npm run build` (production mode) → `.env.production` (`/api`) → the Pages Function in `functions/api/` → backend.

Both modes are same-origin `/api`, so **CORS is never involved** and the bundle
contains no backend URL. The real URL is the `API_ORIGIN` secret on the
Cloudflare Pages project (`wrangler pages secret put`). Anything you put in a
`VITE_*` var is baked into the bundle and public, so never a secret.

Redeploy the UI:

```bash
nvm use && npm run build
npx wrangler pages deploy dist --project-name=meteo-aggregator
```

Prefer the stable `meteo-aggregator.pages.dev` URL for sharing, though per-deploy
`<hash>.…pages.dev` aliases now work fully too: every call is same-origin through
the Function, so no origin allow-list is involved. Set `API_ORIGIN` for the
preview environment as well (`--env preview`) or preview deploys return 503.

## Architecture

- **`src/api/`** — the typed contract. `types.ts` mirrors the backend pydantic models
  (`../meteo-aggregator-api/meteo_aggregator/models.py`), so **keep them in sync**. `client.ts`
  is a thin `fetch` wrapper (one function per endpoint).
- **`src/hooks/queries.ts`** — React Query hooks (`useSearch`, `useForecast`, `useHourly`,
  `useHourlyRange`, `useImagery`). Forecast/hourly query keys include rounded lat/lon so
  locations cache independently and aren't refetched on tiny coordinate changes. `useHourly`
  fetches 24 h for current conditions; `useHourlyRange` lazily fetches the full 168 h week,
  enabled only while a day is open in the hourly view.
- **`src/store/appStore.tsx`** — client UI state only (selected primary/comparison locations,
  active WMS layers, overlay opacity, map focus, `selectedDay` (the day open in the bottom
  expansion), `selectedDayView` (`'hourly'` | `'confidence'`, whether that day shows its hourly
  chart or its confidence detail), `activeSlot` (which slot a plain map tap fills), `aboutOpen`
  (the info dialog's visibility), and the time-lapse trio
  `animatingLayer`/`frameIndex`/`frameLoading` (the layer playing, its current frame, and
  whether that frame's tiles are still loading; the latter two driven by `MapView`).
  `activeSlot` is the mobile A/B target and stays `'primary'` on desktop, so plain-click/Shift
  are unchanged. Server data stays in React Query, never here.
- **`src/components/map/`** — `MapView` (the full-screen map + base tiles (CARTO **Positron**
  vector style — quiet ground so data leads) + markers + recenter +
  WMS overlays). Rotation and pitch are locked (kept north-up). A plain tap fills `activeSlot`;
  Shift+click always fills comparison. Active satellite layers are rendered imperatively in
  `MapView`; when one plays a time-lapse it mounts a preloaded raster layer per frame (see
  HANDOFF gotcha #3). `MapAnimateControl` is the floating play/pause control (single active layer).
  On desktop, the detail sheet always sits flush at the bottom; `DesktopOverlays` (App.tsx)
  watches the sheet with a `ResizeObserver` and lifts each bottom control (`LayerControl`,
  `MapAnimateControl`) above it by transform — only when the sheet's panel would actually
  overlap that control.
- **`src/components/`** (desktop overlays):
  - `search/SearchBox` accepts a `className` for width.
  - `panels/LocationCard` gives each day row two click targets: the day area opens the hourly
    view, the confidence tag opens the confidence detail. The card is **`w-max` between
    `min-w-72` and `max-w-[22rem]`, not a fixed width**, so it grows to fit its widest day and
    no row wraps; the day's values carry `whitespace-nowrap` to force that.
  - `compare/ComparisonPanel` lays out one or two cards and keeps them `shrink-0`, so a card
    that sized itself to its widest day is never squeezed back into wrapping.
  - `layers/LayerControl` exports `LayerLegend`/`RgbColorKey` for reuse.
  - `confidence/` holds `ConfidenceDetail` (per-model temperatures, blend weights, and a
    plain-language explanation of the level, all derived from the `/forecast` `breakdown` +
    `confidence`) and `ConfidenceTag` (the clickable label, shared with the mobile layout).
  - `hourly/` holds `HourlyPanel` (bottom sheet: hourly chart, or the confidence detail in the
    same slot) and `HourlyChart` (dependency-free inline SVG). The chart puts the temperature
    line and precipitation bars in **separate stacked panels** sharing one x-axis, never a
    dual-axis chart. It fills its container's width and adapts point density to it, from a
    point every 3 h when narrow up to every hour when wide, labels each point with its hour,
    and shows a crosshair + value on hover/tap.
- **`src/components/mobile/`** — the layout shown below the `md` breakpoint. `MobileShell`
  composes `MobileTopBar` (search + A/B target), `WeatherSheet` (draggable peek/half/full sheet
  with an A/B tab, embedding `HourlyChart`), and `MobileLayers` (Layers FAB + modal sheet).
  `WeatherSheet` is a **fixed-height (92vh) panel pushed down by `translateY`** — never animate
  its `height` (the settle transition is transform-only, disabled under reduced motion), and
  its scroll container pads its bottom by the off-screen portion so content stays reachable at
  every snap; keep both halves of that pairing if you touch the snap math.
- **`src/components/about/`** — the in-app info / "how it works" dialog (opened from an info
  button in both layouts; state via `appStore.aboutOpen`). `AboutDialog` is a light modal
  documenting features, data sources, the aggregation/weighting algorithm (with worked
  examples), and the satellite layers; `AboutButton` is the trigger; `aboutContent.ts` holds
  the static figures **transcribed from the backend `config.py`/`aggregation.py`**, so keep the
  models/weights in sync if the backend changes. The **satellite-layer list is derived from
  `GET /imagery`** (membership + cadence, via `lib/layerMeta.ts`); only per-layer editorial copy
  is hand-authored in `aboutContent.ts`'s `LAYER_INFO`, keyed by layer id with a fallback.
- **`src/components/locate/LocateButton.tsx`** — the "use my location" control, shared by both
  layouts. Defensive about the Geolocation API on purpose: `PositionOptions.timeout` does **not**
  cover the time the permission prompt is on screen, so an unanswered prompt calls neither
  callback. A **watchdog** (`WATCHDOG_MS`, set above the 8 s geolocation timeout so a normal
  failure reports itself first) bounds the wait. A fix arriving *after* the watchdog is still
  honoured; each request carries an id so a superseded one can't clobber a newer selection.
  The button is never `disabled` (re-entry is guarded in code) so it can't become a dead end,
  and it is `aria-disabled` only while resolving, **not** when blocked, since activating it
  then still explains why. `navigator.permissions` is **advisory only**: absent (older Safari)
  or rejected means fall back to the ordinary retryable path, never to claiming "blocked". The
  failure message persists until retried or dismissed. **Its `className` goes on the wrapper,
  not the button**, because the wrapper is `relative` so the message anchors to the control.
  That is why `MobileShell` places it with a positioning wrapper instead of passing `absolute` in.
- **`src/hooks/useMediaQuery.ts`** — `useMediaQuery`/`useIsMobile` (`max-width: 767px`).
  `App.tsx` renders `DesktopOverlays` or `MobileShell` over the shared `MapView` based on it.
- **`src/hooks/useInitialLocation.ts`** — on load, seeds the primary location from the browser
  geolocation, falling back silently to `DEFAULT_LOCATION` in **`src/lib/config.ts`** when it's
  denied/unavailable. Runs once per mount; never overrides an existing selection; no persistence.
- **`src/lib/weatherCode.ts`** — WMO `weather_code` → drawn glyph kind + label. Rendering
  lives in **`src/components/weather/`**: `glyphs.tsx` (13 monoline 24×24 glyphs; structure in
  `currentColor`, drops/flakes in the `precip` token, solar marks in the `sun` token) and
  `WeatherIcon` (HTML host) / `WeatherGlyph` (bare fragment for embedding inside the hourly
  chart's SVG). No emoji anywhere — the `visual-design` spec forbids them.
- **Design system** — the visual world is **"The Meteogram"** (consensus drawn over per-model
  spread). Tokens live in `src/index.css` (`@theme`: ink ramp, paper `surface`, `accent`/`loc-a`
  consensus blue, `loc-b` reserved red, `conf-*`, `precip`, `sun`, `hairline`, shadows, and the
  `panel`/`skeleton` utilities); **components must consume tokens — no raw palette utilities or
  hex in component code**. `src/lib/accents.ts` is the one source for the A/B pair.
  `src/components/panels/SpreadStrip.tsx` draws each day row's model spread on a **shared week
  scale** (`spreadExtent`). Authorities: `DESIGN.md` (+ `.impeccable/design.json`) for the
  system, `PRODUCT.md` for product truth, `openspec/specs/visual-design/` for requirements —
  keep all three in sync when the look changes.

> **Two layouts, one behavior:** presentation of selection / weather / layers is duplicated
> across the desktop overlays and `src/components/mobile/`. Changing one usually means changing
> the other. The map, store, and React Query hooks are shared, so keep behavior in those.
> The `index.html` viewport is intentionally locked (`maximum-scale=1, user-scalable=no`) so the
> map owns zoom; without it iOS zooms into focused inputs and never restores. Don't re-enable it.

### Backend contract (consumed, not owned here)

Four keyless GET endpoints; full reference in `../meteo-aggregator-api/api/README.md`:

| Endpoint | Notes |
|----------|-------|
| `GET /search?name` | `Place[]` — name → coordinates for the search box |
| `GET /forecast?lat&lon&days` | daily consensus; `values` keyed by variable, plus `confidence` + per-model `breakdown` |
| `GET /hourly?lat&lon&hours` | hourly consensus; **`hours[0]` = current conditions** (`/forecast` has only daily max/min). Timestamps are **location-local** (backend uses `timezone=auto`), matching the daily `date`, so the hourly view groups hours under a tapped day via `date.slice(0,10)`. **Do not** assume UTC here |
| `GET /imagery?time&frames` | EUMETSAT WMS layer params (`EPSG:3857`, transparent PNG). Each layer has `time` and a `times` array (`frames` recent frames, newest first; `time === times[0]`) for the time-lapse. Tiles are fetched **directly from EUMETSAT by the browser**, not proxied; `time: null` ⇒ WMS serves the latest image |

`values` is `Record<string, number | string | null>`; `weather_code` is a WMO code, and
`sunrise`/`sunset` are strings (non-blendable). Units are metric throughout.

## Conventions

- Metric units only. No auth, no i18n.
- `tsconfig` uses `verbatimModuleSyntax`, so import types with `import type`.

## OpenSpec workflow (spec-driven)

This repo uses OpenSpec, like the backend. Specs and change proposals live in `openspec/`.
Don't add features ad hoc; go through a change:

- `/opsx:propose "<idea>"` (or `openspec new change <name>`) → author `proposal.md`,
  `specs/<capability>/spec.md`, `design.md`, `tasks.md`.
- `/opsx:apply <name>` → implement the tasks, checking them off as you go.
- `/opsx:archive <name>` → archive once complete (syncs delta specs into `openspec/specs/`).
- `openspec list` / `openspec validate <name>` / `openspec status --change <name>` to inspect.

The initial build is captured by the `meteo-ui-mvp` change.
