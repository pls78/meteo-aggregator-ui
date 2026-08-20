# Tasks: proxy-wms-tiles

## 1. Edge proxy

- [x] 1.1 Add `functions/wms.js`: GET/HEAD-only same-origin proxy to the fixed
  `https://view.eumetsat.int/geoserver/wms`, forwarding the query string verbatim;
  explicit `caches.default` caching (long TTL when `time=` present, short otherwise
  and for legends; `no-store` on non-OK), `x-proxy-cache` HIT/MISS header, per-IP
  backstop rate limit sized for tile fan-out (600/min)

## 2. Dev parity

- [x] 2.1 Add `/wms` entry to the Vite dev proxy in `vite.config.ts`, rewriting to
  `/geoserver/wms` on `https://view.eumetsat.int`

## 3. Client URL builders

- [x] 3.1 Rewrite `wmsTileUrl()` in `src/components/map/MapView.tsx` to build on the
  relative `/wms` base instead of `params.wms_url`
- [x] 3.2 Rewrite `legendUrl()` in `src/components/layers/LayerControl.tsx` to build
  on the relative `/wms` base instead of `params.wms_url`

## 4. Verify

- [x] 4.1 `npm run dev`: toggle a satellite layer — tiles render via `/wms` on the
  dev origin; legend loads; animation plays
- [x] 4.2 Build and deploy to Cloudflare Pages; on the live site confirm tiles render,
  repeat tile requests return `x-proxy-cache: HIT`, and no request goes to
  `view.eumetsat.int` from the browser
- [x] 4.3 Update the docs the change touches (README architecture note if it mentions
  direct EUMETSAT tile fetches)
