# weather-display Specification (delta)

## ADDED Requirements

### Requirement: Actionable error copy

User-facing error messages in the weather panels SHALL name what failed in the visitor's terms and a recovery the visitor can perform. They SHALL NOT reference internal components, infrastructure, or developer concepts (e.g. "backend").

#### Scenario: Forecast fails to load

- **WHEN** the forecast or hourly request fails
- **THEN** the panel shows a message naming what couldn't load and advising a user-performable recovery (e.g. checking the connection and trying again)

### Requirement: Selected day detail becomes visible

On the mobile layout, selecting a day (for its hourly chart or its confidence detail) SHALL bring the day's detail section into view within the sheet, so the selection always produces visible feedback beyond the row highlight.

#### Scenario: Day tapped at half-height sheet

- **WHEN** the user taps a day while the sheet's detail area is scrolled away
- **THEN** the sheet's content scrolls the detail section into view (animated only when the user allows motion)
