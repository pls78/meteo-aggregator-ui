// Cloudflare Pages Function: same-origin proxy in front of the EUMETSAT WMS.
//
// The browser fetches satellite tiles and legends from /wms on this origin;
// this function forwards the query string verbatim to the one fixed upstream
// below. It exists because view.eumetsat.int stopped sending
// Access-Control-Allow-Origin on GetMap image responses (2026-08), and MapLibre
// fetches raster tiles in CORS mode (WebGL needs pixel access) — so direct
// cross-origin tile fetches are blocked by the browser. Same-origin sidesteps
// the upstream's CORS policy for good, and mirrors how /api already works
// (functions/api/[[path]].js). The upstream is public data, so unlike
// API_ORIGIN it is a constant, not a secret — and hardcoding it means this can
// never be used as an open proxy.

const UPSTREAM = 'https://view.eumetsat.int/geoserver/wms'

const WINDOW_MS = 60_000 // rate-limit window
const MAX_REQUESTS = 600 // per IP per window — a 12-frame animation preload is ~150 tiles
const UPSTREAM_TIMEOUT_MS = 20_000
const MAX_TRACKED_IPS = 10_000 // bound memory if an isolate sees many clients

// Frames pinned by an explicit time= are immutable: cache them for the
// upstream's own 7 days and let browsers hold them an hour. Requests without
// time (the mutable "latest" image) and legends refresh within one cadence.
const PINNED_EDGE_SECONDS = 604_800
const PINNED_BROWSER_SECONDS = 3_600
const MUTABLE_EDGE_SECONDS = 300
const MUTABLE_BROWSER_SECONDS = 60

// Per-IP sliding window, held in isolate memory. A backstop, NOT a real
// limiter — see functions/api/[[path]].js for the measured caveats. The edge
// cache below is what actually bounds upstream traffic.
const hits = new Map()

function isRateLimited(ip, now) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)

  if (hits.size > MAX_TRACKED_IPS) {
    for (const [key, times] of hits) {
      if (times[times.length - 1] < now - WINDOW_MS) hits.delete(key)
    }
  }
  return recent.length > MAX_REQUESTS
}

export async function onRequest(context) {
  const { request } = context

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { allow: 'GET, HEAD' },
    })
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (isRateLimited(ip, Date.now())) {
    return new Response('Too many requests', {
      status: 429,
      headers: { 'retry-after': '60' },
    })
  }

  // /wms?<query> -> <UPSTREAM>?<query>, nothing else. Responses vary by query
  // string alone, so all clients share one cache entry per tile.
  const incoming = new URL(request.url)
  const target = UPSTREAM + incoming.search

  const cache = caches.default
  const cacheKey = new Request(incoming.toString(), { method: 'GET' })
  const cached = await cache.match(cacheKey)
  if (cached) {
    const hit = new Response(cached.body, cached)
    hit.headers.set('x-proxy-cache', 'HIT')
    return hit
  }

  let upstream
  try {
    upstream = await fetch(target, {
      method: 'GET',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError'
    return new Response(timedOut ? 'Upstream timed out' : 'Upstream request failed', {
      status: timedOut ? 504 : 502,
    })
  }

  // GeoServer reports WMS errors as HTTP 200 XML (ServiceException); caching
  // one of those for a week would pin a broken tile. Only images are cacheable.
  const isImage = (upstream.headers.get('content-type') ?? '').startsWith('image/')
  const cacheable = upstream.ok && isImage

  const pinned = incoming.searchParams.has('time')
  const response = new Response(upstream.body, upstream)
  response.headers.set('x-proxy-cache', 'MISS')
  response.headers.set(
    'cache-control',
    cacheable
      ? pinned
        ? `public, max-age=${PINNED_BROWSER_SECONDS}, s-maxage=${PINNED_EDGE_SECONDS}`
        : `public, max-age=${MUTABLE_BROWSER_SECONDS}, s-maxage=${MUTABLE_EDGE_SECONDS}`
      : 'no-store',
  )

  if (cacheable) context.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}
