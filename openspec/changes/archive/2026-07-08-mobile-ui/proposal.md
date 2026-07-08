## Why

The UI is unusable on a phone. It was built for a pointer: comparison needs **Shift**+click
(no Shift key on touch), the weather **cards cover most of the map**, and the **satellite layer
control runs off-screen** and can't be scrolled (scrolling pans the map instead). On a phone the
app can effectively only ever select one location and hides the map it's meant to annotate.

An interactive prototype was reviewed and approved; this change implements it.

## What Changes

A **mobile layout** below an `md` breakpoint (≤ 767 px). The desktop layout (floating cards,
Shift+click, the inline layer panel) is **unchanged** at ≥ md — the mobile surfaces are new,
additive components chosen at runtime by a media query.

- **A / B location target (replaces Shift+click on touch).** A tap always fills the *active*
  slot. The user starts on **A** (primary); a **"+ Compare"** control arms **B** (comparison)
  with a "tap the map" hint, and a segmented **A / B** switch re-aims either one. Search and the
  existing "+" still work; nothing is Shift-only.
- **Weather in a draggable bottom sheet (replaces the floating cards).** One sheet with three
  snap heights — **peek** (current temp only, map ~90 % clear), **half** (adds the 7-day list),
  **full** (adds the hourly chart). Two locations ride an **A / B** tab inside the sheet instead
  of two side-by-side cards; the hourly chart overlays both. The sheet scrolls internally so the
  map never moves under the user's thumb.
- **Satellite layers in a sheet (replaces the off-screen dropdown).** A **Layers** FAB opens a
  modal bottom sheet with large tap targets, its own scroll, opacity slider, and legends; it dims
  the map and closes on the backdrop. Nothing runs off-screen.

**Frontend-only. No API changes.**

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `map-view`: a responsive shell renders a mobile layout below the `md` breakpoint; the desktop
  overlay layout is retained above it.
- `location-selection`: on touch/small screens, a map tap fills the **active** slot (A/B),
  selectable via an on-screen control, in place of Shift+click.
- `weather-display`: on small screens the weather is presented as a draggable bottom sheet with
  peek/half/full snap heights instead of floating cards.
- `location-comparison`: on small screens two locations are compared via an A/B tab within the
  sheet (with the hourly chart overlaying both) rather than side-by-side cards.
- `satellite-layers`: on small screens the layer control is a FAB-triggered scrollable sheet.

## Impact

- **New UI code:** `src/hooks/useMediaQuery.ts` (+ `useIsMobile`); `src/components/mobile/`
  — `MobileShell`, `MobileTopBar` (search + A/B toggle), `WeatherSheet` (draggable, snap
  heights, A/B tabs, embeds `HourlyChart`), `MobileLayers` (FAB + layers sheet).
- **Changed UI code:**
  - `src/store/appStore.tsx` — add `activeSlot` + `setActiveSlot`; reset to `primary` when the
    comparison is cleared.
  - `src/components/map/MapView.tsx` — a plain tap fills `shiftKey ? comparison : activeSlot`
    (desktop unchanged: `activeSlot` stays `primary`, so plain-click = primary, Shift = comparison).
  - `src/App.tsx` — render the desktop overlays at ≥ md, `<MobileShell/>` below it; `MapView`
    is shared.
  - `src/components/layers/LayerControl.tsx` — export the `LayerLegend` / `RgbColorKey` helpers
    for reuse by `MobileLayers` (no behavior change).
- **No backend, API-contract, or `src/api/*` changes.**
