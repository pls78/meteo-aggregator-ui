## ADDED Requirements

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
