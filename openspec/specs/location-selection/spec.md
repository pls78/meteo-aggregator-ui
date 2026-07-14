# location-selection Specification

## Purpose
TBD - created by archiving change meteo-ui-mvp. Update Purpose after archive.
## Requirements
### Requirement: Select a primary location by click

The system SHALL set the primary location to the coordinate the user clicks on the map,
replacing any previously selected primary location.

#### Scenario: Click sets primary

- **WHEN** the user clicks a point on the map without modifier keys
- **THEN** that coordinate becomes the primary location, a marker is shown there, and its
  weather is requested and displayed

#### Scenario: Clicking again moves the primary

- **WHEN** a primary location already exists and the user plain-clicks a different point
- **THEN** the primary location moves to the new point and its weather replaces the previous

### Requirement: Select a comparison location by Shift+click

The system SHALL set a second, comparison location when the user Shift+clicks the map,
without discarding the primary location.

#### Scenario: Shift+click adds a comparison location

- **WHEN** a primary location exists and the user Shift+clicks a different point
- **THEN** that coordinate becomes the comparison location, a distinct marker is shown, and
  both locations' weather is displayed for comparison

#### Scenario: Shift+click replaces an existing comparison location

- **WHEN** a comparison location already exists and the user Shift+clicks again
- **THEN** the comparison location moves to the new point

### Requirement: Clear a selected location

The system SHALL let the user clear the primary or comparison location individually.

#### Scenario: Clear the comparison location

- **WHEN** the user dismisses the comparison location
- **THEN** its marker and card are removed and the view returns to showing only the primary

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

