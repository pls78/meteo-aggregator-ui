## 1. Layout

- [x] 1.1 In `App.tsx` (desktop overlays), keep the animate control's fixed `bottom-4 left-1/2` slot, and give the hourly-sheet container a conditional bottom offset — `bottom-20` when `activeLayers.length > 0` (clears the control), else `bottom-0` (flush).

## 2. Verify

- [x] 2.1 Activated a layer, opened a day's hourly forecast → geometry confirms the sheet is lifted above the control (panel bottom above control top; `overlap: false`), so the play/pause control stays clear. Confidence detail shares the same lifted container.
- [x] 2.2 Control rests near the bottom-centre (top ≈ vh−58px) when active; with no layer active the sheet is `bottom-0` (flush).
