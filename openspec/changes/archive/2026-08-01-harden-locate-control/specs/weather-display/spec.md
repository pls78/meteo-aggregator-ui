## MODIFIED Requirements

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
