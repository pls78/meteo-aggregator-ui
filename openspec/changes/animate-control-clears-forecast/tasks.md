## 1. Layout

- [x] 1.1 In `App.tsx` (desktop overlays), keep the animate control's fixed `bottom-4 left-1/2` slot, and give the hourly-sheet container a conditional bottom offset — `bottom-20` when `activeLayers.length > 0` (clears the control), else `bottom-0` (flush).

## 2. Verify

- [ ] 2.1 Animate a layer, open a day's hourly forecast → the play/pause control sits above the sheet, fully visible and clickable; open the confidence detail → same.
- [ ] 2.2 With no sheet open, the control still rests near the bottom-centre; with no layer active, nothing shows there and the sheet stays flush at the bottom.
