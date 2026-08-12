# visual-design (delta)

## ADDED Requirements

### Requirement: Motion animates compositor-friendly properties only

UI animation SHALL animate only compositor-friendly properties (`transform`, `opacity`);
layout properties (height, width, top/left/bottom/right, padding, margin, flex/grid sizing)
SHALL NOT be transitioned or animated. Direct-manipulation gestures (drags) SHALL track the
pointer 1:1 with no transition; only the settle after release, and entrances/exits, animate.
Non-essential animation SHALL be disabled under `prefers-reduced-motion: reduce`.

#### Scenario: Sheet snap animates on the compositor

- **WHEN** the mobile weather sheet settles from one snap height to another
- **THEN** the motion is carried by a `transform` transition and no layout property of the
  sheet or its contents is animated

#### Scenario: Reduced motion is honoured

- **WHEN** the OS reports `prefers-reduced-motion: reduce` and a snap or other non-essential
  animation would play
- **THEN** the element moves to its final state without animating
