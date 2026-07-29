// Cloudflare Pages Function: same-origin proxy in front of the weather backend.
//
// The browser calls /api/* on this origin and never learns where the backend
// actually lives — the URL exists only as the API_ORIGIN secret on the Pages
// project. This mirrors the dev setup exactly (Vite proxies /api and strips the
// prefix, see vite.config.ts), so dev and production share one code path and
// CORS is never involved in either.
//
// It also absorbs traffic: responses are cached at the edge and abusive clients
// are cut off here rather than spinning up billable backend instances.

const WINDOW_MS = 60_000 // rate-limit window
const MAX_REQUESTS = 60 // per IP per window — far above real UI use
const EDGE_CACHE_SECONDS = 300 // forecasts update hourly; 5 min is conservative
const BROWSER_CACHE_SECONDS = 60
const UPSTREAM_TIMEOUT_MS = 20_000 // matches the backend's own request timeout
const MAX_TRACKED_IPS = 10_000 // bound memory if an isolate sees many clients

/**
 * Per-IP sliding window, held in isolate memory. A backstop, NOT a real limiter.
 *
 * Measured 2026-07-29: 75 cache-busting requests from one IP in a tight loop did
 * not trigger it, because Cloudflare spreads requests across isolates and each
 * gets its own counter. It only catches a burst that happens to land on one
 * isolate. Accurate per-IP limiting needs shared state — Durable Objects (paid)
 * or a custom domain with a WAF rate-limiting rule (free, one rule per zone);
 * KV is unusable here at ~1k writes/day on the free tier.
 *
 * What actually bounds cost: the edge cache below (repeat queries never reach
 * the backend) and Cloud Run's --max-instances 1.
 */
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

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}

export async function onRequest(context) {
  const { request, env } = context

  // The API is read-only; anything else is a mistake or a probe.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json(405, { detail: 'Method not allowed' }, { allow: 'GET, HEAD' })
  }

  if (!env.API_ORIGIN) {
    // Misconfiguration, not a client error — say so plainly rather than 404ing.
    return json(503, {
      detail: 'API_ORIGIN is not configured on this Pages project.',
    })
  }

  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  if (isRateLimited(ip, Date.now())) {
    return json(429, { detail: 'Too many requests' }, { 'retry-after': '60' })
  }

  // /api/forecast?lat=… -> <API_ORIGIN>/forecast?lat=…
  const incoming = new URL(request.url)
  const path = incoming.pathname.replace(/^\/api/, '') || '/'
  const target = new URL(path + incoming.search, env.API_ORIGIN)

  // Cloudflare does NOT cache Worker/Function responses automatically — with
  // only Cache-Control set, cf-cache-status comes back DYNAMIC and every request
  // reaches the backend. So write to the edge cache explicitly. The key is this
  // request's own URL (same origin, as the Cache API requires); responses vary
  // by query string alone, so all clients share one entry.
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
    upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError'
    return json(timedOut ? 504 : 502, {
      detail: timedOut ? 'Upstream timed out' : 'Upstream request failed',
    })
  }

  const response = new Response(upstream.body, upstream)
  response.headers.delete('access-control-allow-origin') // same-origin now
  response.headers.set('x-proxy-cache', 'MISS')
  response.headers.set(
    'cache-control',
    upstream.ok
      ? `public, max-age=${BROWSER_CACHE_SECONDS}, s-maxage=${EDGE_CACHE_SECONDS}`
      : 'no-store',
  )

  if (upstream.ok) context.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}
