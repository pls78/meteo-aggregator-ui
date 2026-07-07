# api-access Specification

## Purpose
TBD - created by archiving change dev-api-proxy. Update Purpose after archive.
## Requirements
### Requirement: Same-origin backend access in development

In development the UI SHALL reach the backend through a same-origin path (a
dev-server proxy) rather than calling the backend's origin directly, so that
development requires no cross-origin (CORS) configuration on the backend.

#### Scenario: Data requests are same-origin in dev

- **WHEN** the dev server is running and the user triggers a data request
  (search, forecast, hourly, or imagery)
- **THEN** the browser issues the request to the dev server's own origin under
  `/api`, which transparently proxies it to the backend — no cross-origin request
  is made

#### Scenario: No backend CORS needed in dev

- **WHEN** the backend has no CORS allow-list entry for the UI's dev origin
- **THEN** data requests still succeed in development, because they are
  same-origin to the dev server

### Requirement: Configurable API base URL

The UI SHALL resolve the backend base URL from `VITE_API_BASE_URL`, defaulting to
the relative path `/api`, so a deployment can use a same-origin route (the
default) or point at an absolute backend URL without code changes.

#### Scenario: Default relative base

- **WHEN** `VITE_API_BASE_URL` is not set
- **THEN** requests are built against the relative `/api` base, resolved on the
  page's own origin

#### Scenario: Absolute base override

- **WHEN** `VITE_API_BASE_URL` is set to an absolute URL
- **THEN** requests target that origin directly (e.g. a cross-origin production
  backend)

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

