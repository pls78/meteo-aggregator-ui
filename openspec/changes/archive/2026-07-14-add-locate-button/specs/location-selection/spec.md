## ADDED Requirements

### Requirement: Locate me on demand

The system SHALL provide a visible control that, on activation, requests the browser's current
position and selects it as a location. The control SHALL be available in both the desktop and
mobile layouts.

#### Scenario: Successful locate

- **WHEN** the user activates the "use my location" control and grants the browser geolocation
  permission
- **THEN** the returned coordinate is selected into the active slot (the primary on desktop; the
  active A/B target on mobile), a marker is shown there, the map recenters on it, and its
  weather is displayed

#### Scenario: Resolving state

- **WHEN** the position request is in flight
- **THEN** the control shows a loading state and does not start a second request until it settles

#### Scenario: Denied or unavailable

- **WHEN** the user activates the control but geolocation is unsupported, the permission is
  denied, or the request errors or times out
- **THEN** the control shows a brief message that the location could not be obtained and makes
  no change to the current selection

#### Scenario: Respects the active slot

- **WHEN** the mobile A/B target is set to the comparison slot and the user activates the control
- **THEN** the current position fills the comparison slot, leaving the primary unchanged (on
  desktop, where the active slot is always primary, it fills the primary)
