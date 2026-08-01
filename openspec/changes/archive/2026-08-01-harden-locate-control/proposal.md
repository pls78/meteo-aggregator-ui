## Why

The "use my location" control can hang forever: the Geolocation API's `timeout` option does
not cover the time the permission prompt is on screen, so if the prompt is never answered
neither callback fires, the button stays spinning, and — because it disables itself while
resolving — the only way out is a page reload. Failures are also easy to miss (a 3s flash)
and, once the permission is blocked at the browser level, every retry is a silent no-op with
nothing telling the user why. Separately, a day row in the forecast card wraps to two lines
whenever the max/min temperature, precipitation and confidence tag do not fit the card's
fixed width, which breaks the scannability of the daily list.

## What Changes

- The locate control always settles. A client-side watchdog bounds the resolving state
  regardless of what the browser reports, so the spinner can no longer be terminal.
- A position that arrives after the watchdog has given up is still honoured, so a user who
  takes their time over the permission prompt is not punished for it.
- The control is retryable after any failure, and never disables itself into a dead end.
- Blocked permission is detected and explained rather than retried into silence: when the
  Permissions API reports `denied`, the control says so and points at the browser's site
  settings instead of offering a retry that cannot work.
- The failure message persists until the user retries or dismisses it, instead of flashing
  for three seconds.
- A day row is kept on a single line; the forecast card grows to fit its content instead of
  wrapping, within a bound so it stays an overlay and not a panel.

No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `location-selection`: the "Locate me on demand" requirement gains a bound on the resolving
  state, a retry guarantee, and blocked-permission handling; its "Resolving state" and
  "Denied or unavailable" scenarios change.
- `weather-display`: the "Daily forecast" requirement gains a rule that a day row does not
  wrap and the card sizes itself to its content.

## Impact

- `src/components/locate/LocateButton.tsx` — the whole resolve/error state machine, plus a
  Permissions API probe.
- `src/components/panels/LocationCard.tsx` and `src/components/mobile/WeatherSheet.tsx` — the
  day row markup, which is duplicated across the desktop and mobile layouts and has to stay
  in sync.
- `src/components/compare/ComparisonPanel.tsx` — lays out one or two cards, so it is affected
  by a card that is no longer a fixed width.
- No API, dependency, or backend contract changes; the Permissions API is a browser built-in
  and is treated as optional (absent on older Safari).
