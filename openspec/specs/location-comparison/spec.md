# location-comparison Specification

## Purpose
TBD - created by archiving change meteo-ui-mvp. Update Purpose after archive.
## Requirements
### Requirement: Side-by-side comparison of two locations

The system SHALL, when both a primary and a comparison location are selected, display their
weather side by side so the same variables can be read across both locations.

#### Scenario: Two locations selected

- **WHEN** both a primary and comparison location are selected
- **THEN** the UI shows two weather cards side by side, each labeled with its location

#### Scenario: Aligned variables

- **WHEN** two locations are compared
- **THEN** the same variables (e.g. current temperature, daily max/min, precipitation) are
  presented in a consistent, aligned layout so corresponding values line up for comparison

### Requirement: Single-location view when only one is selected

The system SHALL show a single weather card when only the primary location is selected.

#### Scenario: Comparison cleared

- **WHEN** the comparison location is cleared, leaving only the primary
- **THEN** the UI returns to a single-location card layout

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

