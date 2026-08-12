# Tasks: weathersheet-height-animation

## 1. Rework the sheet motion

- [x] 1.1 Give the `WeatherSheet` section a fixed `92vh` layout height and drive
      peek/half/full + drag via `transform: translateY(...)` (visible-height math from a
      resize-aware viewport height; drag stays 1:1 with `transition: none`)
- [x] 1.2 Animate only the transform on snap settle (same 0.3s curve); disable the
      transition under `prefers-reduced-motion: reduce`
- [x] 1.3 Compensate the internal scroll container with `paddingBottom` equal to the
      off-screen portion so all content is reachable at every snap

## 2. Verify

- [x] 2.1 `npm run build` + `npm run lint` pass; detector (`detect.mjs --json`) no longer
      reports the animated-layout-property warning
- [x] 2.2 Manual pass on the dev server (mobile viewport): drag 1:1, tap-cycle, settle
      animation smooth, reduced-motion jump, last day row + detail reachable at half snap,
      day-tap auto-scroll still lands correctly, animate control still clears the peek

## 3. Documentation

- [x] 3.1 Remove the "WeatherSheet height animation" accepted deviation from `DESIGN.md`
      and `.impeccable/design.json`
