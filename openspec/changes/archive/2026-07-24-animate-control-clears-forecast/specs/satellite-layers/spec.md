## ADDED Requirements

### Requirement: Animate control stays clear of the weather sheet

The system SHALL keep the time-lapse control visible and usable when the weather
detail sheet (the hourly forecast or confidence detail for a day) is open:
opening the sheet SHALL NOT cover the control, and the control SHALL be
positioned clear of the sheet. When no sheet is open, the control SHALL rest near
the bottom of the map as before.

#### Scenario: Forecast does not cover the control

- **WHEN** a layer is animating (its control is shown) and the user opens a day's
  hourly forecast
- **THEN** the play/pause control remains fully visible and usable, not covered by
  the forecast sheet

#### Scenario: Control rests at the bottom when no sheet is open

- **WHEN** a layer is animating and no weather detail sheet is open
- **THEN** the control sits near the bottom-centre of the map as before
