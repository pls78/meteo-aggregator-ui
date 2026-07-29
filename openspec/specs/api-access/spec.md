# api-access Specification

## Purpose
TBD - created by archiving change dev-api-proxy. Update Purpose after archive.
## Requirements
### Requirement: Same-origin backend access in every environment

The UI SHALL reach the backend through a same-origin `/api` path in both
development and production, rather than calling the backend's origin directly,
so that no cross-origin (CORS) configuration is required on the backend. In
development a dev-server proxy forwards `/api`; in production an edge function
served from the UI's own origin does.

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

The production build SHALL reach the deployed backend without affecting local
development, and without embedding the backend's address in the shipped bundle.
Both modes resolve `VITE_API_BASE_URL` to the same-origin `/api` base; what
differs is the forwarder. Development (`npm run dev`) uses the dev-server proxy
to a locally running backend. Production (`npm run build`) is served by an edge
function that forwards `/api` to the deployed backend, whose URL SHALL be read
from a platform secret at request time rather than from any committed file. The
two targets therefore never collide and no build-time flag is required.

#### Scenario: Development build targets the local backend

- **WHEN** the app runs via `npm run dev` (development mode)
- **THEN** requests use the `/api` base and are proxied to the local backend, and
  the deployed URL does not appear in the running app

#### Scenario: Production build targets the deployed backend

- **WHEN** the app is built via `npm run build` (production mode) and deployed
- **THEN** requests use the `/api` base on the deployed origin, and the edge
  function forwards them to the backend named by the deployment's secret

#### Scenario: No backend address in the shipped bundle

- **WHEN** the production bundle is inspected by anyone loading the site
- **THEN** it contains no absolute backend URL, because the address is resolved
  server-side by the edge function and never reaches the client

#### Scenario: Missing backend configuration is reported, not guessed

- **WHEN** the deployment has no backend URL configured
- **THEN** `/api` requests fail with an explicit server error identifying the
  missing configuration, rather than returning a 404 or a silent empty result

