## Context

The daily list already renders a confidence badge per day (`weather-display`).
The `/forecast` response carries `breakdown[]` (per-model `{model, role, values}`,
including `temperature_2m_max`) and `confidence` (`{level, low, high, spread}`),
both previously unused by the UI. The desktop hourly slot (`HourlyPanel`) and the
mobile sheet's detail section already animate open per `selectedDay`.

## Goals / Non-Goals

**Goals:** surface the reasoning behind each day's confidence from data already
fetched; keep desktop and mobile in sync; no backend change, no extra request.

**Non-Goals:** exposing a backend "rationale" field; splitting the ensemble-spread
vs inter-model-disagreement components (not in the response — the single `spread`
is what is explained).

## Decisions

**UI-only, derived from existing data.** The blend weights are the backend
lead-time tables renormalized over the models present that day; they and the
band thresholds are transcribed from `config.py` (as the info page already does),
with keep-in-sync comments. Rejected exposing a backend field: it would couple a
wording change to an API deploy and duplicate thresholds the UI can interpret.

**One store field drives both views.** `selectedDayView: 'hourly' | 'confidence'`
plus `showDayConfidence(date)`; `selectDay` sets `'hourly'`. `clearDay` leaves the
view untouched so the close animation doesn't flip content mid-fade.

**Two click targets per row.** The row is a flex container holding the day-area
button (hourly) and the confidence tag button (confidence) — a nested interactive
element is invalid HTML. Each highlights only when it is the open view. A shared
`ConfidenceTag` and `ConfidenceDetail` keep desktop and mobile identical.

## Risks / Trade-offs

- **Thresholds/weights drift from backend config** → hardcoded, commented against
  `config.py`, matching the accepted info-page coupling.
- **Two layouts drift** → shared components + one store action.
- **Per-location on desktop** → the desktop hourly panel shows one confidence
  column per present location; the shared `selectedDay` picks the day.
