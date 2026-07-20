## ADDED Requirements

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
