## Why

The UI is ready to publish for personal use, but the production build and local
development shared one `VITE_API_BASE_URL`, so pointing the deployed build at the
hosted API risked breaking the local dev loop (which relies on the `/api` dev
proxy to a local backend). We want the deployed build to target the hosted API
while `npm run dev` keeps talking to the local backend — with no build-time flag
to remember.

## What Changes

- Add a committed `.env.production` (`VITE_API_BASE_URL` = the deployed Cloud Run
  API URL). Vite loads it only for `npm run build` (production mode), overriding
  the generic `.env`, so development is unaffected.
- Document the local-vs-deployed split in `.env.example`, `README.md`, and
  `CLAUDE.md`.
- Deploy the static build to Cloudflare Pages (<https://meteo-aggregator.pages.dev>).

## Capabilities

### New Capabilities
<!-- None — this refines how an existing capability resolves its target. -->

### Modified Capabilities
- `api-access`: the API target is now environment-selected — development uses the
  dev proxy, and the production build reads the deployed URL from a committed
  `.env.production` — so local and deployed never collide.

## Impact

- **New files:** `.env.production` (public URL, no secret). `.env` stays gitignored.
- **Hosting:** Cloudflare Pages (static direct upload); no Git integration needed.
- **No breaking changes** — dev behavior is unchanged; only the production build's
  API target is now pinned to the deployed backend.
