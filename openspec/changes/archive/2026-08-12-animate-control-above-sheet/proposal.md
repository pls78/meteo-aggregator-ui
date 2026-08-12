# Proposal: animate-control-above-sheet

## Why

The time-lapse (animate) control and the detail sheet resolve their conflict backwards
relative to the layer control: the sheet lifts 80px to sit *above* the fixed control,
leaving the control rendered under/below the open hourly forecast. Now that the layer
control moves itself above the sheet (`lift-layer-control` + `layer-lift-only-on-overlap`),
the animate control should behave uniformly: the sheet stays flush at the bottom and the
control rides above it when they'd overlap.

## What Changes

- The desktop animate control lifts above the open detail sheet's top edge when the
  sheet's panel would overlap it — same measurement, motion (transform-only, reduced-
  motion aware), and gap as the layer control.
- The detail sheet no longer lifts (`bottom-20`) when a layer is active; it always sits
  flush at the bottom edge, and its "floating" all-corners-rounded variant goes away.
- The control also repositions when it appears/disappears or resizes while a sheet is
  open (activating a layer mid-sheet must not leave it overlapped).
- Mobile is unchanged (the control already sits above the fixed-height peek).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `satellite-layers`: the "Animate control stays clear of the weather sheet" requirement
  changes mechanism — the control moves above the flush sheet (uniform with the layer
  control) instead of the sheet lifting above the control.

## Impact

- `src/App.tsx` (`DesktopOverlays`) — shared lift measurement for both controls; animate
  control wrapper moves out of the z-1000 overlay to its own z-1002 wrapper; sheet
  wrapper always `bottom-0`.
- `src/components/hourly/HourlyPanel.tsx` — the `floating` prop and its conditional
  rounding are removed (always flush, top corners rounded).
