# Proposal: mobile-controls-above-sheet

## Why

On mobile, the weather sheet and every floating map control shared the same `z-[1000]`,
and the sheet is rendered last — so at its tallest snap the sheet simply swallowed the
Layers FAB, the locate and info buttons, and the time-lapse control. Verified in a
headless mobile viewport: `elementFromPoint` over the Layers FAB returned the sheet's
header, not the button.

Two consequences the user actually hit:

- With a satellite layer active, imagery reads through the translucent sheet, and the one
  control that could turn it off was unreachable — the layer looked stuck on with no way
  to dismiss it.
- The time-lapse control sits at `bottom-[6.5rem]`, which only clears the **peek** sheet.
  The sheet opens at **half**, so the play/pause control was covered by default, from the
  first frame of every animation.

The desktop solved the same conflict long ago (`lift-layer-control`,
`layer-lift-only-on-overlap`, `animate-control-above-sheet`): the sheet stays put and the
controls move above it. Mobile never got the equivalent.

## What Changes

- The mobile top bar and floating controls move above the weather sheet in the stacking
  order, and the layers modal moves above them, so the modal scrim still covers everything.
- The sheet's **full** snap stops below the top bar rather than taking a flat share of the
  viewport, so the search field and A/B target are never covered; a drag can no longer
  climb past that height either.
- The time-lapse control rides just above the sheet's top edge at every snap, following it
  during a drag as well as through the settle.
- Locate and info act on the map, so they step aside once the sheet has covered it. The
  Layers control does not: imagery reads through the sheet, so it stays reachable at every
  snap height.
- A cancelled drag gesture now ends the drag. It used to leave the sheet frozen at the
  height the pointer was last seen at.
- The search field's text and placeholder are vertically centered on WebKit (rendering fix,
  no behavior change; see `design.md`).

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `satellite-layers`: "Layer control as a sheet on small screens" gains the requirement that
  the Layers button stays reachable at every weather-sheet height; "Animate control stays
  clear of the weather sheet" extends its clearance rule to the mobile layout.
- `weather-display`: "Weather presented as a bottom sheet on small screens" gains the
  requirement that expanding the sheet never strands the map controls, and that an
  interrupted drag settles rather than freezing.

## Impact

- `src/components/mobile/WeatherSheet.tsx` — `TOP_BAR_PX`/`MAP_CONTROLS_PX` snap geometry,
  the `--weather-sheet` / `--weather-sheet-ease` / `--map-controls` custom properties,
  drag clamped to the full snap, `onPointerCancel`.
- `src/components/mobile/MobileShell.tsx` — control stack at `z-[1010]`, time-lapse control
  positioned from `--weather-sheet`, locate/info gated on `--map-controls`.
- `src/components/mobile/MobileLayers.tsx` — FAB `z-[1010]`, scrim `z-[1020]`, sheet `z-[1030]`.
- `src/components/mobile/MobileTopBar.tsx` — `z-[1010]`.
- `src/components/search/SearchBox.tsx` — input height pinned to its line-height,
  UA appearance dropped.
- `DESIGN.md` (mobile layout + z-order vocabulary + sheets), `CLAUDE.md`, `HANDOFF.md`.
