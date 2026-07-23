## Why

The floating panels over the map were effectively opaque, hiding the map beneath
them. Making them slightly translucent keeps the map readable through the overlays
and gives the app a lighter, map-first feel.

> Backfill: documents behaviour already implemented and shipped.

## What Changes

- The floating map-overlay panels and controls SHALL be slightly translucent with
  a backdrop blur, so the map shows through while their content stays legible —
  the search box, location/forecast card, layer control, time-lapse control,
  about/locate buttons, and on mobile the top bar, weather sheet, and layers sheet.
- Dense reading surfaces stay opaque: the "how it works" dialog and dropdown
  result lists.

## Capabilities

### Modified Capabilities
- `map-view`: specifies that the floating overlays above the map are translucent.

## Impact

- UI only: Tailwind background classes (`bg-white/70` + `backdrop-blur`) on the
  overlay panels. No behaviour, API, or backend change.
