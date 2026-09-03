# satellite-layers (delta)

## MODIFIED Requirements

### Requirement: Layer control as a sheet on small screens

On the mobile layout, the system SHALL present the satellite layer control as a modal bottom
sheet opened from an on-map **Layers** button (FAB), rather than an inline panel. The sheet SHALL
list the layers with large tap targets, provide the opacity control and legends, scroll within
itself, and be dismissable (via a close control or tapping the dimmed backdrop) — so no control
runs off-screen and scrolling the list never pans the map. The Layers button SHALL remain visible
and tappable at every weather-sheet height, because an active overlay reads through the sheet's
material: the state stays visible, so the control that clears it SHALL stay reachable. When the
sheet is open, its backdrop SHALL cover the map's floating controls, so no control floats live
over the modal.

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

#### Scenario: Layers reachable under an expanded weather sheet

- **WHEN** an overlay is active and the user expands the weather sheet to its tallest height
- **THEN** the Layers button is still visible and tappable, and opening it, turning the overlay
  off and closing the sheet all work without first collapsing the weather sheet

### Requirement: Animate control stays clear of the weather sheet

The system SHALL keep the time-lapse control visible and usable when the weather
detail sheet (the hourly forecast or confidence detail for a day) is open: opening
the sheet SHALL NOT cover the control. On the desktop layout the sheet SHALL rest
flush at the bottom edge and the control SHALL move above the sheet's top edge when
the sheet's panel would overlap it — the same clearance behavior, transform-only
motion, and reduced-motion handling as the layer control. On the mobile layout the
control SHALL ride above the weather sheet's top edge at every snap height, tracking
the sheet while it is dragged as well as while it settles, and SHALL step aside once
the sheet has covered the map rather than being covered by it. When no sheet is open (or
the sheet does not reach the control), the control SHALL rest near the bottom of the
map as before.

#### Scenario: Forecast does not cover the control

- **WHEN** a layer is animating (its control is shown) and the user opens a day's
  hourly forecast
- **THEN** the play/pause control moves above the forecast sheet and remains fully
  visible and usable, and the sheet stays at the bottom edge

#### Scenario: Control rests at the bottom when no sheet is open

- **WHEN** a layer is animating and no weather detail sheet is open
- **THEN** the control sits near the bottom-centre of the map as before

#### Scenario: Activating a layer while a sheet is open

- **WHEN** a detail sheet is open and the user activates a satellite layer (making the
  control appear)
- **THEN** the control appears clear of the sheet, not overlapped by it

#### Scenario: Control follows the mobile sheet

- **WHEN** a layer is animating on the mobile layout and the user drags the weather sheet
  between its snap heights
- **THEN** the play/pause control stays above the sheet's top edge throughout the drag and
  the settle, rather than being covered by it
