# Proposal: lift-layer-control

## Why

On desktop, the layer control sits fixed at the bottom-left while the hourly/confidence
detail sheet spans the bottom of the map, so an open sheet slides under the control and the
two overlap (the control is only kept clickable by z-index). The time-lapse control already
has a "stays clear of the sheet" behavior; the layer control should get the same treatment.

## What Changes

- When the desktop detail sheet (hourly forecast or confidence detail) is open, the layer
  control moves up to sit just above the sheet's top edge instead of overlapping it.
- The move follows the sheet's actual (content-dependent) height and animates with a
  transform-only transition, honouring `prefers-reduced-motion` — per the motion grammar.
- When no sheet is open, the control rests at the bottom-left exactly as before.
- Mobile is unaffected (its layers UI is a FAB + modal sheet).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `satellite-layers`: add a requirement that the layer control stays clear of the weather
  detail sheet on desktop (mirroring the existing "Animate control stays clear of the
  weather sheet" requirement).

## Impact

- `src/App.tsx` (`DesktopOverlays`) — measure the sheet wrapper's height and offset the
  layer-control wrapper by it; no `LayerControl` internals change.
- No API, store, or mobile changes; no dependencies.
