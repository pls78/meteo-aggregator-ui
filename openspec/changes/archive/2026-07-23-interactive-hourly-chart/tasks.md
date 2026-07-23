> Backfill of shipped work — all tasks are already implemented, deployed, and verified.

## 1. Fill width + adaptive density

- [x] 1.1 Measure the chart container (initial layout measurement + `ResizeObserver`) and map the hour domain across the measured width.
- [x] 1.2 Choose the point stride from the width (≥640px → 1h, ≥420px → 2h, else 3h) and sample the temperature line/dots at that stride (including the last hour).
- [x] 1.3 Label each plotted point with its hour; keep axis/icon ticks no denser than the points.

## 2. Point inspection

- [x] 2.1 Add a hover (mouse) / tap (touch) handler that snaps to the nearest plotted point and renders a vertical crosshair, an enlarged marker, and the per-series temperature value; bold that hour's label.
- [x] 2.2 Clear on mouse-leave; keep a touch selection until the next tap; `touch-action: pan-y` so the mobile sheet still scrolls.

## 3. Verify

- [x] 3.1 Wide desktop → point every hour, filling the width; medium → every 2h; narrow → every 3h (verified 24 / 13 / 9 points).
- [x] 3.2 Hover/tap shows the crosshair + value and bolds the hour label.
