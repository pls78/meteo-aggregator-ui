## 1. Selected-day state

- [x] 1.1 In `src/store/appStore.tsx`, add `selectedDay: string | null` (`YYYY-MM-DD`),
      `selectDay(date: string)` and `clearDay()` to the store and context value
- [x] 1.2 `selectDay` toggles: selecting the already-active day clears it
- [x] 1.3 When `clearLocation` leaves no location selected (primary and comparison both null),
      also clear `selectedDay`

## 2. Day rows become buttons

- [x] 2.1 In `src/components/panels/LocationCard.tsx`, wrap each day `<li>`'s content in a
      `<button>` that calls `selectDay(day.date)`
- [x] 2.2 Highlight the row whose `date === selectedDay` (e.g. ring/background) and set
      `aria-pressed`

## 3. Lazy full-week hourly query

- [x] 3.1 In `src/hooks/queries.ts`, add `useHourlyRange(loc, { enabled })` fetching 168 h,
      `enabled` gated on both `loc !== null` and the passed `enabled` (i.e. a day is selected);
      leave the existing 24 h `useHourly` untouched

## 4. HourlyChart (inline SVG, no new dep)

- [x] 4.1 Create `src/components/hourly/HourlyChart.tsx` taking one or two named series
      (`{ hours, accent, name }`) already filtered to the selected day
- [x] 4.2 Draw a temperature polyline per series on a shared y scale (min→max across series)
- [x] 4.3 Draw precipitation bars beneath on a secondary scale; paired (side-by-side) bars per
      hour when two series are present, using the accents at reduced opacity
- [x] 4.4 Render an hour-of-day x axis (ticks ~every 3 h) spanning only the hours present
- [x] 4.5 Place weather-condition icons (`weatherInfo`) at a few hour marks for the primary
      series
- [x] 4.6 Follow the `dataviz` skill for scales/colors/axes; keep it dependency-free and
      responsive (`overflow-x` container if it must scroll)

## 5. HourlyPanel (bottom sheet)

- [x] 5.1 Create `src/components/hourly/HourlyPanel.tsx`: render nothing when
      `selectedDay === null`
- [x] 5.2 For each present location (primary, comparison) call `useHourlyRange(loc, { enabled:
      selectedDay !== null })` and slice `hours.filter(h => h.date.slice(0,10) === selectedDay)`
- [x] 5.3 Header: the selected day (weekday + date) and a close button that calls `clearDay()`
- [x] 5.4 Legend: one entry per present location, name + accent color
- [x] 5.5 States: loading (pending), error (mirror `LocationCard`'s backend-down copy), and
      empty ("No hourly data for this day" when no hours match)
- [x] 5.6 Pass the sliced series to `HourlyChart`; single series when only primary is selected
- [x] 5.7 Slide-up enter/exit animation consistent with `FadingCard`'s opacity/translate idiom

## 6. Wire into the app

- [x] 6.1 Mount `<HourlyPanel />` in a bottom overlay in `src/App.tsx` (pointer-events-auto,
      does not block the map elsewhere)

## 7. Verify

- [x] 7.1 `npm run build` and `npm run lint` pass
- [x] 7.2 Live check (backend running with the tz-alignment change): tap a day → sheet opens
      with that day's hours; the hours shown match the tapped local day (evening hours
      present, no next-day bleed); Shift+click a second location → both lines appear color-
      coded with a legend; clear comparison → single line; close → sheet dismisses; a far-out
      day with no hourly data shows the empty state — verified by the user
