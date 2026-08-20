# satellite-layers Specification (delta)

## MODIFIED Requirements

### Requirement: Toggleable satellite overlays

The system SHALL list the satellite layers reported by the backend `GET /imagery` endpoint
and let the user toggle each one on or off as a map overlay.

#### Scenario: List available layers

- **WHEN** the application has loaded imagery parameters
- **THEN** a layer control lists each available satellite layer by its human-readable title

#### Scenario: Toggle a layer on

- **WHEN** the user enables a layer
- **THEN** that layer is rendered as a WMS overlay on the map, with tiles fetched through
  the same-origin `/wms` route (see the wms-proxy capability) using the layer parameters
  from the backend

#### Scenario: Toggle a layer off

- **WHEN** the user disables an enabled layer
- **THEN** that overlay is removed from the map

### Requirement: Legend for active layers

The system SHALL display a legend for each active satellite layer, mapping the layer's colors
to their meaning, so the overlay can be interpreted. The legend SHALL be obtained from the
layer's WMS service (a `GetLegendGraphic` request built from the layer's name), requested
through the same-origin `/wms` route.

#### Scenario: Show a legend when a layer is active

- **WHEN** a satellite layer is active
- **THEN** its legend (color key) is shown in the Satellite layers panel near that layer

#### Scenario: No legend when inactive

- **WHEN** a layer is not active
- **THEN** no legend is shown for it

#### Scenario: Legend unavailable

- **WHEN** a layer's legend image fails to load
- **THEN** the layer remains usable and no broken legend is shown

#### Scenario: Placeholder legend suppressed

- **WHEN** the WMS returns only a generic placeholder legend for a layer that has no real
  color key (e.g. continuous single-channel or RGB imagery)
- **THEN** no legend is shown for that layer (the meaningless placeholder is hidden)
