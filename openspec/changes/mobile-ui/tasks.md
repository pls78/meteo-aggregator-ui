## 1. Responsive plumbing

- [x] 1.1 Add `src/hooks/useMediaQuery.ts` with `useMediaQuery(query)` and `useIsMobile()` =
      `useMediaQuery('(max-width: 767px)')` (SSR-safe, listens for changes)
- [x] 1.2 In `src/App.tsx`, render the existing desktop overlays when `!isMobile` and
      `<MobileShell/>` when mobile; keep `<MapView/>` shared across both

## 2. Active-slot state + map wiring

- [x] 2.1 In `src/store/appStore.tsx`, add `activeSlot: Slot` (default `'primary'`) and
      `setActiveSlot`
- [x] 2.2 Reset `activeSlot` to `'primary'` when no comparison exists (effect, next to the
      existing selectedDay-clear effect)
- [x] 2.3 In `src/components/map/MapView.tsx`, change the click slot to
      `e.originalEvent.shiftKey ? 'comparison' : activeSlot` (read `activeSlot` via a ref, like
      `selectLocation`); desktop behavior stays because `activeSlot` remains `'primary'` there

## 3. Mobile top bar (search + A/B target)

- [x] 3.1 `src/components/mobile/MobileTopBar.tsx`: full-width search targeting the active slot,
      plus the A/B control
- [x] 3.2 When no comparison: a **"+ Compare"** button that seeds comparison from primary and
      sets `activeSlot='comparison'`, showing a transient "tap the map to set B" hint
- [x] 3.3 When a comparison exists: a segmented **A / B** control (accent-coded) that sets
      `activeSlot`; B carries a remove "×" that clears the comparison

## 4. Weather bottom sheet

- [x] 4.1 `src/components/mobile/WeatherSheet.tsx`: draggable sheet with snap heights peek
      (~88px) / half (~46vh) / full (~88vh); grab handle supports tap-to-cycle and drag-to-snap
- [x] 4.2 Peek shows current conditions (temp + icon) for the active tab; content scrolls
      inside the sheet (map never pans)
- [x] 4.3 A/B tab (only when a comparison exists) selecting the location for current + daily;
      reuse `useForecast`/`useHourly`, `weatherInfo`, and the confidence styling
- [x] 4.4 Tapping a day sets `selectedDay`; full state embeds `HourlyChart` for that day,
      overlaying A and B via `useHourlyRange`, with a legend
- [x] 4.5 Loading / error / empty states mirror the desktop `LocationCard` / `HourlyPanel`

## 5. Mobile layers sheet

- [x] 5.1 Export `LayerLegend` and `RgbColorKey` from `src/components/layers/LayerControl.tsx`
      (no behavior change)
- [x] 5.2 `src/components/mobile/MobileLayers.tsx`: a **Layers** FAB + a modal bottom sheet
      (scrim, close, internal scroll) reusing `useImagery`, `toggleLayer`, `opacity`/`setOpacity`,
      and the exported legend helpers

## 6. Mobile shell

- [x] 6.1 `src/components/mobile/MobileShell.tsx`: compose `MobileTopBar`, `WeatherSheet`,
      `MobileLayers` over the shared map (position the Layers FAB above the sheet's top edge)

## 7. Verify

- [x] 7.1 `npm run build` and `npm run lint` pass
- [x] 7.2 Desktop unchanged at ≥ 768px: plain-click primary, Shift+click comparison, floating
      cards, inline layer panel, hourly panel all behave as before
- [ ] 7.3 Mobile (≤ 767px) live check: tap sets A; "+ Compare" → tap sets B; A/B switch re-aims;
      sheet peek/half/full via drag and tap; tap a day → hourly (both series when comparing);
      Layers FAB opens a scrollable sheet; list scroll doesn't pan the map — verified by the user
