## Context

The map is the full-screen surface; every panel is an absolutely-positioned
overlay above it. Panels were `bg-white/95`–`/97` (near-opaque).

## Goals / Non-Goals

**Goals:** let the map show through the overlays while keeping text readable.

**Non-Goals:** changing any behaviour or layout; making dense reading surfaces
(dialog, dropdown lists) transparent.

## Decisions

**`bg-white/70` + `backdrop-blur` on the floating overlays.** The blur keeps text
legible over a busy map at that opacity (frosted glass). The exact opacity was
tuned interactively (95 → 70). Applied consistently across the persistent overlay
panels/controls in both layouts; dense reading surfaces stay opaque.

## Risks / Trade-offs

- **Legibility over busy map areas** → mitigated by `backdrop-blur`; verified
  readable. Opacity is a single-token tweak if it needs adjusting later.
