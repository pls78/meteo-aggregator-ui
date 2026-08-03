# Tasks — redesign-ui-meteogram

## 1. Foundation

- [x] 1.1 Retune tokens in `src/index.css` (paper surface, ink ramp, consensus blue accent/loc-a, reserved red loc-b, flatter shadows) and update `src/lib/accents.ts`
- [x] 1.2 Replace the direction-contract comment in `index.html` (meteogram, user-pinned, seed d8a5e4e2)

## 2. The signature

- [x] 2.1 Build `SpreadStrip` (inline SVG: per-model ticks + consensus tick from `day.breakdown`) and mount it in `LocationCard` and `WeatherSheet` day rows; rule the rows
- [x] 2.2 Add the dot-strip figure to `ConfidenceDetail` above the table
- [x] 2.3 Restyle `HourlyChart` to meteogram character (hairline grid, finer stroke, primary area fill, tracked-caps axis)

## 3. Verify and finish

- [x] 3.1 `npm run build` + lint pass; contract seed survives the build
- [x] 3.2 Batched screenshot round (desktop + mobile + layers), one fix batch, one confirm round
- [x] 3.3 Detector once over changed targets
- [x] 3.4 Finish reviewer + verdict pass; documenter rewrites `DESIGN.md`
