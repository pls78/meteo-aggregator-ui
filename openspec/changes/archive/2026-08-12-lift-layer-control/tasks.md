# Tasks: lift-layer-control

## 1. Implementation

- [x] 1.1 In `DesktopOverlays` (`src/App.tsx`), ref + `ResizeObserver` on the detail-sheet
      wrapper tracking its height into state
- [x] 1.2 Offset the layer-control wrapper by `translateY(-(sheetOffset + sheetHeight))`
      with `transition-transform duration-300 ease-out motion-reduce:transition-none`

## 2. Verify

- [x] 2.1 `npm run build` + `npm run lint` pass
- [x] 2.2 Visual pass on the dev server: control lifts above the hourly sheet and the
      confidence sheet (with and without an active layer), returns on close, mobile
      unaffected
