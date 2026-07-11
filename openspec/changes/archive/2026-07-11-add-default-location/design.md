## Context

Client selection state lives in `src/store/appStore.tsx`: `primary`/`comparison` are
`SelectedLocation | null`, both initialized to `null`. `selectLocation(loc, slot)` sets a
slot; `focusOn(loc)` requests the map to recenter (new object identity each call). Server
data (forecast/hourly) is fetched by React Query hooks keyed off the selected coordinates,
so simply setting `primary` is enough to make weather appear. There is no persistence layer
today, and this change deliberately adds none.

## Goals / Non-Goals

**Goals:**
- On load, seed `primary` from the browser's current position, else a configured default.
- Keep the fallback location in a single committed constants file.
- Recenter the map on the seeded location, matching what a search/selection does.
- Never clobber a location the user has already chosen.

**Non-Goals:**
- No persistence / "remember last location" (re-run the logic every visit).
- No new UI: no custom permission prompt, no error toast, no "use my location" button.
- No comparison-slot seeding — only the primary is seeded.
- No backend changes.

## Decisions

- **Where the logic runs:** a small dedicated hook `useInitialLocation()` invoked once from
  `App.tsx`, rather than embedding an effect in the store. Keeps the store a pure state
  container and keeps the (async, browser-API) side effect co-located with the app shell.
  Alternative — seeding inside the store provider's `useEffect` — was rejected to avoid the
  store depending on `navigator.geolocation`.
- **Guard against clobbering:** the hook runs its seed at most once (a `useRef` "did-run"
  latch) and, in the async geolocation callbacks, only sets `primary` if it is still `null`
  at resolution time. This covers both a fast user click before geolocation resolves and
  React 18 StrictMode's double-invoke in dev.
- **Geolocation call:** `navigator.geolocation.getCurrentPosition(success, error, options)`
  with a finite `timeout` (e.g. 8 s) and `maximumAge` so a slow/blocked sensor still falls
  back promptly. Both the `error` callback and a missing `navigator.geolocation` route to the
  same `applyDefault()` path, so denied / unsupported / timeout are one code path.
- **Config shape:** `src/lib/config.ts` exports a typed `DEFAULT_LOCATION` (`{ lat, lng,
  name }`) matching `SelectedLocation`. A plain constant (not an env var) per the decision to
  keep it a committed config file; typed so a bad edit fails the build.
- **Centering:** after seeding, call `focusOn(loc)` so the map recenters exactly as it does
  after a search, reusing the existing recenter path rather than adding map logic.

## Risks / Trade-offs

- **Native permission prompt on load** → Expected and acceptable; the spec calls for exactly
  the browser's own prompt and nothing more. A denial is a normal, silently-handled path.
- **Geolocation resolves after a user click** → Mitigated by the "only set if still null"
  guard in the async callbacks, so a late fix never overrides a deliberate choice.
- **Default location fetches weather even if the user immediately searches elsewhere** → one
  extra forecast request, negligible; React Query dedupes/caches by coordinate.
- **StrictMode double mount in dev** → the run-once ref prevents a duplicate seed.

## Open Questions

- Which coordinates/name to ship as `DEFAULT_LOCATION` (pick a sensible city). Not blocking;
  can be finalized during implementation.
