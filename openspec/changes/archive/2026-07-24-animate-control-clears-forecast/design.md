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

**Keep the control fixed; lift the sheet.** The user prefers the control to stay
put. The animate control keeps its `absolute bottom-4 left-1/2` slot unchanged.
The sheet's bottom offset is conditional: `bottom-20` when a layer is active (so
it clears the control, which is only shown then), else `bottom-0` (flush). The
condition is `activeLayers.length > 0` from the store — a reliable proxy for "the
control is shown" (the control renders `null` when no layer is active).

*Alternatives:* (a) lift the control above the sheet in a flex column — rejected,
it moves the control, which the user wants fixed; (b) measure the control's height
and offset the sheet by it — rejected, the control's size is stable, so a fixed
`bottom-20` is simpler and the value is easy to tune.

## Risks / Trade-offs

- **Fixed clearance value** (`bottom-20`) is tied to the control's height → the
  control's size is stable; a one-token change if it ever grows.
- **Sheet's bottom corners are square while lifted** (it uses `rounded-t`) → only
  when a layer is active; acceptable, adjustable later if desired.
