# Tasks: mobile-controls-above-sheet

## 1. Implementation

- [x] 1.1 Restack the mobile overlay: top bar and floating controls to `z-[1010]`, layers
      scrim to `z-[1020]`, layers sheet to `z-[1030]`
- [x] 1.2 `snapPx('full')` stops `TOP_BAR_PX` below the top of the screen; clamp drags to
      the same height
- [x] 1.3 Publish `--weather-sheet`, `--weather-sheet-ease` and `--map-controls` from
      `WeatherSheet`; position the time-lapse control from them in `MobileShell`
- [x] 1.4 Gate locate/info (and the time-lapse control) on `--map-controls`; leave the
      Layers FAB always reachable
- [x] 1.5 End a drag on `pointercancel` as well as `pointerup`
- [x] 1.6 Pin the search input's content box to one line box with the UA appearance dropped

## 2. Verify

- [x] 2.1 `npm run build` + `npm run lint` pass
- [x] 2.2 Headless mobile viewport: at the half snap all four controls hit-test to
      themselves and the time-lapse control sits above the sheet edge; at the full snap the
      Layers FAB still hit-tests to itself while locate/info/time-lapse report
      `visibility: hidden`
- [x] 2.3 Headless mobile viewport, full snap: tap the Layers FAB → sheet opens → uncheck
      the active layer → close with the ✕, all through real clicks
- [x] 2.4 Desktop viewport unchanged: search input is a 20px box on a 20px line

## 3. Docs

- [x] 3.1 `CLAUDE.md` mobile section: stacking invariant, snap geometry, the custom
      properties and why they are not store state
- [x] 3.2 `DESIGN.md`: mobile layout figures, z-order vocabulary, sheets section
- [x] 3.3 `HANDOFF.md`: mobile layering gotcha, WebKit input gotcha, archived-change list
