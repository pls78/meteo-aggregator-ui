# weather-display Specification

## Purpose
TBD - created by archiving change meteo-ui-mvp. Update Purpose after archive.
## Requirements
### Requirement: Current conditions card

The system SHALL display current conditions for a selected location, derived from the first
hour (`lead_hour` 0) of the backend `GET /hourly` response.

#### Scenario: Show current conditions

- **WHEN** a location is selected
- **THEN** an overlay card shows at least the current temperature, relative humidity, and a
  weather-condition icon/label derived from the WMO `weather_code`, in metric units

### Requirement: Daily forecast

The system SHALL display the multi-day forecast for a selected location from the backend
`GET /forecast` response. Each day SHALL be presented as a single line: the container SHALL
size itself to fit the day's values rather than wrapping a day across two lines, up to a
bound that keeps it an overlay on the map rather than a full panel.

#### Scenario: Show daily forecast

- **WHEN** a location is selected
- **THEN** the card lists upcoming days, each with a weather icon, daily max/min temperature,
  and precipitation indication, in metric units

#### Scenario: Confidence is surfaced

- **WHEN** a forecast day carries a confidence level
- **THEN** the UI conveys that day's confidence (e.g. high/medium/low)

#### Scenario: A day's values keep to one line

- **WHEN** a day's combination of max/min temperature, precipitation and confidence label is
  wider than the container's usual width — for example sub-zero temperatures on both bounds
  alongside a multi-digit precipitation figure
- **THEN** the container widens to accommodate that day and every row stays on a single line,
  rather than one row wrapping while the others do not

#### Scenario: Widening is bounded

- **WHEN** the widest day would require more width than the bound allows
- **THEN** the container stops at that bound and remains an overlay that leaves the map
  visible, rather than growing without limit

### Requirement: Loading and error states

The system SHALL communicate loading and error states while weather data is fetched.

#### Scenario: Backend unavailable

- **WHEN** a weather request fails
- **THEN** the card shows an error state rather than failing silently or showing stale data
  as current

### Requirement: Open an hourly view for a chosen day

The system SHALL let the user open a per-hour view for a specific forecast day by selecting
that day from the daily forecast list. The selected day SHALL be indicated in the list.

#### Scenario: Tap a day to open its hours

- **WHEN** the user taps a day in a location's daily forecast list
- **THEN** an hourly detail view opens for that day and the tapped day is visually marked as
  selected

#### Scenario: Dismiss the hourly view

- **WHEN** the hourly view is open and the user closes it (close control or re-selecting the
  active day)
- **THEN** the hourly view is dismissed and no day is marked as selected

### Requirement: Hourly detail for the selected day

The system SHALL display, for the selected day, the location's hourly forecast derived from
the backend `GET /hourly` response — at least an hour-by-hour temperature curve and
precipitation, plus per-hour weather-condition icons — in metric units. Only the hours
belonging to the selected local calendar day SHALL be shown.

#### Scenario: Show a day's hours

- **WHEN** a day is selected for a location
- **THEN** the hourly view shows that day's temperature across the hours as a line, hourly
  precipitation, and weather-condition icons, labeled with the day

#### Scenario: Partial current day

- **WHEN** the selected day is today (the hourly series begins at the current hour)
- **THEN** the hourly view shows the remaining hours of today without implying data before the
  current hour

#### Scenario: Day beyond the hourly horizon

- **WHEN** the selected day has no hourly data available (beyond the hourly horizon)
- **THEN** the hourly view shows an explicit "no hourly data for this day" state rather than an
  empty chart

### Requirement: Hourly view loading and error states

The system SHALL communicate loading and error states while the hourly data for the selected
day is fetched.

#### Scenario: Backend unavailable for hourly

- **WHEN** the hourly request for the selected day fails
- **THEN** the hourly view shows an error state rather than failing silently or showing stale
  hours

### Requirement: Weather presented as a bottom sheet on small screens

On the mobile layout, the system SHALL present the selected location's weather in a draggable
bottom sheet with at least three snap heights — a collapsed **peek** (current conditions only), a
**half** height (adds the daily forecast), and a **full** height (adds the hourly detail) — so the
map stays visible and the weather never permanently covers it. The sheet's content SHALL scroll
within the sheet without panning the map.

#### Scenario: Peek keeps the map clear

- **WHEN** a location is selected and the sheet is at its collapsed peek height
- **THEN** at least the current temperature is shown and the large majority of the map remains
  visible

#### Scenario: Expand for more detail

- **WHEN** the user drags or taps the sheet handle to a taller height
- **THEN** the sheet reveals the daily forecast (half) and the hourly detail for the selected day
  (full)

#### Scenario: Content scrolls without moving the map

- **WHEN** the user scrolls the weather content inside the sheet
- **THEN** the sheet content scrolls and the underlying map does not pan or zoom

#### Scenario: Tap a day for its hours on mobile

- **WHEN** the user taps a day in the sheet's daily list
- **THEN** that day's hourly chart is shown within the sheet (no separate panel)

### Requirement: Confidence label is a distinct, discoverable control

Within a day row, the confidence label (high/medium/low) SHALL be its own
click/tap target, visually distinct from the rest of the row and carrying an
affordance that it is actionable (so it reads as tappable on touch as well as
hover). Activating the label SHALL NOT trigger the day's hourly view, and
activating the rest of the row SHALL NOT trigger the confidence detail. This
SHALL hold in both the desktop and mobile layouts.

#### Scenario: Label is separately actionable

- **WHEN** the user activates a day's confidence label
- **THEN** the day's confidence detail opens and its hourly view does not

#### Scenario: Rest of the row keeps hourly behaviour

- **WHEN** the user activates any part of the day row other than the confidence
  label
- **THEN** the day's hourly view opens, unchanged

#### Scenario: Label is keyboard operable

- **WHEN** the user focuses the confidence label and activates it via keyboard
- **THEN** the confidence detail for that day opens

### Requirement: Per-day confidence detail

The system SHALL present, for a day whose confidence label is activated, a
confidence detail in place of that day's hourly view. The detail SHALL list each
model present in the day's `breakdown` with its day-high temperature and its
blend weight for that day (renormalized over the models present, matching how the
consensus is blended), show the consensus day-high, and give a plain-language
explanation of how the confidence level was derived — that it reflects how much
the models disagree on the day's high (and ensemble spread when available), the
resulting spread, and the thresholds that map spread to high/medium/low. All
values SHALL come from the existing `/forecast` response; no extra request SHALL
be required. Only one of the hourly view and the confidence detail SHALL be
visible for the selected day at a time.

#### Scenario: Show the per-model breakdown and explanation

- **WHEN** the confidence detail is shown for a day
- **THEN** it lists each contributing model with its day-high temperature and
  blend weight, shows the consensus, and explains how the confidence level was
  computed, consistent with the label shown

#### Scenario: Detail takes the hourly slot

- **WHEN** the confidence detail is shown for a day
- **THEN** it occupies the same area the hourly view uses and that day's hourly
  chart is not shown

#### Scenario: Switch back to hourly

- **WHEN** the confidence detail is shown and the user then activates the rest of
  the same day row
- **THEN** the view switches to that day's hourly forecast

#### Scenario: Missing model is omitted

- **WHEN** a model provides no value for the selected day
- **THEN** that model is omitted from the detail rather than shown empty

### Requirement: Hourly chart fills the width and adapts point density

The hourly detail chart SHALL fill the width available in its container rather
than a fixed width, and SHALL choose how many temperature points to plot from
that width: a point roughly every 3 hours when narrow, every 2 hours at medium
width, and every hour when wide. Each plotted point SHALL be labelled with its
hour, and hour-axis labels SHALL NOT be denser than the plotted points. The
choice SHALL update if the container is resized.

#### Scenario: Wide container shows hourly detail

- **WHEN** the chart is rendered in a wide container (e.g. the desktop panel)
- **THEN** it spans the container width and plots a temperature point for every
  hour, each labelled with its hour

#### Scenario: Narrow container stays uncluttered

- **WHEN** the chart is rendered in a narrow container (e.g. the mobile sheet)
- **THEN** it spans the container width and plots fewer points (about every 3
  hours) so labels and markers do not crowd

### Requirement: Inspect a point's value

The system SHALL let the user read the value at a plotted point: on a
pointer-capable device, hovering the chart SHALL snap to the nearest plotted
point; on touch, tapping SHALL select the nearest plotted point. The selected
point SHALL be marked with a vertical crosshair and its temperature value, for
each series shown. Moving the mouse away SHALL clear the indicator; a touch
selection MAY persist until the next tap.

#### Scenario: Hover shows the value

- **WHEN** the user hovers over the hourly chart on a pointer device
- **THEN** a crosshair marks the nearest plotted point and its temperature value
  is shown for each series

#### Scenario: Tap shows the value on touch

- **WHEN** the user taps a point on the hourly chart on a touch device
- **THEN** a crosshair marks the nearest plotted point and its temperature value
  is shown

### Requirement: Actionable error copy

User-facing error messages in the weather panels SHALL name what failed in the visitor's terms and a recovery the visitor can perform. They SHALL NOT reference internal components, infrastructure, or developer concepts (e.g. "backend").

#### Scenario: Forecast fails to load

- **WHEN** the forecast or hourly request fails
- **THEN** the panel shows a message naming what couldn't load and advising a user-performable recovery (e.g. checking the connection and trying again)

### Requirement: Selected day detail becomes visible

On the mobile layout, selecting a day (for its hourly chart or its confidence detail) SHALL bring the day's detail section into view within the sheet, so the selection always produces visible feedback beyond the row highlight.

#### Scenario: Day tapped at half-height sheet

- **WHEN** the user taps a day while the sheet's detail area is scrolled away
- **THEN** the sheet's content scrolls the detail section into view (animated only when the user allows motion)
