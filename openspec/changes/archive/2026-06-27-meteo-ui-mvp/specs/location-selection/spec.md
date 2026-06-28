## ADDED Requirements

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
