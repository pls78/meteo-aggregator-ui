## Context

The UI is a pure frontend (Vite + React) that calls the FastAPI aggregator over
HTTP. In dev, Vite serves the app on `:5173` and the backend runs on `:8000` —
different origins, so the browser enforces CORS and the backend must return
`Access-Control-Allow-Origin: http://localhost:5173`. `src/api/client.ts` builds
absolute URLs from `VITE_API_BASE_URL` (default `http://localhost:8000`) via
`new URL(BASE_URL + path)`, which requires an absolute base.

## Goals / Non-Goals

**Goals:**
- Eliminate the dev-time CORS dependency: the dev browser reaches the backend
  same-origin (via `:5173`).
- Keep prod flexible: `VITE_API_BASE_URL` can still point at an absolute backend
  URL.
- No change to endpoints, payloads, or UI behavior.

**Non-Goals:**
- Backend changes — the CORS allow-list lives in `../meteo-aggregator`; cleanup
  is a follow-up there.
- Proxying the EUMETSAT WMS tiles (still fetched directly by the browser).
- Deciding the prod deployment topology (documented as a caveat, not implemented).

## Decisions

**1. Vite `server.proxy` for `/api`, prefix stripped.**
Map `/api` → `VITE_API_PROXY_TARGET` (default `http://localhost:8000`) with
`changeOrigin: true` and `rewrite: (p) => p.replace(/^\/api/, '')`, because the
backend serves bare paths (`/search`, …). The client uses an `/api` prefix (not
bare `/search`) so the proxy rule is unambiguous and won't shadow the SPA's own
routes or static assets.
- *Alternative:* proxy each bare path (`/search`, `/forecast`, …) — rejected:
  brittle, must track every endpoint, and risks colliding with app routes.

**2. Relative API base `/api`, resolved against `window.location.origin`.**
`client.ts`: `BASE_URL = (VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')`, and
build URLs as `new URL(BASE_URL + path, window.location.origin)`. The second
argument lets a **relative** base resolve while being ignored for an **absolute**
base — so dev (`/api`) and a prod absolute URL both work through one code path.
- *Alternative:* keep the absolute default `http://localhost:8000` — rejected:
  that is exactly the cross-origin coupling being removed.

**3. Proxy target is its own env var (`VITE_API_PROXY_TARGET`).**
The client base (`VITE_API_BASE_URL`, now `/api`) and the dev proxy target (the
real backend host) are different concerns and cannot share one variable.
`vite.config.ts` reads it via `loadEnv` (Node side; not exposed to the client).

## Risks / Trade-offs

- **[Prod still cross-origin]** The proxy is **dev-only** (Vite dev server). If
  prod serves UI and API on different origins, prod still needs backend CORS (or
  set `VITE_API_BASE_URL` to the absolute prod API URL). → Documented in
  `CLAUDE.md`; the relative-`/api` default is correct when prod reverse-proxies
  `/api` to the backend (same-origin), the recommended topology.
- **[Backend prefix drift]** If the backend later adopts its own `/api` prefix,
  the `rewrite` strip must be dropped. → One-line change, noted in the proxy
  comment.
- **[`window.location` availability]** client.ts runs only in the browser (no SSR
  here), so `window.location.origin` is always defined.

## Migration Plan

1. Add the proxy + relative base + env vars.
2. `npm run dev`; confirm all four endpoints load through `/api` even with the
   backend's `:5173` CORS allow-list removed — proving no CORS dependency.
3. `npm run build` + `npm run lint`.

Rollback: revert `client.ts` to the absolute default and delete the `server.proxy`
block — no data or contract migration is involved.
