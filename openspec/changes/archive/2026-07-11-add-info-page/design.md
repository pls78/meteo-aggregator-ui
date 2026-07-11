## Context

The app is a single full-screen map with overlay layouts chosen at runtime by `useIsMobile()`
(`DesktopOverlays` vs `MobileShell`). There is **no router** and no dark mode — the palette is
light slate/white Tailwind v4. Existing modals (e.g. `MobileLayers`) use a `bg-slate-900/35`
scrim plus an absolutely-positioned panel at a high z-index, closed with a `✕` button. Client
UI state (selected locations, active layers, `selectedDay`, `activeSlot`) lives in
`src/store/appStore.tsx`; server data stays in React Query.

The page's content is documentation transcribed from the sibling backend
(`../meteo-aggregator/meteo_aggregator/config.py` and `aggregation.py`): the five models, the
two weight tables, confidence thresholds, and the satellite layer cadences.

## Goals / Non-Goals

**Goals:**
- One dialog component reused by both layouts, matching the app's light modal pattern.
- Accurate, self-contained content (features, sources, weighting algorithm, layers).
- Accessible dismissal: close button, Escape, and backdrop click; no background scroll.

**Non-Goals:**
- No router / real URL (`/about`) and no new dependency.
- No dark theme (the app is light-only; the earlier HTML mockup's dual theme is not ported).
- No live wiring of layer descriptions to the `/imagery` response — the descriptions and
  cadences are static documentation.

## Decisions

- **State in the store, not prop-drilled:** add `aboutOpen: boolean` and
  `setAboutOpen(open)` to `appStore`. The mobile layout nests several components, so a shared
  store flag lets a trigger in either layout open a single `<AboutDialog />` rendered once in
  `App.tsx`. This mirrors how `selectedDay`/`activeSlot` already live in the store.
  Alternative — `useState` in `App` plus prop drilling into `MobileShell`/`MobileTopBar` — was
  rejected as more plumbing for the same result.
- **Single dialog instance in `App`:** render `<AboutDialog />` once at the app root (outside
  the desktop/mobile branch) so it overlays both layouts; each layout only owns its trigger
  button.
- **Content as local static data:** the models, weight rows, confidence levels, and layer
  entries are plain typed arrays in the about module (e.g. `aboutContent.ts`), keeping the JSX
  a simple map. This centralizes the figures that must track the backend config.
- **Modal mechanics reuse existing patterns:** scrim + centered panel with `max-h` and an
  internal `overflow-y-auto` body (so the map never scrolls); `✕` close; an Escape-key handler
  and a backdrop-click handler; focus moved into the dialog on open and `role="dialog"`
  `aria-modal="true"`. On mobile the panel is near-full-screen; on desktop it is a centered
  card (~`max-w-3xl`).
- **Weight bars:** render each weight as a proportional bar (width relative to the largest
  weight in that table) with the numeric value shown in tabular figures, so the algorithm is
  legible at a glance.

## Risks / Trade-offs

- **Content drift vs backend config** → Mitigated by keeping all figures in one
  `aboutContent.ts` and noting in the proposal that a material config change requires updating
  it. A future improvement could derive layer titles from `/imagery`.
- **Escape/scroll-lock interfering with the map** → Scoped: the Escape handler and any
  scroll-lock are attached only while the dialog is open and removed on close.

## Open Questions

- Exact placement/icon of the desktop trigger (near the search panel vs bottom bar). Not
  blocking; chosen during implementation to fit the existing overlay composition.
