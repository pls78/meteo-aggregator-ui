## Why

New visitors see a map and weather but have no explanation of what the app does, where the
numbers come from, how the multi-model consensus is computed, or what each satellite overlay
means. An in-app info page makes the app self-describing and builds trust in the forecast by
showing the method (including the weighting algorithm) openly.

## What Changes

- Add an **info / "how it works" page**, presented as an in-app modal dialog (the app has no
  router), opened from an info button and dismissed with the ✕ / Escape / scrim click.
- The page documents, from real backend config:
  - **Features** — what the app can do.
  - **Data sources** — the Open-Meteo Forecast / Ensemble / Geocoding APIs and EUMETSAT
    EUMETView, plus a table of the five models (kind, role, resolution, horizon).
  - **How we aggregate** — the lead-time weighting algorithm with the concrete near-term
    (days 1–3) and long-range (days 4+) weight tables, weight renormalization over present
    models, non-blendable variables, and the confidence levels and thresholds.
  - **Satellite layers** — each overlay's meaning and its update cadence.
- Add an info-button trigger to both the desktop overlay layout and the mobile layout.
- Track the dialog's open/closed state in the client UI store so a single dialog instance
  serves both layouts without prop-drilling.

## Capabilities

### New Capabilities
- `info-page`: an in-app informational page describing the app's features, data sources,
  aggregation/weighting method, and satellite layers, opened and closed as a modal dialog.

### Modified Capabilities
<!-- none: existing selection/comparison/layers behavior is unchanged -->

## Impact

- **Code (UI only)**: new `src/components/about/` (the dialog + its static content), a
  trigger button in `App.tsx`'s `DesktopOverlays` and in the mobile layout, and two new
  fields (`aboutOpen`, `setAboutOpen`) on `src/store/appStore.tsx`.
- **Content source of truth**: figures are transcribed from `../meteo-aggregator`'s
  `meteo_aggregator/config.py` (models, weights, cadences) and `aggregation.py` (method).
  If those change materially, the page copy must be updated to match.
- **APIs/deps**: none new. No router, no backend change. The page is static content.
