# meteo-aggregator-ui

A map-driven weather UI for the [meteo-aggregator](../meteo-aggregator) backend.
A full-screen MapLibre GL map: click (or search, or click a place label) to select
a location and see the aggregated multi-model forecast; `Shift`+click adds a second
location for side-by-side comparison; tap a day in the forecast to open its
hour-by-hour breakdown in a bottom sheet (temperature, precipitation, weather
icons), with both locations overlaid on one chart when two are selected; toggleable
EUMETSAT satellite WMS overlays.

Pure frontend — Vite + React 19 + TypeScript + Tailwind v4 + MapLibre GL — talking
directly to the FastAPI backend over HTTP. See [`CLAUDE.md`](CLAUDE.md) for
architecture and the backend contract.

**Live:** <https://meteo-aggregator.pages.dev>

## Node version

The toolchain (Vite 8) requires **Node ≥ 20.19** — use **Node 22** (`.nvmrc` pins
`22.22.1`). The shell often defaults to Node 18, which breaks the build, so run
`nvm use` first.

## Develop

```bash
nvm use            # Node 22
npm install
npm run dev        # http://localhost:5173
```

The UI needs the backend running for data. In dev, Vite proxies `/api` to it
(same-origin, so no backend CORS is needed):

```bash
cd ../meteo-aggregator && uvicorn api.main:app --reload   # http://localhost:8000
```

Other scripts: `npm run build` (typecheck + production build), `npm run lint`
(oxlint), `npm run preview` (serve the production build).

## API target: local vs. deployed

Which backend the UI calls is selected by Vite's mode-based env files — the two
never collide:

| Command | Mode | API target | Mechanism |
|---------|------|-----------|-----------|
| `npm run dev` | development | **local** `:8000` | `.env` (`VITE_API_BASE_URL=/api`) → Vite dev proxy |
| `npm run build` | production | **deployed** Cloud Run | `.env.production` (committed) |

`.env` is gitignored (personal/local); `.env.production` is committed and holds
the public API URL (no secret). To retarget the deployed build, edit
`.env.production`. See [`.env.example`](.env.example).

## Deploy

The build is fully static; it's hosted on **Cloudflare Pages** (direct upload —
no Git integration required):

```bash
nvm use
npm run build                                                   # bakes in .env.production's API URL
npx wrangler pages deploy dist --project-name=meteo-aggregator  # -> https://meteo-aggregator.pages.dev
```

Use the stable production URL `https://meteo-aggregator.pages.dev`. Cloudflare
also mints a per-deploy `<hash>.meteo-aggregator.pages.dev` alias — don't rely on
it: it changes every upload and is not on the backend's CORS allow-list.

> After changing the deployed UI origin, update the backend's `ALLOWED_ORIGINS`
> (see [`../meteo-aggregator/api/README.md`](../meteo-aggregator/api/README.md#browser-clients-cors)),
> or browser calls will be blocked by CORS.
