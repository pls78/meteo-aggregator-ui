## Context

The card already renders a 7-day list (`LocationCard`) and already holds an hourly query
(`useHourly`, 24 h) whose only consumer is `hours[0]`. Two location slots (primary/comparison)
with fixed accent colors already exist. This change surfaces the hourly data and reuses the
two-slot machinery for comparison. It is frontend-only and leans on the companion backend
change so hourly timestamps share the daily local calendar.

## Decisions

### Activation: tap a day row (shared selected day)

Tapping a day in either card sets a single `selectedDay` (`YYYY-MM-DD`) in the store. One
shared day — not per-card — because the goal is comparing both locations *for the same day*;
tapping a day in the comparison card reframes both. The tapped day is highlighted in the
card(s). Re-tapping the active day (or the sheet's close button) clears it.

### Layout: full-width bottom sheet

The cards are 288 px and pinned top-right; a chart does not fit there and side-by-side
comparison across two narrow cards is hard to read. A bottom sheet spanning the map width has
room for an overlaid chart and a legend, and leaves the map and cards untouched. It slides up
using the same opacity/translate transition idiom as `FadingCard`.

### Data: lazy full-week hourly query

Add `useHourlyRange(loc, { enabled })` = `useHourly` semantics at **168 h**, `enabled` only
when `selectedDay !== null`, so the heavier week-long payload is fetched only when a user
actually drills in. The existing 24 h `useHourly` (current conditions) is left alone — its
cache entry is independent (different `hours` in the query key). Each present location gets its
own week query; the sheet slices `week.hours.filter(h => h.date.slice(0,10) === selectedDay)`.
Because the backend now returns local timestamps (companion change), that string compare is
correct without any offset math.

### Chart: self-contained inline SVG, no new dependency

`HourlyChart` renders an SVG with:
- **Temperature**: one polyline per present location, colored by its accent, on a shared y
  scale (min→max across both series) so the vertical gap is meaningful. Dots optional.
- **Precipitation**: thin bars beneath on a secondary scale; when two locations are present,
  paired (side-by-side) bars per hour, same accents at lower opacity.
- **X axis**: hour-of-day ticks (e.g. every 3 h). "Today" legitimately starts at the current
  hour, so the axis spans only the hours actually present for the day.
- **Weather icons**: the WMO icon (`weatherInfo`) at a few hour marks for the primary series.
- Follows the `dataviz` skill for scales, color, and axis treatment; kept dependency-free to
  avoid adding a charting lib to a small app.

### States

- **Loading**: skeleton/placeholder while either present location's week query is pending.
- **Error**: backend-down message, mirroring `LocationCard`'s error copy.
- **Empty**: a day beyond the hourly horizon yields no matching hours → "No hourly data for
  this day" rather than an empty chart.
- **One vs two locations**: a single line when only primary is selected; two overlaid lines +
  legend when both are.

### Dismissal

Close button clears `selectedDay`. Clearing the primary (and comparison) location clears
`selectedDay` too, so the sheet never lingers over no data. Clearing only the comparison
collapses the chart back to a single line but keeps the sheet open.

## Risks / Trade-offs

- **Two hourly queries per location** (24 h + 168 h) when the sheet is open. Accepted: the
  168 h query is lazy and cached; the 24 h one already exists and stays instant for current
  conditions. If payload becomes a concern, the two could later be unified at 168 h.
- **Day beyond horizon**: `days=7` in the daily list can exceed the 168 h hourly window for
  the last day; handled by the empty state.
- **Depends on the backend tz change**: before it deploys, day grouping is off by the
  location's UTC offset. The UI change should land after the backend change is live.
