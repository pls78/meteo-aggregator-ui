# Design — weather-panel-feedback

## Context

Both items were reviewer findings deferred as user follow-ups; the user approved them. React Query already retries and refetches on refocus, so "try again" is honest recovery advice without adding a retry button.

## Goals / Non-Goals

**Goals:** every weather-data error names the problem + a recovery a visitor can perform; a mobile day tap always yields visible feedback. **Non-Goals:** retry buttons; changing sheet snap heights; desktop changes (the hourly overlay is always fully visible when opened).

## Decisions

1. **Copy pattern**: "Couldn't load the forecast|hourly data. Check your connection and try again." Short variants ("Couldn't load forecast.") stay as-is where they sit inside an already-explained context but gain the article for grammar where touched. No component or infrastructure names in user-facing copy — codified as a spec requirement.
2. **Scroll-into-view**: a ref on the WeatherSheet detail section; an effect on `[selectedDay, selectedDayView]` calls `scrollIntoView({ behavior: 'smooth', block: 'start' })` when a day is set. The nearest scrollable ancestor is the sheet's internal scroll container, so the map never moves. Respects `prefers-reduced-motion` via `behavior: matchMedia ? 'auto' : 'smooth'`.

## Risks / Trade-offs

- [Smooth scroll on every re-render] → effect keyed to day/view identity only, not data arrival.

## Migration Plan

Copy + one effect; rollback = git revert.

## Open Questions

None.
