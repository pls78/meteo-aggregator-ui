## Context

Geolocation already exists in the app as `useInitialLocation()` (a one-time, silent seed of
`primary` on load, falling back to `DEFAULT_LOCATION`). Selection state and actions live in
`src/store/appStore.tsx`: `selectLocation(loc, slot)` sets a slot, `focusOn(loc)` recenters the
map, and `activeSlot` is the slot a plain map tap fills (always `'primary'` on desktop; the A/B
target on mobile). The app is light-themed Tailwind with no toast system; existing corner
controls follow a `rounded-full bg-white/95 shadow-xl ring-1 ring-black/5` style (see
`AboutButton`, `MobileLayers`).

## Goals / Non-Goals

**Goals:**
- One reusable control in both layouts that requests the current position on demand.
- Fill the active slot and recenter, reusing existing store actions.
- Clear loading and denied/unavailable feedback for a deliberate click.

**Non-Goals:**
- No new store state; no change to the on-load silent seeding.
- No app-wide toast system — the message is local to the button.
- No continuous tracking / watchPosition; a single fix per click.

## Decisions

- **Self-contained `LocateButton`:** the geolocation call plus `'idle' | 'loading' | 'error'`
  status live in the component (local `useState`), mirroring how `AboutButton` is a thin trigger.
  It reads `activeSlot`/`selectLocation`/`focusOn` from the store. This avoids adding store state
  for a transient, button-local concern. Placement is the caller's job via `className`, so the
  same component serves the desktop corner and the mobile FAB.
- **Active-slot target:** on success it calls `selectLocation(loc, activeSlot)`, so desktop fills
  primary and mobile respects the A/B target — consistent with a map tap. Alternative (always
  primary) was rejected as inconsistent with tap behavior on mobile.
- **Error feedback without a toast system:** on denied/unsupported/timeout the button flashes an
  inline message ("Couldn’t get your location") positioned to its left (`right-full`), auto-cleared
  after ~3 s. The button is the positioned ancestor so the message anchors to it in both layouts.
- **Loading state:** while the request is in flight the icon swaps to a spinner and the button is
  disabled, preventing overlapping requests.
- **Geolocation options:** `getCurrentPosition` with a finite `timeout` and a short `maximumAge`,
  matching `useInitialLocation`, so a blocked sensor fails fast into the error path.

## Risks / Trade-offs

- **Native permission prompt** → Expected; a denial routes to the inline-message path.
- **Message placement in a corner** → Anchored left of the button (`right-full`), which stays
  on-screen for both the desktop bottom-right position and the mobile right-edge FAB.

## Open Questions

- Exact vertical order of the mobile FAB stack (layers / info / locate). Not blocking; chosen
  during implementation to keep even spacing.
