## MODIFIED Requirements

### Requirement: Locate me on demand

The system SHALL provide a visible control that, on activation, requests the browser's current
position and selects it as a location. The control SHALL be available in both the desktop and
mobile layouts. The control SHALL always reach a settled state: it MUST NOT remain in its
resolving state indefinitely, even when the browser reports neither success nor failure. After
any failure the control SHALL be usable again, except where the browser has blocked the
permission outright, in which case the control SHALL explain that rather than offer a retry
that cannot succeed.

#### Scenario: Successful locate

- **WHEN** the user activates the "use my location" control and grants the browser geolocation
  permission
- **THEN** the returned coordinate is selected into the active slot (the primary on desktop; the
  active A/B target on mobile), a marker is shown there, the map recenters on it, and its
  weather is displayed

#### Scenario: Resolving state

- **WHEN** the position request is in flight
- **THEN** the control shows a loading state and does not start a second request until it settles

#### Scenario: Resolving state is bounded

- **WHEN** the position request has been in flight beyond the system's own resolving limit —
  for example because the browser's permission prompt is still open and unanswered, so the
  Geolocation API's own timeout has not started
- **THEN** the control leaves its loading state, reports that the location could not be
  obtained, and becomes usable again, without requiring a page reload

#### Scenario: A late fix is still honoured

- **WHEN** the system has already given up on a position request and the browser subsequently
  delivers a position for it — for example the user answered the permission prompt slowly
- **THEN** that coordinate is selected into the active slot as a successful locate, and any
  failure message from the abandoned request is cleared

#### Scenario: Denied or unavailable

- **WHEN** the user activates the control but geolocation is unsupported, the request errors,
  or it times out
- **THEN** the control shows a message that the location could not be obtained, makes no change
  to the current selection, and remains available so the user can try again

#### Scenario: Failure message persists until acted on

- **WHEN** the control has reported that the location could not be obtained
- **THEN** that message remains visible until the user retries or dismisses it, rather than
  disappearing on its own after a fixed delay

#### Scenario: Permission is blocked

- **WHEN** the browser reports the geolocation permission as blocked, so activating the control
  could not produce a prompt or a position
- **THEN** the control conveys that location access is blocked and that it must be re-enabled in
  the browser's own site settings, and it does not present itself as an action that would
  succeed

#### Scenario: Permission state cannot be inspected

- **WHEN** the browser does not expose a way to query the geolocation permission state
- **THEN** the control behaves as it does for any other failure — it stays available and
  retryable — rather than suppressing itself or reporting a blocked permission it cannot confirm

#### Scenario: Respects the active slot

- **WHEN** the mobile A/B target is set to the comparison slot and the user activates the control
- **THEN** the current position fills the comparison slot, leaving the primary unchanged (on
  desktop, where the active slot is always primary, it fills the primary)
