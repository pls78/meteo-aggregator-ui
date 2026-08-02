## MODIFIED Requirements

### Requirement: Documented content

The info page SHALL describe the app's features, its data sources, how forecasts are
aggregated, and the satellite layers, using values consistent with the backend configuration.
The described feature set SHALL include locating yourself on demand, and SHALL state what the
app does when the browser has blocked location access, so a blocked control does not read as a
broken one. The satellite-layer list SHALL be derived from the live `GET /imagery` catalog —
one entry per layer the endpoint returns — rather than a hand-maintained copy, so it cannot
drift from the backend. Each layer's update cadence SHALL be derived from the spacing of its
returned frame timestamps. Presentation details not carried by the API (short name, satellite,
description) MAY come from a UI lookup keyed by the stable layer id, and a layer with no such
entry SHALL still be listed using a fallback name and description.

#### Scenario: Features and data sources

- **WHEN** the info page is shown
- **THEN** it lists the app's key features and its data sources, including the forecast models
  with their role (global or local), native resolution, and forecast horizon

#### Scenario: Locating yourself is described

- **WHEN** the info page describes how a location is chosen
- **THEN** it covers both the location seeded on load and the control that returns to the
  user's current position on demand, rather than the on-load seed alone

#### Scenario: Blocked location access is explained

- **WHEN** the info page describes locating yourself
- **THEN** it states that the app will say so when the browser has blocked location access,
  and that re-enabling it is done in the browser's own site settings — consistent with the
  message the locate control itself shows in that situation

#### Scenario: Aggregation method with weights

- **WHEN** the info page describes how forecasts are combined
- **THEN** it explains the lead-time weighting (near-term days favor the high-resolution local
  model; longer-range days favor ECMWF), shows the configured weight values for both ranges,
  and states that weights are renormalized over the models present for a given day
- **AND** it explains that non-blendable variables (e.g. sunrise, sunset, weather code) take
  the highest-weighted model's value rather than being averaged
- **AND** it explains that confidence is derived from inter-model disagreement and ensemble
  spread, with its categorical levels and thresholds

#### Scenario: Satellite layers derived from the live catalog

- **WHEN** the info page describes the satellite layers
- **THEN** it lists one entry per layer returned by `GET /imagery`, each with a short
  description of what it shows and its update cadence derived from the layer's frame timestamps

#### Scenario: Layer list follows backend changes

- **WHEN** the backend catalog changes (a layer is added or removed)
- **THEN** the info page's list reflects that change without a UI edit, and a layer with no
  hand-authored entry is still shown with a fallback name and description
