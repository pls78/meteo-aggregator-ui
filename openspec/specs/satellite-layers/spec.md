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

### Requirement: Colour key for RGB overlays without a WMS legend

For active RGB composite overlays that have no usable WMS legend, the system SHALL
show a static colour key that maps the composite's colours to their meteorological
meaning (coloured swatches with short labels), or a short descriptive note for
photographic composites with no discrete colour key. This colour key SHALL appear
only while the layer is active, near where the WMS legend would otherwise appear,
and SHALL NOT replace the WMS legend for layers that have a real one.

#### Scenario: Colour key shown for an RGB overlay

- **WHEN** an RGB composite layer with a defined colour key (e.g. Airmass, Dust,
  Convection, Cloud Phase) is active
- **THEN** its colour key — swatches with labels, or a descriptive note — is shown
  near that layer in the Satellite layers panel

#### Scenario: Real WMS legend is preferred

- **WHEN** an active layer has a real WMS legend (e.g. a single-channel IR layer)
- **THEN** its WMS legend is shown and no static colour key is added for it

#### Scenario: No colour key when inactive

- **WHEN** an RGB composite layer is not active
- **THEN** no colour key is shown for it

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

### Requirement: Single-layer time-lapse animation

The system SHALL let the user play a time-lapse of a satellite overlay by
requesting several recent frames per layer from the backend (`GET /imagery` with
a `frames` count) and looping them oldest→newest on the map. A single floating
control overlaid on the map SHALL start/stop playback and, while playing, show
the layer name and the current frame's local time. Only one layer animates at a
time: the control SHALL be enabled only when exactly one overlay is active, and
SHALL be visible but disabled when two or more are active. While a layer is
playing, the layer selection SHALL be locked so the active set cannot change
until playback stops; stopping SHALL return the overlay to its newest frame.

#### Scenario: Play a layer's time-lapse

- **WHEN** exactly one overlay is active and the user presses the map's animate control
- **THEN** that layer loops through its recent frames on the map, and the control
  shows the layer name and the playing frame's local time

#### Scenario: Control disabled with multiple layers

- **WHEN** two or more overlays are active
- **THEN** the animate control is visible but disabled

#### Scenario: Layer selection locked while playing

- **WHEN** a layer is playing its time-lapse
- **THEN** the layer toggles are disabled until the user stops playback

#### Scenario: Stopping returns to the latest frame

- **WHEN** the user stops playback
- **THEN** the overlay shows its newest frame again

### Requirement: Flash-free frame rendering

While a layer animates, the system SHALL render frames without the underlying
basemap showing through between them. It SHALL preload every frame and, on each
step, present the incoming frame at full opacity above the outgoing frame before
the outgoing frame is removed, so a fully-formed frame always covers the map.

#### Scenario: No basemap flash between frames

- **WHEN** the animation advances from one frame to the next
- **THEN** the incoming frame covers the map before the previous frame is removed,
  so the vector basemap does not flash between frames

### Requirement: Frame tile-loading indicator

The system SHALL show a loading indicator (a spinner beside the frame time) while
the frame currently shown by the animation is still fetching its map tiles, and
SHALL clear the indicator once the frame's tiles have loaded.

#### Scenario: Loading indicator while tiles fetch

- **WHEN** the current animation frame's tiles are not yet loaded (e.g. just after
  panning or zooming)
- **THEN** a loading indicator is shown next to the frame time until the tiles arrive

### Requirement: Animate control stays clear of the weather sheet

The system SHALL keep the time-lapse control visible and usable when the weather
detail sheet (the hourly forecast or confidence detail for a day) is open:
opening the sheet SHALL NOT cover the control, and the control SHALL be
positioned clear of the sheet. When no sheet is open, the control SHALL rest near
the bottom of the map as before.

#### Scenario: Forecast does not cover the control

- **WHEN** a layer is animating (its control is shown) and the user opens a day's
  hourly forecast
- **THEN** the play/pause control remains fully visible and usable, not covered by
  the forecast sheet

#### Scenario: Control rests at the bottom when no sheet is open

- **WHEN** a layer is animating and no weather detail sheet is open
- **THEN** the control sits near the bottom-centre of the map as before

