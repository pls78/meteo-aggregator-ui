# Design: animate-control-above-sheet

## Context

`DesktopOverlays` already measures the sheet wrapper (ResizeObserver) and lifts the layer
control by `translateY` when the sheet's panel horizontally overlaps it. The animate
control instead sits fixed at bottom-centre inside the z-1000 overlay wrapper, and the
sheet lifts `bottom-20` above it when a layer is active (`floating` prop on
`HourlyPanel`). `MapAnimateControl` returns `null` when no layer is active.

## Goals / Non-Goals

**Goals:** one uniform clearance behavior for both bottom controls; sheet always flush at
the bottom; correct re-measurement when the animate control appears/disappears while a
sheet is open.

**Non-Goals:** no change to `MapAnimateControl` internals or the mobile layout.

## Decisions

1. **Generalize the existing measurement.** One `measure()` computes a lift per control:
   overlap = the sheet panel's horizontal span intersects the control's span (16px gap on
   either side); lift = sheet wrapper height (no more 80px offset — the sheet is always
   at `bottom-0`). Both controls sit at `bottom-4`, so the control-inset/gap cancellation
   from `lift-layer-control` still holds.
2. **Observe all three wrappers with the same ResizeObserver.** The sheet wrapper catches
   content changes and window resizes; the animate wrapper catches the control mounting
   (zero → real size) when a layer is activated mid-sheet, which the sheet observer alone
   would miss. A zero-sized control wrapper gets lift 0 (nothing to clear).
3. **Move the animate wrapper out of the z-1000 overlay** to a sibling `z-[1002]` wrapper
   (like the layer control) so it glides *over* the sheet, not behind it. Its centering
   moves into the inline transform (`translate(-50%, -lift)`) because an inline
   `transform` replaces Tailwind's `-translate-x-1/2`. Wrapper is `pointer-events-none`;
   the control re-enables its own pointer events.
4. **Drop `floating` from `HourlyPanel`.** The sheet is always flush; only the top
   corners round. Removing the prop (rather than passing `false`) keeps dead code out.

## Risks / Trade-offs

- [Animate control width changes while playing (frame time appears)] → its wrapper is
  observed, so a resize refires `measure`; the lift amount doesn't depend on the
  control's own size anyway.
- [Both controls lifted look crowded on narrow desktop widths] → they occupy distinct
  columns (left corner vs. centre); the same widths overlapped the sheet before, which
  was worse.
