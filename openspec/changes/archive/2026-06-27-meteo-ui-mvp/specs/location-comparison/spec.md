## ADDED Requirements

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
