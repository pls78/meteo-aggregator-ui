## ADDED Requirements

### Requirement: Active overlays refresh to the latest frame

While a satellite overlay is active, the system SHALL periodically refresh it to
the most recent frame the backend reports for that layer — without the user
toggling it off and on — so a live weather situation stays current. The refresh
SHALL update tiles in place (no flicker or loss of the chosen opacity) and SHALL
re-fetch tiles only when the reported frame has actually advanced.

#### Scenario: Newer frame becomes available

- **WHEN** a layer is active and the backend begins reporting a newer frame for
  it (a new cadence boundary has passed)
- **THEN** the overlay updates to the newer frame's tiles automatically, without
  the user re-toggling the layer

#### Scenario: No change between boundaries

- **WHEN** a layer is active and the backend still reports the same frame (no
  newer one yet)
- **THEN** the overlay is left undisturbed — its tiles are not re-fetched

#### Scenario: Opacity change does not reload tiles

- **WHEN** the user adjusts overlay opacity while the reported frame has not
  advanced
- **THEN** the overlay's opacity updates without re-fetching its tiles
