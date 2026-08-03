# Redesign UI to the Meteogram world

## Why

The category-standard redesign (archived `2026-08-02-redesign-ui-category-standard`) delivered craft but reads as "same app, cleaner" — the user wants a visibly distinctive identity. They pinned **The Meteogram**: the scientific ensemble-plume tradition, where the product's core mechanism — several models blended into one consensus — is *drawn* (bold consensus stroke over the visible spread of per-model values) instead of only labeled.

## What Changes

- Retune the token vocabulary to the meteogram world: paper-white data ground (near-opaque panels, hairline rules, flatter shadows), consensus blue as accent/location A, a reserved red as location B, ink ramp with a drier data character.
- **Draw the spread**: each day row gains a spread strip — an inline SVG showing the per-model day-high positions (from `/forecast` `breakdown`, already fetched) as faint ticks with a bold consensus tick; confidence becomes visible width, with the tag as the label. Desktop card and mobile sheet both.
- The confidence detail gains a dot-strip figure (models as faint dots on a scale line, consensus bold) above the existing table.
- Cards/panels restyled to figure-like composition: ruled day rows (hairlines), small tracked-caps table labels, controls set like figure captions.
- `HourlyChart` restyled to the meteogram character (hairline grid, finer strokes, token colors).
- Basemap stays CARTO Positron; behavior, layout structure, and interactions unchanged.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `visual-design`: the panel-material requirement changes (translucent glass → paper data ground with hairline rules); a new requirement adds "uncertainty is drawn" (spread strips in day rows); the location-accent pair requirement changes values (consensus blue / reserved red).

## Impact

- `src/index.css` (token retune), `src/lib/accents.ts` (new pair), `src/components/panels/` (LocationCard + new `SpreadStrip`), `confidence/ConfidenceDetail` (dot strip), `hourly/HourlyChart`, `mobile/WeatherSheet`, panel-material classes across chrome; `index.html` direction contract; `DESIGN.md` rewritten at finish by the documenter.
- No API/store/hook changes: spread strips read `day.breakdown`, already present in the cached `/forecast` response.
