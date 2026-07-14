## Why

The app seeds a location from geolocation on first load, but only silently and only once. If
the user denies the initial prompt, moves, or wants to jump back to where they are, there is no
way to ask for their current location on demand. A visible "use my location" control fills that
gap.

## What Changes

- Add a **"use my location" button** (a target/crosshair icon) to both layouts, in the
  right-side control stack (desktop: above the info button; mobile: a FAB with the others).
- On click it requests the browser's current position and, on success, selects that coordinate
  into the **active slot** (primary on desktop; the A/B target on mobile) and recenters the map.
- While the position is resolving the button shows a **loading state**; if geolocation is
  denied or unavailable it shows a **brief inline message** and makes no change (the click is
  deliberate, so silent failure would be confusing).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `location-selection`: adds a requirement for an **on-demand "locate me"** control. Existing
  click / Shift+click / A-B tap selection and the silent on-load seeding are unchanged.

## Impact

- **Code (UI only)**: a new `src/components/about`-style trigger `src/components/locate/
  LocateButton.tsx` (self-contained: geolocation call + loading/error state), placed in
  `App.tsx`'s `DesktopOverlays` and the mobile `MobileShell`. Reads `activeSlot` and calls the
  existing `selectLocation`/`focusOn` store actions; no new store state.
- **APIs/deps**: none. Uses the browser Geolocation API (may show the native permission prompt)
  and the `/forecast`/`/hourly` calls already triggered by selecting a location.
