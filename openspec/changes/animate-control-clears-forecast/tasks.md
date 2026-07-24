## 1. Layout

- [x] 1.1 In `App.tsx` (desktop overlays), remove the absolutely-positioned `bottom-4` animate-control slot and instead put `MapAnimateControl` and `HourlyPanel` in one bottom-anchored `flex flex-col items-center` stack (control above the sheet), with `mb-4` on the control for its resting offset / gap to the sheet.

## 2. Verify

- [ ] 2.1 Animate a layer, open a day's hourly forecast → the play/pause control sits above the sheet, fully visible and clickable; open the confidence detail → same.
- [ ] 2.2 With no sheet open, the control still rests near the bottom-centre; with no layer active, nothing shows there and the sheet stays flush at the bottom.
