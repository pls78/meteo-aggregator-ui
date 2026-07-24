## Context

Desktop overlays (`App.tsx`): the animate control was an absolutely-positioned
`bottom-4 left-1/2` child of the overlay wrapper (z-1000); the hourly sheet was a
separate `bottom-0` full-width layer (z-1001). Both anchor to the bottom-centre,
so the sheet (drawn later / higher z) covered the control.

## Goals / Non-Goals

**Goals:** keep the play/pause control visible and usable while the forecast sheet
is open; don't change the sheet's flush-bottom position or the control's resting
spot when no sheet is open.

**Non-Goals:** changing mobile (its control already sits above the sheet peek);
measuring the sheet height.

## Decisions

**One bottom-anchored flex column.** Put the control and the hourly sheet in a
single `absolute inset-x-0 bottom-0 flex flex-col items-center` stack: the control
first, the sheet last. Because the sheet is the last child of a bottom-pinned
column, it stays flush at the bottom; the control sits above it in normal flow, so
it lifts by exactly the sheet's height with no measurement.

A `mb-4` on the control does double duty: it's the control's resting gap from the
bottom when the sheet is absent (≈ the old `bottom-4`), and the gap between the
control and the sheet when the sheet is present. The control component already
returns `null` when no layer is active, so the slot simply collapses then.

*Alternative — lift the control by the measured sheet height via `ResizeObserver`:*
rejected; flow-based stacking needs no measurement and can't drift.

## Risks / Trade-offs

- **Control jumps up the instant the sheet mounts** (its height is reserved before
  the fade-in completes) → acceptable; it's never covered at any point.
