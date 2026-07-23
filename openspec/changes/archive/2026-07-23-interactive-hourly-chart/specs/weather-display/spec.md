## ADDED Requirements

### Requirement: Hourly chart fills the width and adapts point density

The hourly detail chart SHALL fill the width available in its container rather
than a fixed width, and SHALL choose how many temperature points to plot from
that width: a point roughly every 3 hours when narrow, every 2 hours at medium
width, and every hour when wide. Each plotted point SHALL be labelled with its
hour, and hour-axis labels SHALL NOT be denser than the plotted points. The
choice SHALL update if the container is resized.

#### Scenario: Wide container shows hourly detail

- **WHEN** the chart is rendered in a wide container (e.g. the desktop panel)
- **THEN** it spans the container width and plots a temperature point for every
  hour, each labelled with its hour

#### Scenario: Narrow container stays uncluttered

- **WHEN** the chart is rendered in a narrow container (e.g. the mobile sheet)
- **THEN** it spans the container width and plots fewer points (about every 3
  hours) so labels and markers do not crowd

### Requirement: Inspect a point's value

The system SHALL let the user read the value at a plotted point: on a
pointer-capable device, hovering the chart SHALL snap to the nearest plotted
point; on touch, tapping SHALL select the nearest plotted point. The selected
point SHALL be marked with a vertical crosshair and its temperature value, for
each series shown. Moving the mouse away SHALL clear the indicator; a touch
selection MAY persist until the next tap.

#### Scenario: Hover shows the value

- **WHEN** the user hovers over the hourly chart on a pointer device
- **THEN** a crosshair marks the nearest plotted point and its temperature value
  is shown for each series

#### Scenario: Tap shows the value on touch

- **WHEN** the user taps a point on the hourly chart on a touch device
- **THEN** a crosshair marks the nearest plotted point and its temperature value
  is shown
