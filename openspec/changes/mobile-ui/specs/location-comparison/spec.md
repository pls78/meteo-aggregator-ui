## ADDED Requirements

### Requirement: Compare two locations via tabs on small screens

The system SHALL, on the mobile layout when both a primary and a comparison location are
selected, present them within a single bottom sheet using an A/B tab rather than two
side-by-side cards. The tab selects which location's current conditions and daily forecast are
shown, while the hourly chart overlays both locations for the selected day, color-coded per
location with a legend.

#### Scenario: Switch between the two locations

- **WHEN** both locations are selected on the mobile layout and the user taps the A or B tab
- **THEN** the sheet shows that location's current conditions and daily forecast

#### Scenario: Hourly overlays both

- **WHEN** both locations are selected and a day's hourly detail is shown on mobile
- **THEN** both locations' hourly series are drawn on one chart, each in its color, with a legend

#### Scenario: Tab appears only when comparing

- **WHEN** only the primary location is selected on the mobile layout
- **THEN** no A/B tab is shown and the sheet displays the single location
