## 1. Environment separation

- [x] 1.1 Add committed `.env.production` with `VITE_API_BASE_URL` = the deployed
  Cloud Run API URL (loaded only by `npm run build`)
- [x] 1.2 Document the dev-vs-prod split in `.env.example`

## 2. Deploy

- [x] 2.1 Build (`npm run build`) and deploy `dist/` to Cloudflare Pages via
  `wrangler pages deploy` (project `meteo-aggregator`)
- [x] 2.2 Verify: production bundle targets the Cloud Run URL; dev build stays on
  `/api`; live UI loads and calls the API without CORS errors

## 3. Docs

- [x] 3.1 Replace the template `README.md` with a real one (dev, deploy, env split)
- [x] 3.2 Update `CLAUDE.md` and `HANDOFF.md` with the deployment story and the
  per-deploy-alias CORS gotcha
