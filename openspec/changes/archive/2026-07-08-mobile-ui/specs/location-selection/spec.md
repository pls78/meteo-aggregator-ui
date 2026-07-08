## ADDED Requirements

### Requirement: Active-slot selection on touch devices

On the mobile layout, where there is no Shift modifier, the system SHALL let the user choose
which location slot a map tap fills via an on-screen **A / B** target control, and a map tap
SHALL fill the currently active slot. Selecting the comparison target when no comparison exists
SHALL create it (seeded from the primary), after which the next map tap places it.

#### Scenario: Tap fills the active slot

- **WHEN** the A/B control has A (primary) active and the user taps the map
- **THEN** the tapped location becomes the primary

#### Scenario: Switch the active slot to B and place it

- **WHEN** the user activates the comparison target and then taps the map
- **THEN** the tapped location becomes the comparison location, without discarding the primary,
  and both are shown

#### Scenario: Re-aim either location

- **WHEN** a comparison exists and the user switches the active target between A and B and taps
  the map
- **THEN** the tap moves whichever slot is active, leaving the other unchanged

#### Scenario: Desktop selection is unaffected

- **WHEN** the app is on the desktop layout
- **THEN** a plain click still selects the primary and Shift+click still selects the comparison,
  exactly as before
