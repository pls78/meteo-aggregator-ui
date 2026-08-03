# Redesign UI to the category standard

## Why

The UI works but looks like an unstyled Tailwind starter: default slate grays, `bg-white/70` glass with no system behind it, no tokens, no typographic scale — it reads as a demo, not a product. The chosen direction (via the impeccable design flow, user-confirmed) is the category standard for map-first weather apps, played straight, executed at the craft level of Windy.com.

## What Changes

- Introduce a real design system: color tokens (surface, ink, accent, A/B location accents, semantic states), a typographic scale, spacing/radius/shadow vocabulary — as Tailwind v4 `@theme` tokens in `src/index.css`.
- Restyle every piece of UI chrome on both layouts (desktop overlays and mobile shell) to that system: location cards, comparison panel, search, layer control + legends, hourly panel/chart, confidence detail, locate button, about dialog, mobile top bar/sheets/FAB.
- Restyle the basemap (swap the CARTO Voyager style for a quieter CARTO variant or tone adjustments) so the map recedes under data while staying legible; keep vector tiles and attribution.
- Restyle map markers and A/B accent colors to the new token pair.
- Behavior, layout structure, interactions, and the backend contract are untouched — this is a visual-world replacement only.
- Accessibility floor enforced: WCAG AA contrast for text over panels and map, visible focus states, unchanged keyboard/screen-reader semantics.

## Capabilities

### New Capabilities

- `visual-design`: the durable visual system — token vocabulary, panel material, typography, marker/accent pairing, basemap tone, and the accessibility contrast floor that all surfaces (desktop and mobile) must share.

### Modified Capabilities

<!-- none: no existing behavioral requirement changes; all interactions, data, and flows stay as specified -->

## Impact

- `src/index.css` (tokens), `src/components/**` (all presentational classNames, both layouts), `src/components/map/MapView.tsx` (basemap style URL/props, marker styling), `src/lib/` (accent constants if any).
- No API, store, hook, or routing changes. No new runtime dependencies (fonts self-hosted or system stack).
- `DESIGN.md` will be written at finish (impeccable documenter) from the built system.
