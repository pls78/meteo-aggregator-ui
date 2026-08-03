# Tasks — drawn-weather-icons

## 1. The glyph set

- [x] 1.1 Add the `--color-sun` token; author the 13 glyphs + `WeatherIcon`/`WeatherGlyph` in `src/components/weather/`
- [x] 1.2 Rework `lib/weatherCode.ts`: code → `{ kind, label }`; remove the emoji field

## 2. Consumers

- [x] 2.1 `LocationCard`: current conditions + day rows
- [x] 2.2 `WeatherSheet`: peek header + day rows
- [x] 2.3 `HourlyChart`: replace `<text>` emoji strip with embedded glyphs

## 3. Verify and finish

- [x] 3.1 Build + lint pass
- [x] 3.2 Screenshot round (desktop + mobile + hourly), fix batch, confirm
- [x] 3.3 Detector over changed targets; update DESIGN.md deviation entry (documenter continuation); archive
