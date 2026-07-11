## ADDED Requirements

### Requirement: Seed an initial location on load

On app load, when no location has been selected yet, the system SHALL auto-select a
**primary** location so the visitor sees weather immediately. It SHALL first attempt to
use the browser's current position, and SHALL fall back to a configured default location
when the current position is unavailable. This runs on every visit; the system does NOT
persist or restore past selections.

#### Scenario: Geolocation granted

- **WHEN** the app loads with no location selected and the user grants the browser
  geolocation permission
- **THEN** the returned coordinate becomes the primary location, a marker is shown there,
  the map centers on it, and its weather is requested and displayed

#### Scenario: Geolocation denied, unavailable, or errored

- **WHEN** the app loads with no location selected and geolocation is unsupported, the
  permission is denied, or the position request errors or times out
- **THEN** the system silently selects the configured default location as the primary —
  with no permission prompt of its own, no error message, and no retry control — and shows
  its weather

#### Scenario: No override of an existing selection

- **WHEN** a primary location already exists (e.g. the user has already selected one during
  the session, or a slower geolocation result arrives after the user has clicked)
- **THEN** the initial-location logic does NOT replace it

#### Scenario: Manual selection still works afterward

- **WHEN** an initial location has been seeded and the user then clicks, Shift+clicks, taps
  the A/B target, or searches
- **THEN** selection behaves exactly as before, moving or adding locations per the existing
  rules
