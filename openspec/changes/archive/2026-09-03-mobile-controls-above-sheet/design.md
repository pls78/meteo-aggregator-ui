# Design: mobile-controls-above-sheet

## Stacking order

The mobile overlay root is a single stacking context (`z-[1000]`), so every control inside
it competes on its own `z-*` and then on DOM order. The weather sheet is full-width and
rendered last, which is why anything sharing its `z-[1000]` lost.

The mobile scale is now:

| Layer | z |
|---|---|
| weather sheet | `z-[1000]` |
| top bar, Layers FAB, locate, info, time-lapse | `z-[1010]` |
| layers modal scrim | `z-[1020]` |
| layers modal sheet | `z-[1030]` |

The scrim has to stay above the controls, not just above the sheet — otherwise a modal
sheet would leave live buttons floating over its own backdrop.

## Following the sheet without re-rendering the map

The time-lapse control has to track the sheet's visible height continuously, including
mid-drag. Putting that height in `appStore` would work, but the store is a React context:
every consumer re-renders on every change, `MapView` included, at pointer-move rate.

Instead `WeatherSheet` writes three custom properties on the document element:

- `--weather-sheet` — its visible height in px
- `--weather-sheet-ease` — `0s` while dragging or under reduced motion, else `0.3s`
- `--map-controls` — `visible` / `hidden`

`MobileShell` positions the time-lapse control with
`bottom: calc(var(--weather-sheet, 6rem) + 0.75rem)` and transitions `bottom` for
`var(--weather-sheet-ease)`, so the control is glued to the sheet edge during a drag and
eases with it on the settle, with no React work in between. `--map-controls` drives
`visibility` on the locate and info wrappers (and the time-lapse control), which also
removes them as tap targets — `opacity: 0` would have left invisible buttons over the
forecast.

## Snap geometry

`full` was `vh * 0.88`. On a short viewport that ate the search field, and it left an
arbitrary 12% for a control rail that needs a known amount. It is now
`max(vh * 0.5, vh - TOP_BAR_PX)` with `TOP_BAR_PX = 112` — the top bar's own height — so
the bar is always clear, and the `max` keeps the snap sane if the viewport is ever shorter
than the bar. Drags clamp to the same value rather than to the sheet's 92vh layout height,
so the rubber-band can no longer overshoot into the top bar.

`MAP_CONTROLS_PX = 264` is the bottom of the right-hand rail (info at `top-[13rem]` plus its
48px target plus a gap). Past that visible height the sheet has covered the map, and the
map-only controls step aside.

## Why the Layers control is the exception

Locate and info act on a map the sheet has hidden, so hiding them costs nothing. Imagery is
different: the sheet's `panel` material is translucent, so an active overlay still reads
through it — the state is visible, therefore the control that clears it has to be reachable.
The Layers FAB (`top-24`) overlaps only the sheet's empty grip row at the full snap, so it
can stay without covering data.

## Search field alignment

Tailwind's preflight gives form controls `font: inherit` but leaves `appearance: auto`. A
text input then carries a 24px line-height inside a UA-rendered `textfield` box, and WebKit
lays the value and placeholder against the **bottom** of that box; Chromium centers it,
which is why it only showed on iOS. Pinning the content box to exactly one line box
(`h-6 leading-6 p-0 appearance-none`, `md:h-5 md:leading-5` for the desktop `text-sm` step)
leaves no slack to misalign into. Desktop metrics are unchanged: 20px box, 20px line.
