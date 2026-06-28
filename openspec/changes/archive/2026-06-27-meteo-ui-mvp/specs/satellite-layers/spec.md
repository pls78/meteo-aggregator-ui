## ADDED Requirements

### Requirement: Toggleable satellite overlays

The system SHALL list the satellite layers reported by the backend `GET /imagery` endpoint
and let the user toggle each one on or off as a map overlay.

#### Scenario: List available layers

- **WHEN** the application has loaded imagery parameters
- **THEN** a layer control lists each available satellite layer by its human-readable title

#### Scenario: Toggle a layer on

- **WHEN** the user enables a layer
- **THEN** that layer is rendered as a WMS overlay on the map, with tiles fetched directly
  from the EUMETSAT WMS endpoint using the parameters from the backend

#### Scenario: Toggle a layer off

- **WHEN** the user disables an enabled layer
- **THEN** that overlay is removed from the map

### Requirement: Overlay opacity control

The system SHALL allow the opacity of active satellite overlays to be adjusted so underlying
map and markers remain legible.

#### Scenario: Adjust opacity

- **WHEN** the user changes the opacity control for overlays
- **THEN** the rendered overlays update to the chosen opacity

### Requirement: Overlays compose over the base map

Satellite overlays SHALL render above the base map but not prevent location selection.

#### Scenario: Select a location with an overlay active

- **WHEN** a satellite overlay is active and the user clicks the map
- **THEN** location selection still works as specified in the location-selection capability
