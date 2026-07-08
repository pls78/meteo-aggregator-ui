## Context

The app is a full-screen map with absolutely-positioned overlays (search top-left, cards
top-right, layer panel bottom-left, hourly sheet bottom). All of that assumes a pointer and a
wide viewport. Rather than bend the desktop components to also work on touch, this change adds a
parallel **mobile shell** and picks between the two at runtime by viewport width. The map, the
store, and the React Query hooks are shared unchanged.

## Decisions

### Runtime layout switch, not CSS show/hide

`useMediaQuery('(max-width: 767px)')` drives `App` to render **either** the desktop overlays
**or** `<MobileShell/>`. The two trees are structurally different (floating cards vs. a draggable
sheet; inline panel vs. a FAB sheet), so rendering both and toggling `display` would double the
mounted components and their queries. One tree at a time is simpler and lighter. `767px` is the
Tailwind `md` boundary, matching the `md:` convention named in the proposal.

### A/B active slot lives in the store

Add `activeSlot: Slot` (default `'primary'`). `MapView`'s click becomes
`slot = e.originalEvent.shiftKey ? 'comparison' : activeSlot`. On desktop `activeSlot` is never
changed, so `shiftKey` still picks comparison and a plain click still picks primary — **desktop
behavior is unchanged**. On mobile the A/B control sets `activeSlot`, so a plain tap fills the
chosen slot. Clearing the comparison resets `activeSlot` to `'primary'` (an effect in the store,
alongside the existing "clear selectedDay when empty" one). "+ Compare" seeds `comparison` from
`primary` (reusing today's behavior) and sets `activeSlot='comparison'` so the next tap re-places
B; a transient hint tells the user to tap the map.

### The weather sheet owns the hourly view on mobile

On mobile the separate desktop `HourlyPanel` is **not** rendered. Instead the sheet's **full**
state embeds the existing `HourlyChart` for the `selectedDay`, driven by the same store state and
the same `useHourlyRange` hook. Tapping a day in the sheet's 7-day list sets `selectedDay`; the
chart overlays A and B when both exist. This reuses the hourly feature rather than duplicating it,
and avoids two bottom sheets competing for the same edge.

### Comparison as A/B tabs, not side-by-side

Two 288 px cards can't sit side-by-side on a phone. The sheet shows one location at a time via an
**A / B** tab for current conditions and the daily list; the hourly chart still overlays both
series (that's where the comparison reads best) with its legend. The tab only appears when a
comparison location exists.

### Draggable sheet mechanics

The sheet snaps to three heights (peek ≈ 88 px, half ≈ 46 vh, full ≈ 88 vh). A grab handle
supports both a **tap** (cycle peek→half→full→peek) and a **drag** (pointer events; on release,
snap to the nearest height). Content scrolls inside the sheet (`overflow-y:auto`,
`touch-action` scoped) so gestures on the content never reach the map. The layers FAB rides just
above the sheet's top edge.

### Layers sheet reuses existing pieces

`MobileLayers` reuses `useImagery`, `toggleLayer`, `opacity`/`setOpacity`, and the
`LayerLegend` / `RgbColorKey` helpers (exported from `LayerControl`, no behavior change). It is a
modal bottom sheet with a scrim; the scrim and a close control dismiss it. Its list scrolls
within the sheet — the off-screen/non-scrollable dropdown problem disappears.

## Risks / Trade-offs

- **Two layouts to maintain.** Accepted: the shared map/store/hooks keep the divergence to
  presentation only, and the desktop tree is untouched.
- **`md` cutover is width-based, not input-based.** A narrow desktop window gets the mobile
  layout; a large tablet gets desktop. This is the conventional, predictable choice and the
  mobile layout is still fully usable with a pointer.
- **Sheet gesture vs. map gesture.** Mitigated by scoping drag to the handle and letting the
  content own its own scroll; the map only receives taps that fall outside the sheet.
