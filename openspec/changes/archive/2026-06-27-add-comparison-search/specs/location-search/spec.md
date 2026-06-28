## MODIFIED Requirements

### Requirement: Selecting a search result selects and recenters

The system SHALL, when the user picks a search result, set it as the location for **the slot
that search bar controls** (primary or comparison) and recenter the map on its coordinates.

#### Scenario: Pick a result in the primary search bar

- **WHEN** the user selects a place from the primary search bar's results list
- **THEN** the map recenters on that place, it becomes the primary location, and its weather
  is displayed

#### Scenario: Pick a result in the comparison search bar

- **WHEN** the user selects a place from the comparison search bar's results list
- **THEN** the map recenters on that place, it becomes the comparison location, and it is
  displayed alongside the primary for comparison

## ADDED Requirements

### Requirement: Add a comparison search bar

The system SHALL provide a control next to the primary search bar that adds a comparison
location and reveals a second search bar controlling it. The second search bar SHALL be
present whenever a comparison location exists (including when set by other means, such as
Shift+click) and SHALL be removable.

#### Scenario: Add the second search bar

- **WHEN** a primary location is selected and the user activates the "add comparison" control
- **THEN** a second search bar appears below the first and a comparison location is created

#### Scenario: Second bar reflects an existing comparison

- **WHEN** a comparison location already exists (e.g. set via Shift+click on the map)
- **THEN** the second search bar is shown for that comparison location

#### Scenario: Remove the second search bar

- **WHEN** the user removes the comparison search bar
- **THEN** the comparison location is cleared and only the primary search bar remains

### Requirement: Color-coded search bars

Each search bar SHALL carry a color marker matching the bullet used for that location in the
weather cards: primary `rgb(37, 99, 235)` and comparison `rgb(245, 158, 11)`.

#### Scenario: Bars are visually distinguished

- **WHEN** both search bars are shown
- **THEN** the primary bar shows the primary color marker and the comparison bar shows the
  comparison color marker, matching their respective weather-card bullets and map markers
