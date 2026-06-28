## ADDED Requirements

### Requirement: Legend for active layers

The system SHALL display a legend for each active satellite layer, mapping the layer's colors
to their meaning, so the overlay can be interpreted. The legend SHALL be obtained from the
layer's own WMS service (a `GetLegendGraphic` request built from the layer's WMS URL and
name).

#### Scenario: Show a legend when a layer is active

- **WHEN** a satellite layer is active
- **THEN** its legend (color key) is shown in the Satellite layers panel near that layer

#### Scenario: No legend when inactive

- **WHEN** a layer is not active
- **THEN** no legend is shown for it

#### Scenario: Legend unavailable

- **WHEN** a layer's legend image fails to load
- **THEN** the layer remains usable and no broken legend is shown

#### Scenario: Placeholder legend suppressed

- **WHEN** the WMS returns only a generic placeholder legend for a layer that has no real
  color key (e.g. continuous single-channel or RGB imagery)
- **THEN** no legend is shown for that layer (the meaningless placeholder is hidden)
