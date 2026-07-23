> Backfill of shipped work — all tasks are already implemented, deployed, and verified.

## 1. Store

- [x] 1.1 Add `selectedDayView: 'hourly' | 'confidence'` and `showDayConfidence(date)` to `store/appStore`; `selectDay` sets `'hourly'`; `clearDay` leaves the view untouched.

## 2. Shared components

- [x] 2.1 `components/confidence/ConfidenceDetail` — per-model day-high + blend weight (renormalized), consensus, and the confidence explanation, derived from `/forecast` `breakdown` + `confidence`; weights/thresholds transcribed from backend `config.py` with keep-in-sync comments.
- [x] 2.2 `components/confidence/ConfidenceTag` — the clickable confidence label with an info cue and an active ring, shared by both layouts.

## 3. Desktop

- [x] 3.1 `panels/LocationCard` — split each day row into a day-area button (→ hourly) and the confidence tag (→ confidence), each highlighting only when it is the open view.
- [x] 3.2 `hourly/HourlyPanel` — render `ConfidenceDetail` in the hourly slot when `selectedDayView === 'confidence'` (one column per present location); otherwise the chart.

## 4. Mobile

- [x] 4.1 `mobile/WeatherSheet` — same row split, and branch the sheet's detail section on `selectedDayView`.

## 5. Verify

- [x] 5.1 Desktop + mobile: label opens the confidence detail; elsewhere opens hourly; toggling the label closes it; the explanation matches the level; no chart flash on close.
