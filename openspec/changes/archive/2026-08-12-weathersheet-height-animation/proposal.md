# Proposal: weathersheet-height-animation

## Why

The mobile `WeatherSheet` animates the CSS `height` property between its peek/half/full
snaps — a layout property, so every animation frame re-lays-out and repaints the sheet's
full contents (day rows, SVG spread strips, hourly chart). This is the design detector's
one standing warning and the last accepted deviation in DESIGN.md; on low-end phones the
snap animation visibly stutters. The sheet also ignores `prefers-reduced-motion`, unlike
the rest of the app (the day-detail scroll already honours it).

## What Changes

- Rework the sheet's snap mechanic to compositor-friendly motion: the sheet keeps a fixed
  layout height and moves via `transform: translateY(...)`, so snap animation touches no
  layout property.
- Dragging continues to track the finger 1:1 with no transition; only the settle-to-snap
  animates.
- The snap animation is disabled under `prefers-reduced-motion: reduce` (sheet jumps to
  its snap height).
- All sheet content remains reachable at every snap (the internal scroll area compensates
  for the off-screen portion of the fixed-height sheet).
- Clears the detector warning and removes the "WeatherSheet height animation" accepted
  deviation from DESIGN.md / `.impeccable/design.json`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `visual-design`: add a motion requirement — UI animation SHALL use compositor-friendly
  properties (transform/opacity), not layout properties, and SHALL honour
  `prefers-reduced-motion`.
- `weather-display`: the bottom-sheet requirement gains snap-motion behavior — snap
  changes animate smoothly (reduced-motion aware), drag tracks the pointer directly, and
  content stays fully scrollable at every snap.

## Impact

- `src/components/mobile/WeatherSheet.tsx` — the only component change (height/transition
  logic, drag handlers, scroll-area compensation).
- `DESIGN.md` + `.impeccable/design.json` — deviation removed after the fix lands.
- No API, store, or desktop-layout changes; no dependency changes.
