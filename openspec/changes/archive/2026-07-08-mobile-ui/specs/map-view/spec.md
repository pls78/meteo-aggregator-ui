## ADDED Requirements

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
