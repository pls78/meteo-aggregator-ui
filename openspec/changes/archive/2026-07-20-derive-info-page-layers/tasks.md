## 1. Shared helpers

- [x] 1.1 Add `src/lib/layerMeta.ts` with `shortTitle(title)` and
  `cadenceFromTimes(times)` → `{ label, kind } | null`.
- [x] 1.2 Import `shortTitle` from it in `MapAnimateControl` (drop the local copy).

## 2. Editorial metadata

- [x] 2.1 Replace `SATELLITE_LAYERS` in `aboutContent.ts` with `LAYER_INFO`, a
  `Record<layerId, { name?; satellite; description }>` keyed by WMS layer id.

## 3. Render from the API

- [x] 3.1 In `AboutDialog`, build the layer list from `useImagery().layers`:
  name = `LAYER_INFO[id].name ?? shortTitle(title)`, cadence from
  `cadenceFromTimes(times)`, satellite/description from `LAYER_INFO` with fallback.
- [x] 3.2 Show a brief loading line if imagery isn't ready; keep the card layout/badges.
- [x] 3.3 Remove the stale "plus the polar-orbiting Sentinel-3" wording.

## 4. Docs

- [x] 4.1 Update HANDOFF.md / CLAUDE.md: info-page layer list is now derived from `/imagery`.
