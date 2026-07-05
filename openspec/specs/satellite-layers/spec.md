# satellite-layers Specification

## Purpose
TBD - created by archiving change meteo-ui-mvp. Update Purpose after archive.
## Requirements
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

### Requirement: Legend for active layers

The system SHALL display a legend for each active satellite layer, mapping the layer's colors
to their meaning, so the overlay can be interpreted. The legend SHALL be obtained from the
layer's own WMS service (a `GetLegendGraphic` request built from the layer's WMS URL and
name).

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

### Requirement: Active overlays refresh to the latest frame

While a satellite overlay is active, the system SHALL periodically refresh it to
the most recent frame the backend reports for that layer — without the user
toggling it off and on — so a live weather situation stays current. The refresh
SHALL update tiles in place (no flicker or loss of the chosen opacity) and SHALL
re-fetch tiles only when the reported frame has actually advanced.

#### Scenario: Newer frame becomes available

- **WHEN** a layer is active and the backend begins reporting a newer frame for
  it (a new cadence boundary has passed)
- **THEN** the overlay updates to the newer frame's tiles automatically, without
  the user re-toggling the layer

#### Scenario: No change between boundaries

- **WHEN** a layer is active and the backend still reports the same frame (no
  newer one yet)
- **THEN** the overlay is left undisturbed — its tiles are not re-fetched

#### Scenario: Opacity change does not reload tiles

- **WHEN** the user adjusts overlay opacity while the reported frame has not
  advanced
- **THEN** the overlay's opacity updates without re-fetching its tiles

