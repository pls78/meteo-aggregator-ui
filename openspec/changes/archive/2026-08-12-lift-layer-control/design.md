# Design: lift-layer-control

## Context

`DesktopOverlays` (`src/App.tsx`) anchors the layer control `absolute bottom-4 left-4
z-[1002]` and the detail sheet in a full-width wrapper at `bottom-0` (or `bottom-20` when a
layer is active, to clear the animate control). The sheet's height is content-dependent
(hourly chart vs. one/two confidence columns vs. loading skeletons) and it fades in/out over
300 ms, staying mounted during the exit fade.

## Goals / Non-Goals

**Goals:**

- The layer control never overlaps an open detail sheet; it rides just above the sheet's
  top edge and returns to `bottom-4 left-4` when the sheet closes.
- Motion is transform-only and reduced-motion aware (matches the visual-design motion
  requirement proposed in `weathersheet-height-animation`).

**Non-Goals:**

- No change to `LayerControl` internals, the animate control, the sheet itself, or mobile.

## Decisions

1. **Measure the sheet wrapper with a `ResizeObserver`, offset the control with
   `translateY`.** The sheet wrapper div (already in `DesktopOverlays`) gets a ref; a
   `ResizeObserver` tracks its height into state (`0` when the sheet is unmounted). The
   layer-control wrapper gets `transform: translateY(-(sheetOffset + sheetHeight)px)`
   where `sheetOffset` is the wrapper's own bottom offset (80px when a layer is active,
   else 0). Since the control already sits 16px up and we want a ~16px gap above the
   sheet, the two cancel and the lift is exactly `offset + height`.
   - *Alternative rejected:* placing the control in a flex column with the sheet — the
     control's resting position must not follow the sheet wrapper's `bottom-20` lift when
     the sheet is closed, which the flow layout can't express without more conditionals.
   - *Alternative rejected:* a fixed guess at the sheet height — the sheet's height varies
     by view and data state; a wrong guess either overlaps or leaves a moat.
2. **Transition on the wrapper: `transition-transform duration-300 ease-out
   motion-reduce:transition-none`.** Because the sheet stays mounted through its 300 ms
   exit fade, the observer reports height `0` only at unmount, so the control glides down
   in step with the fade-out; on open it glides up as the sheet fades in. Transform-only,
   so it complies with the motion grammar.
3. **Always lift while a sheet is open**, even on wide screens where the centered
   `max-w-5xl` sheet might not reach the control. Conditional overlap detection buys
   little and makes the control's position unpredictable.

## Risks / Trade-offs

- [Sheet height changes while open (loading → chart, hourly → confidence)] → the observer
  fires and the control glides to the new offset; that's the desired behavior.
- [`ResizeObserver` loop warnings] → the observer only sets state consumed by a transform
  on a different element; no feedback loop.
