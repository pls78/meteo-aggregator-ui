## Why

On first load the app shows an empty map with no location selected, so a new visitor
sees no weather until they click or search. Seeding a sensible starting location — the
user's own position when the browser allows it, a configured default otherwise — makes
the app useful immediately.

## What Changes

- On every app load, if no location is selected yet, auto-select a **primary** location:
  1. Ask the browser for the current position via the Geolocation API. If the user grants
     it, use that coordinate as the primary location.
  2. If geolocation is unavailable, denied, errors, or times out, **silently** fall back to
     a **default location** defined in a committed constants file (no prompt, no error UI).
- Add a committed default-location constant (coordinates + display name) in a config module
  (e.g. `src/lib/config.ts`).
- No persistence: the app does **not** remember past selections. The default logic re-runs
  on every visit; once the user picks a location during a session, the map behaves as today.
- No new UI controls — no permission prompt beyond the browser's own, and no "use my
  location" button (silent fallback only).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `location-selection`: adds a requirement for an **initial location on load** (geolocation
  with a configured fallback). Existing click / Shift+click / A-B tap selection behavior is
  unchanged.

## Impact

- **Code**: `src/store/appStore.tsx` (primary starts unset; a load-time effect seeds it),
  a new `src/lib/config.ts` (default location constant), and the app entry (`App.tsx` or a
  small hook) to run the geolocation-then-fallback logic once on mount.
- **APIs/deps**: none new — uses the browser Geolocation API and the existing `/forecast`
  and `/hourly` calls already triggered by having a selected location.
- **Behavior**: the browser may show its native geolocation permission prompt on load; a
  denial is expected and handled by the silent fallback.
