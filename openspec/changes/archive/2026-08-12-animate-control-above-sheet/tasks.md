# Tasks: animate-control-above-sheet

## 1. Implementation

- [x] 1.1 Generalize the lift measurement in `DesktopOverlays` to both controls (shared
      observer on the sheet + both control wrappers; per-control horizontal overlap)
- [x] 1.2 Move the animate wrapper to its own `z-[1002]` sibling with
      `translate(-50%, -lift)` + the shared transition classes
- [x] 1.3 Sheet wrapper always `bottom-0`; remove `HourlyPanel`'s `floating` prop and
      conditional rounding

## 2. Verify

- [x] 2.1 `npm run build` + `npm run lint` pass
- [x] 2.2 Headless check: with a layer active and hourly open, both controls sit above
      the flush sheet without overlapping it or each other; activating a layer while the
      sheet is open lifts the appearing control; close returns both to rest
