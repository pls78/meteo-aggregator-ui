# wms-proxy Specification (delta)

## ADDED Requirements

### Requirement: Same-origin WMS access in every environment

The UI SHALL reach the satellite WMS through a same-origin `/wms` path in both
development and production, rather than calling the WMS origin directly, so that
tile and legend loading does not depend on the upstream's CORS policy. In
development a dev-server proxy forwards `/wms` to the WMS upstream; in production
an edge function served from the UI's own origin does.

#### Scenario: Tile requests are same-origin

- **WHEN** a satellite overlay is active and the map requests its tiles
- **THEN** the browser issues the requests to the page's own origin under `/wms`,
  which forwards them to the WMS upstream — no cross-origin request is made

#### Scenario: Upstream without CORS headers still renders

- **WHEN** the WMS upstream serves image responses without any
  `Access-Control-Allow-Origin` header
- **THEN** active satellite overlays still render, because the browser only ever
  fetches tiles same-origin

### Requirement: Fixed upstream, not an open proxy

The `/wms` route SHALL forward only to the single, fixed EUMETSAT WMS endpoint,
passing the request's query string through to it, and SHALL accept only GET and
HEAD requests. The route SHALL NOT derive the upstream host from any part of the
request.

#### Scenario: Query string is forwarded to the fixed upstream

- **WHEN** the route receives `/wms?<query>`
- **THEN** it requests the fixed EUMETSAT WMS endpoint with `<query>` and returns
  that response

#### Scenario: Non-read methods are rejected

- **WHEN** the route receives a request with a method other than GET or HEAD
- **THEN** it responds with 405 without contacting the upstream

### Requirement: Edge-cached tile responses

In production the `/wms` route SHALL cache successful upstream responses at the
edge, keyed by the request URL, so identical tile requests from any viewer are
served without re-contacting the upstream. Requests that pin an explicit frame
time SHALL be cached for a long period (they are immutable), while requests
without a frame time and legend requests SHALL use a short cache period. Failed
upstream responses SHALL NOT be cached.

#### Scenario: Repeat tile request is a cache hit

- **WHEN** a tile URL that was already served successfully is requested again
- **THEN** the response is served from the edge cache without an upstream fetch

#### Scenario: Upstream failure is not cached

- **WHEN** the upstream returns a non-success response for a request
- **THEN** that response is passed through uncached, so a later retry can succeed
