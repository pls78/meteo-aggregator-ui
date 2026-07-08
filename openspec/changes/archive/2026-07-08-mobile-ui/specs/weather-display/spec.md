## ADDED Requirements

### Requirement: Weather presented as a bottom sheet on small screens

On the mobile layout, the system SHALL present the selected location's weather in a draggable
bottom sheet with at least three snap heights — a collapsed **peek** (current conditions only), a
**half** height (adds the daily forecast), and a **full** height (adds the hourly detail) — so the
map stays visible and the weather never permanently covers it. The sheet's content SHALL scroll
within the sheet without panning the map.

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
