# Design — drawn-weather-icons

## Context

The meteogram world draws every mark; the emoji glyphs are the last foreign hand. The chrome icon set (`components/icons.tsx`) already establishes the vocabulary: 24×24 viewBox, ~1.8px stroke, round caps/joins, currentColor.

## Goals / Non-Goals

**Goals:** one authored glyph per condition family, legible at 14px (chart strip) through 36px (current conditions); identical rendering on every OS; semantic color only where it carries meaning.

**Non-Goals:** animated icons; per-code unique art beyond the 13 families; night variants (the API's codes carry no day/night flag here).

## Decisions

1. **Glyph anatomy**: each glyph is a JSX fragment of SVG primitives in a 24×24 box (no `<svg>` wrapper), registered by kind in `src/components/weather/glyphs.tsx`. `WeatherIcon` wraps a glyph in an `<svg role="img">` with the condition label; `WeatherGlyph` returns the bare fragment for embedding in `HourlyChart`'s SVG via `<g transform>` — one drawing, two hosts.
2. **Kind mapping in `weatherCode.ts`**: `weatherInfo(code)` gains `kind: GlyphKind` (13 kinds); `icon` (emoji string) is removed so no consumer can regress silently — the typecheck finds every call site.
3. **Color**: structure (clouds, sun disc outline, fog lines, bolt) strokes `currentColor` — consumers set ink-600. Drops/flakes stroke `var(--color-precip)`. Sun disc + rays stroke `var(--color-sun)` (new token, muted gold `#c7920a` — a mark color, not text, so AA does not bind it; distinct from conf-medium's darker `#8a5c00` by role and context). Bolt fills `currentColor`.
4. **Sizes**: current conditions h-9; day rows h-[18px] w-[18px] centered in the existing 1.5rem column; mobile peek h-6; chart embeds at `scale(0.6)` (≈14px) replacing the `<text>` glyphs at the same x positions.
5. **Unknown code** renders a dashed cloud — quiet, not an alarm.

## Risks / Trade-offs

- [13 glyphs hand-drawn invites inconsistency] → all share the same cloud path constant and stroke constants; drops/flakes/rays are parameterized copies.
- [Colored marks at 14px could smear] → chart strip keeps ink-600 structure and drops only; verified in the screenshot round.

## Migration Plan

Presentational; rollback = git revert.

## Open Questions

None.
