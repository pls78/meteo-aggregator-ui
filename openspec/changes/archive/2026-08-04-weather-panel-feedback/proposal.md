# Weather panel feedback: actionable errors, visible day detail

## Why

Two deferred finish-review findings: (1) error copy still speaks developer ("Is the backend running?") — a deployed user can't act on it; (2) on mobile at the half-height sheet, tapping a day can leave its hourly chart below the fold, so the tap appears to do nothing beyond the row highlight.

## What Changes

- Error copy rewritten to name the problem and a user-actionable recovery ("Couldn't load the forecast. Check your connection and try again.") across the location card, weather sheet, and hourly panel. The layer-panel messages already conform.
- On mobile, opening a day's detail (hourly or confidence) scrolls the detail section into view inside the sheet, so the tap always produces visible feedback.
- No other behavior changes.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `weather-display`: adds requirements for actionable error copy and for the selected day's detail becoming visible on selection.

## Impact

- `panels/LocationCard.tsx`, `mobile/WeatherSheet.tsx`, `hourly/HourlyPanel.tsx` (copy); `mobile/WeatherSheet.tsx` (scroll-into-view effect). Retires the error-copy deviation in `DESIGN.md`.
