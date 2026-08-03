# map-view Specification

## Purpose
TBD - created by archiving change meteo-ui-mvp. Update Purpose after archive.
## Requirements
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

### Requirement: Vector-rendered base map

The base map SHALL be rendered from vector tiles so that labels and geometry remain crisp at
any zoom level and on high-density (HiDPI/retina) displays, without the upscaling blur or
fixed label sizing of raster tiles.

#### Scenario: Crisp at any zoom

- **WHEN** the user zooms the map in or out
- **THEN** labels and features stay sharp rather than appearing pixelated or upscaled

#### Scenario: Sharp on HiDPI displays

- **WHEN** the map is viewed on a high-density display
- **THEN** the base map and its labels render at full sharpness

### Requirement: Responsive mobile layout

On small (phone-sized) viewports the system SHALL present a mobile-optimized layout in place of
the desktop overlay layout, while sharing the same full-screen map. The desktop layout SHALL be
used on larger viewports.

#### Scenario: Mobile layout on a small viewport

- **WHEN** the app is viewed on a viewport at or below the mobile breakpoint
- **THEN** the mobile layout (bottom sheet, A/B target control, layers FAB) is shown and the
  desktop floating cards / inline layer panel are not

#### Scenario: Desktop layout on a large viewport

- **WHEN** the app is viewed on a viewport above the mobile breakpoint
- **THEN** the existing desktop overlay layout is shown, unchanged

#### Scenario: Map is shared across layouts

- **WHEN** either layout is active
- **THEN** the same full-screen, pannable/zoomable base map underlies it and remains the surface
  for location selection and overlays

### Requirement: Overlay panels use the shared panel material

The floating panels and controls layered above the map SHALL use the single
shared panel material defined by the `visual-design` capability (currently a
near-opaque paper ground with a subtle backdrop blur), keeping their content
fully legible over any map or imagery beneath. This SHALL apply to the
persistent overlays in both layouts (search, the location/forecast card, the
layer control, the time-lapse control, the about/locate buttons, and on mobile
the top bar, weather sheet, and layers sheet). Dense reading surfaces — the
info ("how it works") dialog and dropdown result lists — MAY be fully opaque.

#### Scenario: Overlays legible over any ground

- **WHEN** an overlay panel is displayed over the map or an active satellite
  overlay
- **THEN** the panel renders in the shared material and its content remains
  legible

#### Scenario: Reading surfaces stay legible

- **WHEN** the info dialog or a dropdown result list is shown
- **THEN** it MAY be rendered fully opaque so its dense content stays legible

