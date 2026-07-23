## ADDED Requirements

### Requirement: Translucent map overlays

The floating panels and controls layered above the map SHALL be slightly
translucent with a backdrop blur, so the map remains partially visible behind
them while their content stays legible. This SHALL apply to the persistent
overlays in both layouts (search, the location/forecast card, the layer control,
the time-lapse control, the about/locate buttons, and on mobile the top bar,
weather sheet, and layers sheet). Dense reading surfaces — the info ("how it
works") dialog and dropdown result lists — MAY remain opaque for legibility.

#### Scenario: Map shows through the overlays

- **WHEN** an overlay panel is displayed over the map
- **THEN** the map is partially visible through the panel and the panel's own
  content remains legible

#### Scenario: Reading surfaces stay legible

- **WHEN** the info dialog or a dropdown result list is shown
- **THEN** it MAY be rendered opaque so its dense content stays fully legible
