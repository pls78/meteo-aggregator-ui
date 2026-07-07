## ADDED Requirements

### Requirement: Environment-selected API target

The production build SHALL target the deployed backend without affecting local
development. `VITE_API_BASE_URL` SHALL be resolved per Vite mode: development
(`npm run dev`) uses the dev-proxy base (`/api`), while the production build
(`npm run build`) SHALL read the deployed backend's absolute URL from a committed
`.env.production`. The two targets therefore never collide and no build-time flag
is required.

#### Scenario: Development build targets the local backend

- **WHEN** the app runs via `npm run dev` (development mode)
- **THEN** requests use the `/api` base and are proxied to the local backend, and
  the deployed URL does not appear in the running app

#### Scenario: Production build targets the deployed backend

- **WHEN** the app is built via `npm run build` (production mode)
- **THEN** requests target the deployed backend's absolute URL taken from
  `.env.production`
