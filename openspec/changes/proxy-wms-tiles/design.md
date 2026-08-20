# Design: proxy-wms-tiles

## Context

MapLibre raster sources fetch tiles with `fetch(…, {mode: 'cors'})` because the
pixels feed WebGL textures. EUMETSAT's GeoServer at `view.eumetsat.int` now returns
GetMap PNGs without `Access-Control-Allow-Origin` (verified 2026-08-20: OPTIONS
preflight and GetCapabilities XML still send `access-control-allow-origin: *`, image
responses send nothing), so the browser discards every tile. Nothing in our repos
changed; the upstream did.

The repo already solves this exact problem for the weather backend: same-origin
`/api` in both environments — Vite proxy in dev, `functions/api/[[path]].js` at the
edge in production, with explicit `caches.default` writes because Cloudflare never
auto-caches Function responses. This change clones that shape for WMS traffic.

## Goals / Non-Goals

**Goals:**

- Satellite tiles and legends load again in production, unaffected by upstream CORS
  policy from now on.
- Same code path in dev and prod (one `/wms` base, different forwarder), like `/api`.
- Not an open proxy: only the fixed EUMETSAT WMS endpoint is reachable through it.
- Tile responses cached at the Cloudflare edge and shared across viewers.

**Non-Goals:**

- No backend/API change; `/imagery` keeps returning `wms_url` (other clients may use
  it directly, and the field documents provenance).
- No general multi-upstream imagery proxy — one hardcoded upstream is the feature.
- No attempt to hide the upstream (it's public data; unlike `API_ORIGIN` there is
  nothing to protect), so the upstream URL can be a constant, not a secret.

## Decisions

- **Proxy route `functions/wms.js` (single path, not `[[path]]`)** — WMS is one
  endpoint addressed entirely by query string (`request=GetMap|GetLegendGraphic`),
  so `/wms?query` needs no path splat. The function forwards
  `https://view.eumetsat.int/geoserver/wms` + the incoming query string, verbatim.
  *Alternative — reuse the `/api` function with a special prefix*: rejected; it
  targets `API_ORIGIN` (Cloud Run) and its 60/min rate limit and JSON error model
  don't fit image fan-out.
- **Client builds `/wms` URLs, ignoring `params.wms_url` as origin** — `wmsTileUrl()`
  and `legendUrl()` build on the relative `/wms` base. Legends aren't CORS-blocked
  today (plain `<img>`), but routing them the same way keeps one code path and
  removes the last direct EUMETSAT dependency in the client.
- **Dev parity via Vite proxy** — `'/wms': { target: 'https://view.eumetsat.int', changeOrigin: true, rewrite: /wms → /geoserver/wms }`.
  Dev traffic goes straight to EUMETSAT server-side, so dev needs no Pages Function
  emulation.
- **Edge caching by full request URL, long TTL for timestamped requests** — requests
  carrying an explicit `time=` parameter are immutable frames: cache
  `s-maxage=604800` (upstream's own max-age) and browser `max-age=3600`.
  Requests without `time` (latest image, mutable) and legends get `s-maxage=300`/
  browser 60s — within one cadence, cheap to refresh. Same explicit
  `caches.default.match/put` dance as the `/api` function (Cloudflare does not cache
  Function responses on its own).
- **Rate limiting: keep the isolate-local backstop but sized for tiles** — 600/min
  per IP (a 12-frame animation preload is ~150 requests). Same known limitation as
  `/api`: per-isolate counters, a backstop not a limiter; the edge cache is the real
  cost bound.
- **GET/HEAD only, upstream errors passed through, `no-store` on non-OK** — as in
  the `/api` function.

## Risks / Trade-offs

- [Every tile counts against the Workers free tier (100k req/day) even on cache
  hits] → Long-TTL edge caching keeps upstream fetches rare; current traffic is a
  tiny fraction of the quota. If it ever grows, a custom domain + Cache Rules on a
  `/wms` route could serve hits without invoking the function.
- [Query string forwarded verbatim could be abused to hammer EUMETSAT with varied
  requests] → The upstream host is fixed, GET-only, rate-limit backstop applies, and
  varied queries were equally possible against EUMETSAT directly; the proxy adds no
  new capability beyond origin laundering for a public endpoint.
- [Upstream latency now includes a Cloudflare hop] → Negligible against GeoServer
  render time; edge cache makes repeat viewports faster than direct fetches were.
- [EUMETSAT could restore CORS, leaving the proxy redundant] → Harmless; same-origin
  remains correct and is how `/api` already works. No reason to revert.

## Migration Plan

1. Deploy UI with the new function and rewritten URL builders (one Pages deploy).
2. Verify live: tiles render, `x-proxy-cache` HIT on repeat, legends load.
3. Rollback = redeploy previous build; no state, no backend involvement.

## Open Questions

None.
