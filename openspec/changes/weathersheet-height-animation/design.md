# Design: weathersheet-height-animation

## Context

`WeatherSheet` (`src/components/mobile/WeatherSheet.tsx`) is the mobile bottom sheet with
three snaps (peek 96px / half 46vh / full 88vh). Today the `<section>`'s `height` style is
set per snap and transitioned (`transition: height 0.3s` when not dragging). Animating
`height` re-lays-out the sheet's whole subtree every frame — day rows, SVG spread strips,
the hourly chart — which is the detector's standing `animated-layout-property` warning and
the last accepted deviation in DESIGN.md. The transition also ignores
`prefers-reduced-motion`.

Dragging already works the right way for touch (1:1, `transition: none` while `dragH` is
set); only the mechanism the height flows through is wrong.

## Goals / Non-Goals

**Goals:**

- Snap settle animates only `transform` (compositor-friendly); no layout property is ever
  transitioned.
- Behavior is pixel-for-pixel what it is today: same snaps, same tap-to-cycle, same 1:1
  drag, same clamp (70px … 92vh), same nearest-snap settle.
- `prefers-reduced-motion: reduce` disables the settle animation (instant jump).
- All sheet content stays reachable by scrolling at every snap.

**Non-Goals:**

- No visual redesign of the sheet, no new snaps, no gesture changes.
- No change to the desktop layout or to `MobileLayers` (its sheet is a plain modal, not
  height-animated).

## Decisions

1. **Fixed-height sheet translated into view.** The `<section>` gets a constant layout
   height of `92vh` (the existing drag ceiling) and is positioned at `bottom: 0` as today,
   then pushed down with `transform: translateY(<92vh − visible>px)`. "Visible" is the
   same number the component already computes (snap px or `dragH`). Only `transform`
   carries motion, so the settle animation is `transition: transform 0.3s` with the same
   easing as today.
   - *Alternative rejected:* FLIP-style height animation (measure, apply height, invert
     with transform) — much more code for the same result and still touches layout twice
     per snap.
   - *Alternative rejected:* `max-height` / `grid-template-rows` tricks — still layout
     properties.

2. **Viewport height read via a resize-aware value, not per-call `window.innerHeight`.**
   The translate needs `92vh` in px at render time. Keep the existing `snapPx()` helpers
   but derive the sheet height from a small `useState` + `resize` listener (orientation
   changes re-clamp `dragH`/snap the same way they effectively do today).

3. **Scroll reachability by bottom padding equal to the hidden portion.** With a fixed
   92vh sheet, the part below the fold is off-screen; the internal scroll container gets
   `paddingBottom: <92vh − visible>px` (updated with the same state, never transitioned)
   so the last row can always scroll into the visible band. Padding changes are layout,
   but they happen once per snap/drag frame — exactly as the current per-frame height
   change during drag does — and are never animated.
   - *Alternative rejected:* sizing the scroll container to the visible band — same
     layout cost, more coupling to the header heights above it.

4. **Reduced motion via the existing pattern.** The component already reads
   `matchMedia('(prefers-reduced-motion: reduce)')` for the day-detail scroll; reuse that
   check to set `transition: none` on the transform when reduced motion is requested.

5. **Rounded corners / shadow unchanged.** `rounded-t-2xl` and the `panel` material sit on
   the same element; translating it doesn't affect them. The bottom edge now extends below
   the viewport, which is invisible.

## Risks / Trade-offs

- [Backdrop blur (`panel`) during transform animation] → `backdrop-filter` re-samples
  under the moving element; it's paint-only (no layout) and the area is small. Verify on
  the dev server; if it visibly costs, the sheet can switch to `bg-surface-solid` — but
  only with a visual-design check, not by default.
- [Off-screen content momentarily unreachable mid-animation] → padding updates at the
  target value while the transform animates for 300 ms; imperceptible, and the day-detail
  auto-scroll runs after state settles.
- [`MapAnimateControl` clearance] → the satellite spec requires the animate control to
  stay clear of the sheet. Verify how it computes its offset; if it measures the sheet's
  DOM height it must use the *visible* height (translate-aware). If it keys off store
  state (snap), it's unaffected.

## Migration Plan

Single-component change; ship with the normal build + deploy. Rollback = revert the
commit.

## Open Questions

None.
