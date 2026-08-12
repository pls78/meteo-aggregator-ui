# satellite-layers (delta)

## MODIFIED Requirements

### Requirement: Animate control stays clear of the weather sheet

The system SHALL keep the time-lapse control visible and usable when the weather
detail sheet (the hourly forecast or confidence detail for a day) is open: opening
the sheet SHALL NOT cover the control. On the desktop layout the sheet SHALL rest
flush at the bottom edge and the control SHALL move above the sheet's top edge when
the sheet's panel would overlap it — the same clearance behavior, transform-only
motion, and reduced-motion handling as the layer control. When no sheet is open (or
the sheet does not reach the control), the control SHALL rest near the bottom of the
map as before.

#### Scenario: Forecast does not cover the control

- **WHEN** a layer is animating (its control is shown) and the user opens a day's
  hourly forecast
- **THEN** the play/pause control moves above the forecast sheet and remains fully
  visible and usable, and the sheet stays at the bottom edge

#### Scenario: Control rests at the bottom when no sheet is open

- **WHEN** a layer is animating and no weather detail sheet is open
- **THEN** the control sits near the bottom-centre of the map as before

#### Scenario: Activating a layer while a sheet is open

- **WHEN** a detail sheet is open and the user activates a satellite layer (making the
  control appear)
- **THEN** the control appears clear of the sheet, not overlapped by it
