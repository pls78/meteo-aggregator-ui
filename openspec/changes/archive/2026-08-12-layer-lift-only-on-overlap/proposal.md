# Proposal: layer-lift-only-on-overlap

## Why

`lift-layer-control` (just archived) lifts the layer control above the detail sheet
whenever a sheet is open — even when the sheet is narrow and centered (e.g. the
confidence detail) and never reaches the control's bottom-left corner. Moving the control
when nothing would overlap it is unnecessary motion; it should stay put unless the open
sheet actually intrudes on its space.

## What Changes

- The layer control lifts only when the open sheet's panel horizontally overlaps the
  control's column (with the usual gap); otherwise it stays at its bottom-left rest even
  while a sheet is open.
- Overlap is re-evaluated when the sheet's size/content changes, so switching between a
  wide hourly chart and a narrow confidence detail moves the control up or back down
  accordingly.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `satellite-layers`: the "Layer control stays clear of the weather detail sheet"
  requirement is modified — the control moves only when the sheet would otherwise
  overlap it.

## Impact

- `src/App.tsx` (`DesktopOverlays`) only — the measurement now also compares horizontal
  extents.
