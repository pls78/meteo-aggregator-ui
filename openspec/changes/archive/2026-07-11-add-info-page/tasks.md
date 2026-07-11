## 1. Store state

- [x] 1.1 Add `aboutOpen: boolean` and `setAboutOpen: (open: boolean) => void` to `AppState` and the `AppStoreProvider` in `src/store/appStore.tsx` (default `false`), and expose them via context/memo.

## 2. Content + dialog

- [x] 2.1 Add `src/components/about/aboutContent.ts` with typed static arrays transcribed from the backend config: features, data sources, models (name/kind/role/resolution/horizon), the two weight tables (near-term days 1–3, long-range days 4+), confidence levels + thresholds, and satellite layers (title/satellite/cadence/description).
- [x] 2.2 Add `src/components/about/AboutDialog.tsx`: a light-themed modal (scrim + centered/near-full-screen panel, `role="dialog"` `aria-modal`, internal `overflow-y-auto`) reading `aboutOpen`/`setAboutOpen` from the store. Render the sections — overview, features, data sources + models table, aggregation (weight bars + renormalization/non-blendable notes + confidence), satellite layers.
- [x] 2.3 Implement dismissal: close (✕) button, Escape key, and backdrop click; attach the Escape listener only while open. Ensure the map behind doesn't scroll/pan (internal scroll only).

## 3. Triggers + wiring

- [x] 3.1 Render `<AboutDialog />` once in `App.tsx` (inside `AppStoreProvider`), outside the desktop/mobile branch, so it overlays both layouts.
- [x] 3.2 Add a desktop info-button trigger (in `DesktopOverlays`) that calls `setAboutOpen(true)`.
- [x] 3.3 Add a mobile info-button trigger (in the mobile layout, e.g. `MobileTopBar` or a FAB) that calls `setAboutOpen(true)`.

## 4. Verify

- [x] 4.1 `npm run build` (tsc + vite) and `npm run lint` pass.
- [ ] 4.2 Manually verify in both layouts: the button opens the dialog; ✕ / Escape / backdrop close it; content scrolls internally without panning the map; figures match `../meteo-aggregator/meteo_aggregator/config.py`.
