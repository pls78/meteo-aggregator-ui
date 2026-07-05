## 1. Vite dev proxy

- [x] 1.1 In `vite.config.ts`, switch to the `defineConfig(({ mode }) => …)` form
      and read `VITE_API_PROXY_TARGET` via `loadEnv` (default `http://localhost:8000`)
- [x] 1.2 Add `server.proxy` for `/api`: `{ target, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') }`

## 2. API client relative base

- [x] 2.1 In `src/api/client.ts`, default the base to `/api` (`VITE_API_BASE_URL ?? '/api'`)
- [x] 2.2 Build request URLs as `new URL(BASE_URL + path, window.location.origin)`
      so a relative base resolves (absolute base still works)

## 3. Env & config

- [x] 3.1 Update `.env`: `VITE_API_BASE_URL=/api` and `VITE_API_PROXY_TARGET=http://localhost:8000`
- [x] 3.2 Add `.env.example` documenting both vars (dev default + prod note)

## 4. Docs

- [x] 4.1 Update the `CLAUDE.md` backend/CORS note: dev uses the Vite proxy
      (same-origin, no CORS); prod cross-origin still needs CORS or a same-origin
      `/api` route
- [x] 4.2 Note in `CLAUDE.md` that the backend's `:5173` dev CORS allow-list is
      now unnecessary for dev (sibling-repo follow-up)

## 5. Verify

- [x] 5.1 `nvm use` then `npm run build` and `npm run lint` pass
- [x] 5.2 Live check: with the backend reachable, search/forecast/hourly/imagery
      all load through `/api` in dev (Network tab shows requests to `:5173/api/*`)
      — verified by the user
