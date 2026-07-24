## Why

When a satellite layer is animating, its play/pause control floats at the
bottom-centre of the map. Opening a day's hourly forecast (or confidence detail)
raises the bottom sheet over that spot, covering the control — so the user can no
longer pause or read the frame time while viewing the forecast.

## What Changes

- On the desktop layout, the time-lapse control keeps its fixed bottom-centre
  position; when a satellite layer is active (so the control is shown), the hourly
  detail sheet is lifted to render **above** the control instead of covering it.
  When no layer is active, the sheet sits flush at the bottom as before.

## Capabilities

### Modified Capabilities
- `satellite-layers`: the single floating animate control stays visible and usable
  when the weather detail sheet is open.

## Impact

- UI only: `App.tsx` bottom-centre layout (the animate control and the hourly
  sheet now share one bottom-anchored stack). No behaviour, API, or backend change.
- Mobile is unchanged here (its control already sits above the sheet's peek height).
