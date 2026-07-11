## ADDED Requirements

### Requirement: In-app info page

The system SHALL provide an in-app informational page, presented as a modal dialog over the
map, that a user can open from a visible info control and dismiss. The page SHALL be available
in both the desktop and mobile layouts.

#### Scenario: Open the info page

- **WHEN** the user activates the info control in either layout
- **THEN** a modal dialog opens over the map showing the informational content, and the map
  behind it does not scroll or pan while the dialog is open

#### Scenario: Dismiss the info page

- **WHEN** the info dialog is open and the user clicks the close control, presses Escape, or
  clicks the backdrop outside the dialog
- **THEN** the dialog closes and the map returns to normal interaction

### Requirement: Documented content

The info page SHALL describe the app's features, its data sources, how forecasts are
aggregated, and the satellite layers, using values consistent with the backend configuration.

#### Scenario: Features and data sources

- **WHEN** the info page is shown
- **THEN** it lists the app's key features and its data sources, including the forecast models
  with their role (global or local), native resolution, and forecast horizon

#### Scenario: Aggregation method with weights

- **WHEN** the info page describes how forecasts are combined
- **THEN** it explains the lead-time weighting (near-term days favor the high-resolution local
  model; longer-range days favor ECMWF), shows the configured weight values for both ranges,
  and states that weights are renormalized over the models present for a given day
- **AND** it explains that non-blendable variables (e.g. sunrise, sunset, weather code) take
  the highest-weighted model's value rather than being averaged
- **AND** it explains that confidence is derived from inter-model disagreement and ensemble
  spread, with its categorical levels and thresholds

#### Scenario: Satellite layers with update period

- **WHEN** the info page describes the satellite layers
- **THEN** each layer is listed with a short description of what it shows and its update
  cadence

### Requirement: Dialog state in the shared store

The system SHALL hold the info dialog's open/closed state in the client UI store so that a
single dialog instance can be opened from either layout's control.

#### Scenario: One dialog served from either layout

- **WHEN** the info control is activated from the desktop or the mobile layout
- **THEN** the same shared open state drives a single dialog instance, and closing it resets
  that shared state
