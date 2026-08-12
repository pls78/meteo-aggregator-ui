# Design: layer-lift-only-on-overlap

## Context

`DesktopOverlays` observes the sheet wrapper's height with a `ResizeObserver` and lifts
the layer control by `translateY(-(offset + height))` whenever the height is non-zero.
The wrapper spans the full width, but the visible panel inside it is centered and
content-sized (`max-w-5xl` for hourly, `w-fit` for confidence), so its left edge often
sits far right of the control.

## Goals / Non-Goals

**Goals:** lift only when the visible panel's left edge would intrude on the control's
column (control right edge + 16px gap); everything else from `lift-layer-control`
(transform-only motion, reduced motion, follow height changes) unchanged.

**Non-Goals:** no partial/horizontal dodging; the control either rests or lifts fully
above the sheet.

## Decisions

1. **Measure the inner panel, not just the wrapper.** In the existing observer callback,
   read the wrapper's `querySelector('section')` (the visible `panel` element) rect for
   the horizontal test and keep the wrapper height for the lift amount. The observer
   already fires on content changes and window resizes (wrapper width tracks the
   viewport), which are exactly the moments overlap can change.
2. **Compare against the control's own rect via a ref** rather than hardcoding
   `left-4 + w-64`; `translateY` doesn't affect the horizontal extent, so the measured
   rect is valid even while lifted.

## Risks / Trade-offs

- [Inner width change with identical wrapper height wouldn't refire the observer] → the
  hourly and confidence views differ in height in practice, and a same-height same-width
  change doesn't change overlap; acceptable.
