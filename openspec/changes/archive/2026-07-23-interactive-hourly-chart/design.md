## Context

`HourlyChart` is a dependency-free inline SVG (temperature line + precipitation
bars in stacked panels). It previously used a fixed 36px/hour and lived in an
`overflow-x-auto` wrapper.

## Goals / Non-Goals

**Goals:** use the available width; show more detail where there's room, less
where there isn't; let the user read exact values.

**Non-Goals:** a charting dependency; changing which hours are fetched; a
dual-axis chart (temp and precip stay in separate stacked panels).

## Decisions

**Measure the container, don't assume a size.** The chart measures its own
container (initial layout measurement + `ResizeObserver`) and maps the hour
domain across the measured width. The stride (3h/2h/1h) is a function of that
width. Initial measurement covers the fixed desktop panel and mobile sheet;
`ResizeObserver` handles later resizes.

**Sample, don't just thin markers.** The plotted line and dots are sampled at the
stride (aligned to the start, always including the last hour) so the curve itself
coarsens/refines with space; axis labels sit under the plotted points.

**One pointer path for hover and tap.** `onPointerMove` (mouse) hovers, `onPointerDown`
(any pointer) taps; both snap to the nearest plotted point. Mouse leave clears;
touch persists. `touch-action: pan-y` keeps the mobile sheet scrollable.

## Risks / Trade-offs

- **Coarser line when narrow** → intended; the stride trades resolution for
  legibility in small space.
- **`ResizeObserver` availability** → initial measurement already yields the
  correct stride for the real layouts, so a missed resize event only delays a
  re-stride, it doesn't break the first render.
