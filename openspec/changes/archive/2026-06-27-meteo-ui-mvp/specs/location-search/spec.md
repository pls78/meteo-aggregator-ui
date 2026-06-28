## ADDED Requirements

### Requirement: Place-name search box

The system SHALL provide a search box that resolves a place-name query into a ranked list of
candidate places by calling the backend `GET /search` endpoint.

#### Scenario: Query returns candidates

- **WHEN** the user types a place name and the query resolves
- **THEN** a ranked list of matching places is shown, each with enough detail (name, region,
  country) to disambiguate same-named places

#### Scenario: No match

- **WHEN** the query has no matching place
- **THEN** the UI indicates that no results were found and selects nothing

### Requirement: Selecting a search result selects and recenters

The system SHALL, when the user picks a search result, set it as the selected location and
recenter the map on its coordinates.

#### Scenario: Pick a result

- **WHEN** the user selects a place from the results list
- **THEN** the map recenters on that place, it becomes the primary location, and its weather
  is displayed

### Requirement: Debounced querying

The search SHALL avoid issuing a backend request on every keystroke.

#### Scenario: Rapid typing

- **WHEN** the user types several characters in quick succession
- **THEN** the system debounces input and issues the search only after typing pauses
