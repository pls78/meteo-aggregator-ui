# location-selection Specification

## Purpose
TBD - created by archiving change meteo-ui-mvp. Update Purpose after archive.
## Requirements
### Requirement: Select a primary location by click

The system SHALL set the primary location to the coordinate the user clicks on the map,
replacing any previously selected primary location.

#### Scenario: Click sets primary

- **WHEN** the user clicks a point on the map without modifier keys
- **THEN** that coordinate becomes the primary location, a marker is shown there, and its
  weather is requested and displayed

#### Scenario: Clicking again moves the primary

- **WHEN** a primary location already exists and the user plain-clicks a different point
- **THEN** the primary location moves to the new point and its weather replaces the previous

### Requirement: Select a comparison location by Shift+click

The system SHALL set a second, comparison location when the user Shift+clicks the map,
without discarding the primary location.

#### Scenario: Shift+click adds a comparison location

- **WHEN** a primary location exists and the user Shift+clicks a different point
- **THEN** that coordinate becomes the comparison location, a distinct marker is shown, and
  both locations' weather is displayed for comparison

#### Scenario: Shift+click replaces an existing comparison location

- **WHEN** a comparison location already exists and the user Shift+clicks again
- **THEN** the comparison location moves to the new point

### Requirement: Clear a selected location

The system SHALL let the user clear the primary or comparison location individually.

#### Scenario: Clear the comparison location

- **WHEN** the user dismisses the comparison location
- **THEN** its marker and card are removed and the view returns to showing only the primary

### Requirement: Select a named place by clicking its label

The system SHALL, when the user clicks on a place label rendered on the base map, select that
place using the place's name and coordinates, for the same slot rules as a normal click
(primary on a plain click, comparison on Shift+click). When the click is not on a place label,
the system SHALL select the clicked coordinate as before (an unnamed location).

#### Scenario: Click a place label

- **WHEN** the user clicks directly on a city/town label on the base map
- **THEN** that place becomes the primary location, identified by its name, and its weather is
  displayed

#### Scenario: Shift+click a place label

- **WHEN** the user Shift+clicks on a place label
- **THEN** that named place becomes the comparison location

#### Scenario: Click away from any label

- **WHEN** the user clicks the map where there is no place label
- **THEN** the clicked coordinate is selected as an unnamed location (existing behavior)

