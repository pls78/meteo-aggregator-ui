# Proposal: proxy-wms-tiles

## Why

EUMETSAT's `view.eumetsat.int` WMS stopped sending `Access-Control-Allow-Origin` on
GetMap image responses (preflight and XML responses still carry it; images do not).
MapLibre fetches raster tiles in CORS mode because WebGL needs pixel access, so the
browser now blocks every tile and no satellite layer loads in production. The map's
core satellite feature is dead until tiles stop being a cross-origin fetch.

## What Changes

- Add a same-origin `/wms` route that forwards WMS requests to the fixed
  `https://view.eumetsat.int/geoserver/wms` upstream: a Cloudflare Pages Function in
  production (mirroring the existing `/api` proxy, with explicit edge caching) and a
  Vite dev-server proxy entry in development.
- Rewrite the UI's WMS URL builders (`wmsTileUrl` in MapView, `legendUrl` in
  LayerControl) to target the same-origin `/wms` path instead of `params.wms_url`
  directly. The backend's `wms_url` field stays in the API response but the client no
  longer dials it.
- Cache tiles aggressively at the edge: frames are keyed by an explicit `time`
  parameter and immutable, so cached tiles are shared across all viewers.

## Capabilities

### New Capabilities

- `wms-proxy`: same-origin edge forwarding of satellite WMS requests (tiles and
  legends) to the allow-listed EUMETSAT upstream, with edge caching and no open-proxy
  surface.

### Modified Capabilities

- `satellite-layers`: the "Toggle a layer on" scenario states tiles are "fetched
  directly from the EUMETSAT WMS endpoint"; it changes to fetching through the
  same-origin WMS route. The legend requirement's GetLegendGraphic likewise goes
  through the same route.

## Impact

- `functions/wms.js` (new Pages Function), `vite.config.ts` (dev proxy entry),
  `src/components/map/MapView.tsx`, `src/components/layers/LayerControl.tsx`.
- No backend (`meteo-aggregator-api`) change: `/imagery` keeps returning `wms_url`;
  the UI just stops using it as the fetch origin.
- Pages Function request volume grows (every tile now invokes the function). Free-tier
  budget is 100k requests/day; a full animation preload is ~150 tile requests, and
  edge cache hits still count as invocations. Acceptable for current traffic; noted in
  design.
- The `/api` function's per-IP rate limit (60/min) is far too low for tile fan-out;
  `/wms` gets its own, much higher backstop instead of reusing that number.
