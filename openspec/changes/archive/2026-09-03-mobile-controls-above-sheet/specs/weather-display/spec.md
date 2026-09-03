# weather-display (delta)

## MODIFIED Requirements

### Requirement: Weather presented as a bottom sheet on small screens

On the mobile layout, the system SHALL present the selected location's weather in a draggable
bottom sheet with at least three snap heights — a collapsed **peek** (current conditions only), a
**half** height (adds the daily forecast), and a **full** height (adds the hourly detail) — so the
map stays visible and the weather never permanently covers it. The sheet's content SHALL scroll
within the sheet without panning the map, and SHALL remain fully reachable by scrolling at every
snap height. While dragging, the sheet SHALL track the pointer directly with no animation; on
release (or on a handle tap) it SHALL settle to the nearest snap with a smooth animation that
does not animate any layout property, and SHALL move without animating when the user prefers
reduced motion. A drag that is interrupted rather than released SHALL settle the sheet too,
never leave it stranded between snaps. No snap height SHALL cover the location search and A/B
target, and expanding the sheet SHALL NOT strand the map's floating controls behind it: a
control the sheet reaches SHALL either move clear of it or, where it only acts on a map the
sheet has now covered, step aside until the sheet is collapsed again.

#### Scenario: Peek keeps the map clear

- **WHEN** a location is selected and the sheet is at its collapsed peek height
- **THEN** at least the current temperature is shown and the large majority of the map remains
  visible

#### Scenario: Expand for more detail

- **WHEN** the user drags or taps the sheet handle to a taller height
- **THEN** the sheet reveals the daily forecast (half) and the hourly detail for the selected day
  (full)

#### Scenario: Content scrolls without moving the map

- **WHEN** the user scrolls the weather content inside the sheet
- **THEN** the sheet content scrolls and the underlying map does not pan or zoom

#### Scenario: Tap a day for its hours on mobile

- **WHEN** the user taps a day in the sheet's daily list
- **THEN** that day's hourly chart is shown within the sheet (no separate panel)

#### Scenario: Drag tracks, release settles

- **WHEN** the user drags the sheet handle and releases it between snap heights
- **THEN** the sheet follows the pointer 1:1 during the drag and then animates to the nearest
  snap height without stutter

#### Scenario: Interrupted drag settles

- **WHEN** a drag of the sheet handle is cancelled by the browser rather than released
- **THEN** the sheet settles to a snap height instead of staying frozen where the pointer was
  last seen

#### Scenario: Snap without animation under reduced motion

- **WHEN** the user has `prefers-reduced-motion: reduce` set and the sheet changes snap
- **THEN** the sheet appears at the new snap height without an animated transition

#### Scenario: Last row reachable at half height

- **WHEN** the sheet is at its half snap and the user scrolls the daily list to its end
- **THEN** the final row (and the day-detail section) can be brought fully into view

#### Scenario: Search stays clear at the tallest snap

- **WHEN** the sheet is at its full height
- **THEN** the search field and the A/B target remain visible and usable above it
