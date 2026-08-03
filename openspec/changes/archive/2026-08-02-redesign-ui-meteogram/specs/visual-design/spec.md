# visual-design Specification (delta)

## MODIFIED Requirements

### Requirement: Shared panel material

Every floating UI element over the map (location cards, search, layer panel, hourly sheet, dialogs, mobile sheets and FABs) SHALL use one shared panel recipe: a near-opaque paper-white data ground with hairline border rules, defined corner radius, and a shadow from the shadow vocabulary — figures on paper rather than glass.

#### Scenario: Panels are visually uniform

- **WHEN** two different floating elements are visible at once
- **THEN** they share the same paper surface material, hairline border, radius vocabulary, and shadow tier system

#### Scenario: Panels stay legible over imagery

- **WHEN** a panel overlaps an active satellite overlay
- **THEN** the near-opaque ground keeps all panel text at its required contrast

## ADDED Requirements

### Requirement: Uncertainty is drawn

Wherever a daily consensus value is shown with per-model data available, the model spread SHALL be drawn as marks (faint per-model ticks with a bold consensus tick on a shared local scale), so confidence is visible as width, with the textual confidence tag as its label. Day rows in both layouts carry a spread strip; the confidence detail carries a larger dot-strip figure.

#### Scenario: Day rows show the spread

- **WHEN** a day row renders and at least two models report that day's high temperature
- **THEN** the row includes a spread strip with one faint tick per model and a bold tick at the consensus value

#### Scenario: Strip degrades quietly

- **WHEN** fewer than two models report that day
- **THEN** the strip renders nothing and the row otherwise reads normally
