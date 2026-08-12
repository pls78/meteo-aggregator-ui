# satellite-layers (delta)

## ADDED Requirements

### Requirement: Layer control stays clear of the weather detail sheet

On the desktop layout, the system SHALL keep the layer control clear of the weather
detail sheet (the hourly forecast or confidence detail for a day): while a sheet is
open, the control SHALL sit above the sheet's top edge rather than overlapping it,
following the sheet's actual height, and the reposition SHALL animate using only
compositor-friendly properties (no animation under reduced motion). When no sheet is
open, the control SHALL rest at the bottom-left of the map as before.

#### Scenario: Sheet does not overlap the control

- **WHEN** the user opens a day's hourly forecast or confidence detail on desktop
- **THEN** the layer control moves above the sheet and no part of it overlaps the sheet

#### Scenario: Control returns when the sheet closes

- **WHEN** the detail sheet is closed
- **THEN** the layer control returns to its bottom-left resting position

#### Scenario: Control follows the sheet's height

- **WHEN** the open sheet's height changes (e.g. switching between the hourly chart and
  the confidence detail, or content finishing loading)
- **THEN** the layer control repositions to stay just above the sheet's top edge
