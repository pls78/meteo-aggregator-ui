# satellite-layers (delta)

## MODIFIED Requirements

### Requirement: Layer control stays clear of the weather detail sheet

On the desktop layout, the system SHALL keep the layer control clear of the weather
detail sheet (the hourly forecast or confidence detail for a day): while an open sheet's
panel would overlap the control, the control SHALL sit above the sheet's top edge,
following the sheet's actual height, and the reposition SHALL animate using only
compositor-friendly properties (no animation under reduced motion). While no sheet is
open — or the open sheet's panel does not reach the control's position — the control
SHALL rest at the bottom-left of the map as before.

#### Scenario: Sheet does not overlap the control

- **WHEN** the user opens a detail sheet on desktop whose panel extends over the layer
  control's bottom-left position
- **THEN** the layer control moves above the sheet and no part of it overlaps the sheet

#### Scenario: Control stays put when the sheet is clear of it

- **WHEN** the open sheet's panel is narrow enough that it would not overlap the layer
  control (e.g. a centered confidence detail)
- **THEN** the control remains at its bottom-left resting position

#### Scenario: Control returns when the sheet closes

- **WHEN** the detail sheet is closed
- **THEN** the layer control returns to its bottom-left resting position

#### Scenario: Control follows the sheet's height

- **WHEN** the open sheet's size changes (e.g. switching between the hourly chart and the
  confidence detail, or content finishing loading)
- **THEN** the layer control repositions — up, down, or back to rest — so it never
  overlaps the sheet and never lifts without need
