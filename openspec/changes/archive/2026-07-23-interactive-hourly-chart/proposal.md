## Why

The hourly chart used a fixed pixel-per-hour width inside a horizontally
scrollable box: it never filled wide panels (wasting space) and scrolled on
narrow ones. It also gave no way to read an exact value off the curve.

> Backfill: documents behaviour already implemented and shipped.

## What Changes

- The hourly chart **fills its container's width** instead of a fixed size, and
  **adapts its temperature-point density** to that width — a point every 3 hours
  when narrow, every 2 hours at medium width, every hour when wide — so wider
  space shows more detail without crowding narrow space.
- Each plotted point is **labelled with its hour**; axis labels track the points.
- **Hovering** a point (desktop) or **tapping** one (mobile) shows a crosshair at
  that point and its temperature value.

## Capabilities

### Modified Capabilities
- `weather-display`: refines the hourly detail chart with width-filling, adaptive
  point density, per-point hour labels, and a point-inspection crosshair.

## Impact

- UI only: `components/hourly/HourlyChart` (self-contained inline SVG). No API or
  backend change; no change to which hours are fetched.
