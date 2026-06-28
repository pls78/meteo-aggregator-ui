## ADDED Requirements

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
