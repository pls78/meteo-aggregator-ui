# Tasks — redesign-ui-category-standard

## 1. Foundation

- [x] 1.1 Define the token vocabulary in `src/index.css` (`@theme`: ink ramp, surface, accent, A/B pair, semantics, radii, shadows, type sizes) and set the system font stack + `tabular-nums` defaults
- [x] 1.2 Add the impeccable direction-contract comment as the first child of `<body>` in `index.html`
- [x] 1.3 Swap the basemap style to CARTO Positron in `MapView` and update the `.map-container` loading tone; restyle markers to the A/B accent pair (single shared constant)

## 2. Desktop chrome

- [x] 2.1 Restyle `LocationCard` + `ComparisonPanel` (panel material, type scale, day rows, active states, skeleton loading)
- [x] 2.2 Restyle `ConfidenceTag` + `ConfidenceDetail` (semantic confidence colors, AA contrast)
- [x] 2.3 Restyle `SearchBox` and results dropdown (panel material, focus states, location bullets)
- [x] 2.4 Restyle `LayerControl` + legends/`RgbColorKey` and `MapAnimateControl`
- [x] 2.5 Restyle `HourlyPanel` + `HourlyChart` (token colors for series/precip, crosshair, axis type)
- [x] 2.6 Restyle `LocateButton` and `AboutButton`/`AboutDialog` (Read-surface typography inside the dialog)

## 3. Mobile chrome

- [x] 3.1 Restyle `MobileTopBar` (search + A/B target) to the shared system
- [x] 3.2 Restyle `WeatherSheet` (sheet material, grabber, A/B tabs, day rows, embedded chart)
- [x] 3.3 Restyle `MobileLayers` FAB + sheet

## 4. Verify and finish

- [x] 4.1 `npm run build` + `npm run lint` pass; grep built output for the direction-contract seed key
- [x] 4.2 Batched screenshot round (desktop + mobile, layers active) against the direction contract; fix findings in one batch; one confirm round
- [x] 4.3 Run `detect.mjs --json` over changed targets once; fix mechanical findings
- [x] 4.4 Spawn `impeccable-finish-reviewer` with screenshots + contract; apply material fixes; verdict round
- [x] 4.5 Spawn `impeccable-documenter` to write `DESIGN.md` from the built system
