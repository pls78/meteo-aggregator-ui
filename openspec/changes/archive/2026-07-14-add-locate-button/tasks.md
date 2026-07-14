## 1. Locate button component

- [x] 1.1 Add `src/components/locate/LocateButton.tsx`: a reusable trigger (target/crosshair icon) accepting a `className` for placement, with local `'idle' | 'loading' | 'error'` status.
- [x] 1.2 On click, call `navigator.geolocation.getCurrentPosition` (finite timeout + short maximumAge); ignore clicks while already loading.
- [x] 1.3 On success, `selectLocation({ lat, lng }, activeSlot)` and `focusOn` it; reset to idle.
- [x] 1.4 On missing API / denial / error / timeout, flash a brief inline message ("Couldn’t get your location") auto-cleared after ~3 s, making no selection change; clear the timer on unmount.
- [x] 1.5 Show a spinner + disabled state while loading; style the button like the other corner controls (`rounded-full bg-white/95 shadow-xl ring-1 ring-black/5`).

## 2. Placement

- [x] 2.1 Desktop: render it in `App.tsx`'s `DesktopOverlays`, in the bottom-right stack just above the info button.
- [x] 2.2 Mobile: render it in `MobileShell` as a FAB in the right-side stack with the layers/info FABs, evenly spaced.

## 3. Verify

- [x] 3.1 `npm run build` and `npm run lint` pass.
- [x] 3.2 Manually verify in both layouts: click centers on the current position and fills the active slot; denying shows the brief message and changes nothing; the loading state shows while resolving.
