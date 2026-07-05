## Why

In development the browser calls the FastAPI backend cross-origin
(`http://localhost:5173` → `http://localhost:8000`), so the browser enforces CORS
and the backend must maintain an allow-list of the UI's dev origin — without it,
every data request fails. That couples the backend to the UI's dev host/port for
no functional reason. A Vite dev-server proxy lets the browser reach the backend
**same-origin** (through `:5173`), so no CORS is involved in development.

## What Changes

- Add a `server.proxy` entry in `vite.config.ts`: `/api/*` is proxied to the
  backend (target from `VITE_API_PROXY_TARGET`, default `http://localhost:8000`),
  stripping the `/api` prefix (the backend serves `/search`, `/forecast`, … with
  no prefix).
- Change `src/api/client.ts` to a **relative** base URL: `VITE_API_BASE_URL ?? '/api'`,
  and build request URLs against `window.location.origin` so a relative base
  resolves (today the client assumes an absolute base).
- Update `.env` and add `.env.example`: `VITE_API_BASE_URL=/api`,
  `VITE_API_PROXY_TARGET=http://localhost:8000`.
- Update `CLAUDE.md`: dev no longer needs backend CORS; note the prod caveat
  (cross-origin prod still needs CORS or a same-origin `/api` route).
- **No user-facing behavior change** (same endpoints, payloads, and UI). It does
  introduce the `api-access` capability, which captures *how* the UI reaches the
  backend: a configurable base URL (relative `/api` by default) plus a same-origin
  dev-server proxy.
- **Backend (sibling repo, out of scope here):** the `:5173` dev CORS allow-list
  becomes unnecessary for development; removing/narrowing it is a follow-up in
  `../meteo-aggregator`, not part of this frontend change.

## Capabilities

### New Capabilities
- `api-access`: how the UI reaches the backend — a configurable API base URL
  (relative `/api` by default) and a same-origin dev-server proxy, so development
  needs no backend CORS.

### Modified Capabilities
<!-- None — endpoints, payloads, and UI behavior are unchanged; this changes only
     HOW the dev browser reaches the backend (same-origin proxy instead of
     cross-origin + CORS). weather-display, location-search, satellite-layers,
     location-selection, location-comparison, and map-view keep their existing
     requirements. -->

## Impact

- **UI code:** `vite.config.ts` (+`server.proxy`), `src/api/client.ts` (relative
  base + `window.location.origin` URL construction).
- **Config:** `.env` (`VITE_API_BASE_URL=/api`, `VITE_API_PROXY_TARGET`), new
  `.env.example`.
- **Docs:** `CLAUDE.md` backend-dependency / CORS note.
- **External services:** none — EUMETSAT WMS tiles are still fetched directly by
  the browser, unaffected.
- **No API contract, model, or payload changes.** Backend CORS cleanup is a
  separate sibling-repo follow-up.
