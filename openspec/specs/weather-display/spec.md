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
`GET /forecast` response.

#### Scenario: Show daily forecast

- **WHEN** a location is selected
- **THEN** the card lists upcoming days, each with a weather icon, daily max/min temperature,
  and precipitation indication, in metric units

#### Scenario: Confidence is surfaced

- **WHEN** a forecast day carries a confidence level
- **THEN** the UI conveys that day's confidence (e.g. high/medium/low)

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

