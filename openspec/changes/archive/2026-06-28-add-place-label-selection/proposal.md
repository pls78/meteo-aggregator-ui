## Why

Now that the basemap is vector (MapLibre + CARTO Voyager), the map's place labels are real,
queryable features — not just pixels. Today clicking the map always selects the raw clicked
coordinate, even when you click directly on a city name. Users naturally want to click a
labeled place (e.g. "Milano") and get that place selected by name, not an approximate point a
few pixels off. This was the second motivation behind the vector-basemap refactor.

## What Changes

- When the user clicks **on a place label** on the basemap, select **that place** — using the
  place's **name and coordinates** from the vector feature — for the target slot (primary, or
  comparison with Shift).
- When the click is **not** on a place label, keep the current behavior: select the raw
  clicked coordinate (unnamed).
- A small pixel tolerance around the click makes labels easy to hit.
- Frontend-only. **No API changes.**

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `location-selection`: clicking a place label selects that named place; clicking elsewhere
  still selects the raw coordinate.

## Impact

- **UI code:** `src/components/map/MapView.tsx` click handler only — add a
  `queryRenderedFeatures` lookup against the basemap's `place` source-layer. Reuses the
  existing `selectLocation` store action; the resulting `name` flows automatically into the
  weather card title and the search bar (which already display `location.name`).
- **No backend, model, or other component changes.**
