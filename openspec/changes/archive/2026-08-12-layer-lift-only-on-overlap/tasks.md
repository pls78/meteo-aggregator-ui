# Tasks: layer-lift-only-on-overlap

## 1. Implementation

- [x] 1.1 In `DesktopOverlays`, add a ref on the layer-control wrapper and, in the
      observer callback, lift only when the sheet panel's left edge crosses the
      control's right edge + gap

## 2. Verify

- [x] 2.1 `npm run build` + `npm run lint` pass
- [x] 2.2 Headless check: hourly (wide) lifts with no overlap; confidence (narrow) rests
      at bottom-left; close returns to rest
