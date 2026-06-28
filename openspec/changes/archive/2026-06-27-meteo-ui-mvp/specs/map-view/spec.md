## ADDED Requirements

### Requirement: Full-screen interactive base map

The system SHALL present a full-screen, pannable and zoomable base map that fills the
viewport and serves as the primary surface for all location interaction and overlays.

#### Scenario: Map fills the viewport

- **WHEN** the application loads
- **THEN** a base map is displayed covering the full browser viewport, with attribution for
  the tile provider

#### Scenario: Pan and zoom

- **WHEN** the user drags the map or uses the zoom controls / scroll / pinch
- **THEN** the map pans and zooms smoothly and continues to render base tiles

### Requirement: Programmatic recentering

The map SHALL support recentering and zooming to a given coordinate so other capabilities
(e.g. search selection) can bring a chosen location into view.

#### Scenario: Recenter to a coordinate

- **WHEN** another capability requests the map to focus a latitude/longitude
- **THEN** the map animates to center on that coordinate at an appropriate zoom level
