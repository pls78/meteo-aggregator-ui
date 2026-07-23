## Why

The daily forecast already shows each day's confidence level (high/medium/low),
but not *why*. The per-model breakdown and confidence spread are in the
`/forecast` response yet never surfaced. Making the confidence label a control
that reveals the reasoning turns an opaque badge into an explanation.

> Backfill: this change documents behaviour already implemented and shipped. The
> confidence-computation capability on the backend has its own spec in the
> sibling repo (`../meteo-aggregator/openspec/specs/confidence-detail/`); this
> change specs the **UI** interaction and view.

## What Changes

- The confidence label in a day row becomes its own click target, visually
  distinct and discoverable (an info cue), separate from the rest of the row.
- Clicking/tapping it opens a **confidence detail** for that day in the same slot
  the hourly view uses, replacing the hourly chart: each contributing model's
  day-high temperature, its blend weight for that day, the consensus, and a
  plain-language explanation of how the level was derived (model spread → band).
- Clicking anywhere else on the day row keeps the existing hourly behaviour.
- No backend change: the view is derived from data already in `/forecast`
  (`breakdown[]`, `confidence`); the blend weights mirror the backend config.

## Capabilities

### Modified Capabilities
- `weather-display`: adds the confidence-label control and the per-day confidence
  detail view alongside the existing daily forecast and hourly view.

## Impact

- UI only: `components/confidence/` (`ConfidenceDetail`, `ConfidenceTag`),
  `panels/LocationCard`, `mobile/WeatherSheet`, `hourly/HourlyPanel`, and the
  `selectedDayView` field / `showDayConfidence` action in `store/appStore`.
- No API or backend change.
