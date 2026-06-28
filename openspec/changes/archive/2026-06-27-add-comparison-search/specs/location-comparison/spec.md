## ADDED Requirements

### Requirement: Add a comparison location from the search panel

The system SHALL let the user add a comparison location from the search panel (not only by
Shift+click on the map). When added this way, the comparison location SHALL be initialized to
the primary location's coordinates, so the second weather card opens showing the same place
until the user searches for or selects a different one.

#### Scenario: Add comparison initialized from primary

- **WHEN** a primary location is selected and the user adds a comparison from the search panel
- **THEN** a comparison location is created at the primary's coordinates and a second weather
  card appears showing the same location's data

#### Scenario: No primary selected

- **WHEN** no primary location is selected
- **THEN** the "add comparison" control is unavailable (there is no location to copy)
