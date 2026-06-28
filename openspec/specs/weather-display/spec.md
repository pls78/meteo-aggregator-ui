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

