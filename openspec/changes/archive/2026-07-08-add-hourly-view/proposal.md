## Why

The backend already returns a full multi-model **hourly** consensus (`GET /hourly`, up to
168 h), and the UI already fetches it — but only `hours[0]` is used, for the "current
conditions" line. Everything past the current hour is fetched and discarded. Users who want
to know *how a day unfolds* (when the rain comes, the afternoon peak, the cool of the evening)
have no way to see it, and there is no way to compare two places hour-by-hour for a given day.

## What Changes

- **Tap a day to open its hours.** Each day row in the location card becomes a button. Tapping
  it selects that day and opens an **hourly detail sheet**. The selected day is shared state,
  so it drives the view for both locations at once.
- **Full-width bottom sheet.** The hourly view slides up across the bottom of the map (the
  narrow top-right cards stay put), giving room for a real chart. It shows the picked day's
  hourly **temperature** as a line chart, **precipitation** as bars beneath, plus per-hour
  weather icons and an hour axis, in metric units.
- **Overlaid two-location comparison.** When both a primary and a comparison location are
  selected, the sheet draws **one temperature line per location** on a shared scale, each in
  its location's marker color (primary blue `#2563eb`, comparison amber `#f59e0b`), with a
  legend — so the hour-by-hour gap between the two places is visible at a glance for the same
  day. Precipitation is shown as paired bars per hour.
- **States.** Loading, error (backend down), and "no hourly data for this day" (a day beyond
  the hourly horizon) are all handled. Closing the sheet or clearing all locations dismisses
  it.
- **Frontend-only**, but depends on the backend hourly timestamps being location-local so
  hours group correctly under the tapped day — see the companion backend change
  `2026-07-08-align-hourly-timezone` in `../meteo-aggregator`.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `weather-display`: adds an hourly detail view for a selected day (temperature line,
  precipitation bars, per-hour weather icons), opened by tapping a day in the forecast list.
- `location-comparison`: when two locations are selected, their hourly series for the selected
  day are compared on one overlaid chart, color-coded per location.

## Impact

- **New UI code:** `src/components/hourly/HourlyPanel.tsx` (the bottom sheet: day header,
  legend, states, close) and `src/components/hourly/HourlyChart.tsx` (self-contained inline
  SVG temperature-line + precipitation-bar chart — no new charting dependency).
- **Changed UI code:**
  - `src/store/appStore.tsx` — add `selectedDay` + `selectDay`/`clearDay`; clear it when no
    location remains.
  - `src/components/panels/LocationCard.tsx` — day rows become buttons that call `selectDay`,
    with the active day highlighted.
  - `src/hooks/queries.ts` — a lazy hook fetching the full hourly week (168 h), enabled only
    when a day is selected; the existing 24 h `useHourly` for current conditions is untouched.
  - `src/App.tsx` — mount `<HourlyPanel />` in a bottom overlay.
- **No API contract change** (`src/api/*` unchanged). Requires the backend tz-alignment change
  to be deployed for correct day grouping.
