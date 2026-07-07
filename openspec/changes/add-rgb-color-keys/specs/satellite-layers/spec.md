## ADDED Requirements

### Requirement: Colour key for RGB overlays without a WMS legend

For active RGB composite overlays that have no usable WMS legend, the system SHALL
show a static colour key that maps the composite's colours to their meteorological
meaning (coloured swatches with short labels), or a short descriptive note for
photographic composites with no discrete colour key. This colour key SHALL appear
only while the layer is active, near where the WMS legend would otherwise appear,
and SHALL NOT replace the WMS legend for layers that have a real one.

#### Scenario: Colour key shown for an RGB overlay

- **WHEN** an RGB composite layer with a defined colour key (e.g. Airmass, Dust,
  Convection, Cloud Phase) is active
- **THEN** its colour key — swatches with labels, or a descriptive note — is shown
  near that layer in the Satellite layers panel

#### Scenario: Real WMS legend is preferred

- **WHEN** an active layer has a real WMS legend (e.g. a single-channel IR layer)
- **THEN** its WMS legend is shown and no static colour key is added for it

#### Scenario: No colour key when inactive

- **WHEN** an RGB composite layer is not active
- **THEN** no colour key is shown for it
