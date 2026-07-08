## ADDED Requirements

### Requirement: Compare two locations' hours for the selected day

The system SHALL, when both a primary and a comparison location are selected and a day is
open in the hourly view, present both locations' hourly series for that same day together, so
they can be read hour-by-hour against each other. Each location's series SHALL be color-coded
to match its map marker / card accent (primary and comparison).

#### Scenario: Two locations, one day

- **WHEN** both a primary and a comparison location are selected and a day is open in the
  hourly view
- **THEN** the hourly view shows both locations' temperature for that day on a shared scale,
  each drawn in its location's color, with a legend identifying which is which

#### Scenario: Aligned hours

- **WHEN** two locations' hours are compared for a day
- **THEN** the two series share the same hour axis and temperature scale so that, at any hour,
  the two locations' values are directly comparable

#### Scenario: Comparison reduced to one location

- **WHEN** the comparison location is cleared while the hourly view is open
- **THEN** the hourly view continues to show the primary location's hours for the selected day
  (a single series)
