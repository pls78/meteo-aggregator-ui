# Drawn weather icons

## Why

Weather conditions render as OS emoji — platform-dependent (Apple/Segoe/Noto all differ), stylistically foreign to the meteogram world, and flagged by the finish review as the single largest remaining gap to the craft bar. The icon language should be drawn in the product's own hand.

## What Changes

- A drawn monoline weather-glyph set (24×24, same stroke vocabulary as `components/icons.tsx`): 13 glyphs covering all WMO codes the backend emits (sun, mainly-clear, partly-cloudy, cloud, fog, drizzle, sun-shower, rain, sleet, snow, heavy-snow, thunderstorm, unknown).
- Semantic mark colors: structure strokes in ink (currentColor), precipitation marks (drops/flakes) in the `precip` token, sun in a new muted `sun` token.
- `lib/weatherCode.ts` maps codes to a glyph kind + label; a `WeatherIcon` component renders it; a `WeatherGlyph` export embeds the same drawing inside the hourly chart's SVG.
- Emoji replaced in every consumer: `LocationCard` (current conditions + day rows), `WeatherSheet` (peek header + day rows), `HourlyChart` (icon strip).
- Behavior and data unchanged.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `visual-design`: adds a requirement that weather-condition icons are drawn glyphs from a single shared set (no platform emoji), with semantic mark colors from the token vocabulary.

## Impact

- New `src/components/weather/` (glyphs + `WeatherIcon`/`WeatherGlyph`); `src/lib/weatherCode.ts` (kind mapping); `src/index.css` (one `--color-sun` token); consumers: `panels/LocationCard.tsx`, `mobile/WeatherSheet.tsx`, `hourly/HourlyChart.tsx`. `DESIGN.md` deviation entry for emoji is retired at finish.
