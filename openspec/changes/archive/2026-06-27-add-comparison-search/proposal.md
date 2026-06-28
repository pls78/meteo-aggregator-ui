## Why

Today the search box only ever sets the **primary** location. The only way to pick a
**comparison** location is to Shift+click the map — which means a user can't *search* for the
second location by name. People comparing two cities (e.g. "Milan vs Rome") want to type both.

## What Changes

- Add a **"+"** control next to the search box. Clicking it adds the comparison location,
  initialized to the **same** location as the primary, and reveals a **second search bar**
  below the first that controls the comparison location.
- Each search bar is **color-coded** to match the bullets used in the weather cards:
  primary = `rgb(37, 99, 235)` (blue), comparison = `rgb(245, 158, 11)` (amber).
- The second search bar appears whenever a comparison location exists (so Shift+click also
  shows it) and can be removed, which clears the comparison location.
- Selecting a search result now applies to **that bar's** location slot (primary or
  comparison), not always the primary.
- Frontend-only. **No API changes.**

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `location-search`: search is now per-slot (primary/comparison); a second, color-coded
  search bar can be added via a "+" control and removed.
- `location-comparison`: a comparison location can be added from the search panel,
  initialized to the primary location's coordinates.

## Impact

- **UI code:** `src/components/search/SearchBox.tsx` (generalized to a slot + accent), a new
  `src/components/search/SearchPanel.tsx` (stacks the bars + "+" control), and `src/App.tsx`.
  Reuses the existing `useAppStore` `selectLocation`/`clearLocation`/`focusOn` and the
  `useSearch` hook.
- **No backend, model, or API changes.**
