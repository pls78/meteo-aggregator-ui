## ADDED Requirements

### Requirement: Layer control as a sheet on small screens

On the mobile layout, the system SHALL present the satellite layer control as a modal bottom
sheet opened from an on-map **Layers** button (FAB), rather than an inline panel. The sheet SHALL
list the layers with large tap targets, provide the opacity control and legends, scroll within
itself, and be dismissable (via a close control or tapping the dimmed backdrop) — so no control
runs off-screen and scrolling the list never pans the map.

#### Scenario: Open the layers sheet

- **WHEN** the user taps the Layers button on the mobile layout
- **THEN** a bottom sheet opens listing the available satellite layers with their titles and
  toggles, over a dimmed map

#### Scenario: Toggle and adjust within the sheet

- **WHEN** the layers sheet is open and the user toggles a layer or adjusts opacity
- **THEN** the overlay updates on the map, the same as the desktop control

#### Scenario: List scrolls, map stays put

- **WHEN** the layer list is longer than the sheet and the user scrolls it
- **THEN** the list scrolls within the sheet and the map does not pan

#### Scenario: Dismiss the sheet

- **WHEN** the user taps the close control or the dimmed backdrop
- **THEN** the sheet closes and the full map is interactive again
