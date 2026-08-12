---
name: Meteo Aggregator
description: Map-first multi-model weather UI — the consensus drawn as evidence, meteogram-style, at Windy-level craft.
colors:
  ink-900: "#16181d"
  ink-600: "#4d5a70"
  ink-400: "#66768b"
  ink-300: "#b8c1ce"
  surface: "rgb(252 252 250 / 0.95)"
  surface-solid: "#fcfcfa"
  well: "#f4f6f8"
  accent: "#2456a6"
  loc-a: "#2456a6"
  loc-b: "#d1495b"
  conf-high: "#147946"
  conf-medium: "#8a5c00"
  conf-low: "#a83232"
  precip: "#2f86c9"
  sun: "#c7920a"
  hairline: "#e9ecf1"
  danger: "#c23a3a"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.25rem"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  caption:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 500
    letterSpacing: "0.05em"
rounded:
  skeleton: "6px"
  control: "8px"
  panel: "12px"
  sheet: "16px"
  pill: "9999px"
spacing:
  hairline: "2px"
  tight: "6px"
  base: "8px"
  related: "12px"
  panel: "16px"
  section: "24px"
components:
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.panel}"
    padding: "16px"
  day-row:
    textColor: "{colors.ink-900}"
    rounded: "{rounded.control}"
    padding: "4px 6px"
  day-row-active:
    backgroundColor: "rgb(36 86 166 / 0.10)"
    textColor: "{colors.ink-900}"
    rounded: "{rounded.control}"
    padding: "4px 6px"
  confidence-tag-high:
    textColor: "{colors.conf-high}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 6px"
  confidence-tag-medium:
    textColor: "{colors.conf-medium}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 6px"
  confidence-tag-low:
    textColor: "{colors.conf-low}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 6px"
  button-play:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    size: "36px"
  control-round:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-600}"
    rounded: "{rounded.pill}"
    size: "48px"
---

# Design System: Meteo Aggregator

## Overview

**Creative North Star: "The Meteogram"**

This UI belongs to the scientific meteogram / ensemble-plume tradition, not the
glass-card weather-app default: **the consensus is drawn as evidence**. Every daily
value carries the visible spread of the per-model forecasts behind it — faint ink
ticks clustered around a bold consensus stroke — so uncertainty is *shown*, not just
labeled. The ground is paper (a warm near-white, `surface`), structure is hairline
rules rather than boxes, and labels read as annotations (tracked caps, tinted text,
no chip fills). The direction is a standing brand commitment in PRODUCT.md (chosen
2026-08-02, seed key `d8a5e4e2`, pinned atop `index.html`); **Windy.com remains the
named craft bar**.

Color is a strict grammar: **consensus blue** (`accent`) is both the blended
forecast's stroke and location A; a **reserved red** (`loc-b`) exists only to be
location B. Three darkened semantics carry confidence as tinted text. Everything
else is a cool ink ramp on paper. The map (CARTO Positron) stays a quiet field under
the data; panels float with flat, low shadows and a light 8px blur so the chart-like
content — not the chrome — is the loudest thing on screen.

**Key Characteristics:**
- Evidence first: per-model spread ticks under every daily value (`SpreadStrip`), per-model dots behind every consensus figure (`DotStrip`).
- Paper ground + hairline rules: lists divide with `ink-900/8` hairlines and the `hairline` token; no boxed rows.
- Annotation labels: 10px tracked-caps weekdays and table headers in `ink-400`; confidence as tinted text with no fill.
- One accent doing double duty: consensus blue = action/selection = location A; red is reserved for location B alone.
- Drawn monoline weather glyphs in the chrome-icon hand — structure in ink, precipitation and solar marks in their own tokens; no emoji.
- System sans, zero webfont; `tabular-nums` on every number.
- Light-only, flat-leaning elevation; complete state vocabulary (hover, focus-visible, active, disabled, skeleton, inline error).

## Colors

A cool ink ramp on warm paper, one consensus blue, one reserved red, and a small
strictly semantic supporting cast. All tokens live in the `@theme` block of
`src/index.css`; components consume them as Tailwind utilities (`text-ink-600`,
`bg-accent/10`) — never raw palette classes or literal hex. SVG figures route
through the same tokens via `var(--color-*)`.

### Primary
- **Consensus Blue** (`accent`): the meteogram's bold stroke — the consensus tick in every spread strip and dot figure, the temperature line, plus every action and selection state (`bg-accent/10` + `ring-accent/40` fills, focus outlines, the play button, native `accent-color`). A calmer, inkier blue than a stock UI blue: it must read as a drawn mark on paper.

### Secondary — the location pair
- **Location A Blue** (`loc-a`): the primary location — map marker, card dot, search bullet, A tab, chart series. Identical to `accent` by design: location A *is* the consensus view.
- **Reserved Red** (`loc-b`): location B, everywhere A appears, and nowhere else. Exported with A from `src/lib/accents.ts` (`LOC_A`/`LOC_B`) — the only source for location coloring (the tokens mirror it).

### Tertiary — semantics
- **Confidence Green** (`conf-high`): high-confidence text; darkened to clear 4.5:1 on the surface.
- **Confidence Amber** (`conf-medium`): darkened for AA at 10px on the bare surface (tags carry no tint fill to help them).
- **Confidence Red** (`conf-low`): deliberately deeper than `loc-b`'s red so B-marks and low-confidence text never read as one voice.
- **Precipitation Blue** (`precip`): mm amounts in day rows, and the drops/flakes in the drawn weather glyphs; distinct from `accent` so rain never reads as a link.
- **Sun Gold** (`sun`): the solar marks (disc + rays) in the drawn weather glyphs. A mark color, not a text color — it appears only inside glyph SVGs, never as UI text or fills.
- **Hairline** (`hairline`): chart gridlines and drawn rules on the paper ground (the token behind the chart's `GRID`).
- **Error Red** (`danger`): inline error copy (`text-danger`) only.

### Neutral
- **Ink 900** (`#16181d`): titles, emphasized data, body default (set on `<body>`) — near-black, barely cool. Also the inverse surface: dark toasts/hints are `bg-ink-900` with white text; scrims are `ink-900/40` (dialog, blurred) and `ink-900/35` (mobile layer sheet).
- **Ink 600** (`#4d5a70`): secondary text, chart axis labels (AA at 10px), resting control icons.
- **Ink 400** (`#66768b`): annotation labels (tracked-caps weekdays, table headers), captions, placeholders, the per-model ticks/dots in spread figures, resting icon-button glyphs.
- **Ink 300** (`#b8c1ce`): the scale/baseline stroke in spread figures, the sheet grip bar, blocked-state glyphs. Non-text only.
- **Paper Surface** (`surface`): the panel material — warm near-white at 0.95 alpha, opaque enough for AA mid-tone text over the brightest Positron ground while still reading as paper laid on the map.
- **Solid Paper** (`surface-solid`, `#fcfcfa`): opaque surfaces — search dropdown, legend image backing, the chart hover-dot outline.
- **Well** (`#f4f6f8`): inset secondary surface — table headers and info-card wells in the About dialog.
- Hairlines and tints are alpha inks: borders/dividers `ink-900/8`–`/10`, hover fill `ink-900/5`, the panel ring `rgb(22 24 29 / 0.1)`.
- **Satellite legend keys** (`src/lib/layerLegends.ts`) are **data colors, not palette**: the swatches transcribe the colors that actually appear in EUMETSAT RGB imagery (dust pink `#e06be0`, ice green `#3fb24a`, cold-cloud red `#d14a3a`, …), so they must match the satellite products, never the UI tokens. Documented in the sidecar as the `satellite-legend` ramp; add there if EUMETSAT adds a product.

### Named Rules
**The No-Raw-Palette Rule.** A component never introduces a literal hex value or a
stock Tailwind palette class (`slate-*`, `gray-*`). Everything routes through the
`@theme` tokens — including SVG, via `var(--color-*)`; location colors route through
`lib/accents.ts`.

**The Blue-Means-Consensus Rule.** `accent` is the consensus stroke and the
interaction color — the bold tick, the temperature line, the selection fill, the
focus ring. If something blue is neither the consensus mark nor interactive, it's
the wrong color (`precip` for rain).

**The Reserved-Red Rule.** `loc-b` red appears only as location B. Low confidence
and errors use their own deeper reds (`conf-low`, `danger`) precisely so a B-mark is
never mistaken for a warning.

**The Ink-400 Floor Rule.** `ink-400` text is legible only on `surface` /
`surface-solid`. On the `well` surface it fails AA — small text there steps up to
`ink-600` (application-note headers, well-tinted table header rows, the dialog
footer; section titles stay `ink-400` because they sit on `surface-solid`).

## Typography

**Display/Body Font:** system UI stack (Tailwind v4 default: `ui-sans-serif, system-ui, sans-serif` + emoji fallbacks). No webfont, deliberately — zero payload, native rendering.

**Character:** a quiet workhorse sans doing scientific-figure duty. The voice is in
the numbers (`tabular-nums` everywhere) and in the annotation layer: small tracked
uppercase labels in `ink-400` that read like axis annotations, not UI chrome.

### Hierarchy
- **Display** (600, 1.75rem/2rem, tracking-tight, tabular-nums): the current temperature on the desktop card. The mobile sheet's peek header uses a 1.5rem step of the same treatment.
- **Headline** (700, 1.5rem, tracking-tight): About-dialog hero only. Never appears over the map.
- **Title** (600, 0.875rem): panel headers — location name, "Satellite layers", day headings in sheets.
- **Body** (400, 0.875rem): day-row values, search results, layer names, explanations. Long-form copy (About dialog) capped at `max-w-[60ch]`; explanation paragraphs in the confidence detail at `max-w-[17rem]`.
- **Caption** (400, 0.75rem): secondary lines ("Partly cloudy · 58% RH"), legends, view labels ("hourly" / "confidence"), opacity readouts.
- **Label / Annotation** (500, 10px, tracking-wider, UPPERCASE): weekday initials in day rows, model-table column headers, micro-badges — always `ink-400` at rest. Confidence tags use the same 10px weight in their tinted color, lowercase.
- **Figure type** (SVG): 10px axis in `ink-600`, 9px scale endpoints in `ink-400`, 11px bold value readouts in the series accent, 600-weight consensus/end-of-line labels.

### Named Rules
**The Tabular Rule.** Every rendered number gets `tabular-nums`. No exceptions.

**The Annotation Rule.** Micro-labels are annotations on a figure: 10px, tracked
caps, `ink-400`, no background. If a label wants a filled chip, it's probably
over-dressed for this world.

**The 16px Input Rule.** Text inputs are `text-base` (16px) below `md` and
`text-sm` above — iOS zooms into any focused input under 16px and never zooms back
out (the viewport is locked `user-scalable=no` for the same reason).

## Layout

The map is the page. `#root` is a full-viewport, non-scrolling surface (`overflow:
hidden` on `html`/`body` too); every piece of UI is absolutely positioned chrome
floating above the map canvas, with `pointer-events-none` wrappers so the map stays
clickable between panels.

- **Desktop (≥ 768px):** search stack top-left; forecast card(s) top-right — cards size to their widest day row (`w-max min-w-72 max-w-[22rem]`), sit side by side when comparing, and scroll within `max-h-[calc(100vh-2rem)]`; layers panel bottom-left (`w-64`); time-lapse pill bottom-center; hourly/confidence sheet slides up bottom-center (`max-w-5xl`), always flush with the bottom edge — the two bottom controls lift themselves above its top edge (translateY, 300ms, none under reduced motion), each only when the sheet's panel would actually overlap it (a `ResizeObserver` in `DesktopOverlays` measures the sheet, so the lift tracks its content-dependent height); locate + info controls stacked bottom-right.
- **Mobile (< 768px, `useIsMobile`):** a top bar (full-width search + A/B target or "+ Compare" pill), a right-edge FAB rail (layers at `top-24`, locate at `top-[9.5rem]`, info at `top-[13rem]`; 48px targets), the time-lapse pill floating above the sheet (`bottom-[6.5rem]`), and the draggable weather sheet pinned to the bottom with three snap heights — peek 96px, half 46vh, full 88vh.
- **Spacing rhythm** (4px grid): 16px panel padding (12px on the denser layers panel), 8px between siblings, 12px between related groups, 24px between dialog sections. Day rows sit on hairline dividers (`divide-y divide-ink-900/8`, `py-px` items) instead of gaps — ruled paper, not stacked chips. Screen-edge gutter: 12px (mobile), 16px (desktop).
- **Z-order vocabulary:** map at 0 → in-panel popovers `z-10` → overlay shells `z-[1000]` → hourly sheet / layer scrim `z-[1001]` → layers panel/sheet + desktop time-lapse pill `z-[1002]` (both bottom controls glide *over* the sheet while lifting) → About dialog `z-[2000]`.
- Both layouts consume the same tokens, store, and shared components (`ConfidenceTag`, `ConfidenceDetail`, `SpreadStrip`, `HourlyChart`, `SearchBox`, `LocateButton`, `AboutButton`); a visual change to one layout must land in its sibling in the same pass.

## Elevation & Depth

Depth is real but flat-leaning: paper panels sit just above the map, lifted by a
light 8px blur and a two-tier shadow vocabulary that stays close to the surface —
sheets of paper on a table, not glass cards in space. Each shadow is paired with a
hairline ring that draws the edge where the shadow is too soft to.

### Shadow Vocabulary
- **Panel** (`--shadow-panel`: `0 1px 2px rgb(22 24 29 / 0.05), 0 12px 32px -16px rgb(22 24 29 / 0.22)`): every floating panel, always combined with the hairline ring `0 0 0 1px rgb(22 24 29 / 0.1)` (both baked into the `panel` utility along with `backdrop-blur(8px)`).
- **Control** (`--shadow-control`: `0 1px 2px rgb(22 24 29 / 0.07), 0 6px 16px -10px rgb(22 24 29 / 0.25)`): lighter, for small floating bits — the play button, dark toasts/hints.
- The About dialog shares `shadow-panel` + the `ink-900/10` hairline ring on an opaque `surface-solid` ground (it sits over a scrim, not the map, so it skips the blur and translucency).

### Named Rules
**The One Recipe Rule.** Every element floating over the map is the `panel` utility
— `bg-surface` + `backdrop-blur(8px)` + `shadow-panel` + hairline ring — plus a
radius from the Shapes scale. No second material exists; a new floating element
starts from `panel`.

**The Static Elevation Rule.** Shadows do not respond to state. Hover and focus are
color and outline changes; nothing lifts, grows, or deepens its shadow.

## Shapes

Soft-rectangular, radius scaled to size: **8px** (`rounded-lg`) inner controls —
icon buttons, day rows, tabs; **12px** (`rounded-xl`) panels — cards, search,
layers; **16px** (`rounded-2xl`) sheets, the dialog, and the mobile layers FAB
(bottom sheets round only their top corners with `rounded-t-2xl` when flush with
the screen edge); **full pills** for tags, grips, the time-lapse control, and round
map buttons (locate, info, play). Skeletons use 6px; legend swatches 4px. Structure
inside panels is drawn, not boxed: hairline rules (`divide-y` / `border-t` at
`ink-900/8–10`, `hairline` in SVG), never solid gray strokes. Icon geometry
matches: all chrome icons share one hand — 24-unit viewBox, 2px stroke, round caps
(`src/components/icons.tsx` plus inline siblings) — and the weather glyphs draw in
the same vocabulary at ~1.8px (see Components → Weather Glyphs).

## Components

**State vocabulary (applies to every interactive element):**
- **Hover:** one step of surface tint (`hover:bg-ink-900/5`) and/or one ink step up (`ink-400 → ink-600`, `ink-600 → ink-900`); `transition-colors`. Confidence tags instead gain a faint self-colored ring (`hover:ring-1 ring-current/40`).
- **Focus:** `focus-visible:outline-2 outline-accent` universally (the search container uses `focus-within:ring-2 ring-accent`; the play button adds `outline-offset-2`; controls on dark toasts use `outline-white`).
- **Active selection:** `bg-accent/10` fill + `ring-1 ring-accent/40`, with `aria-pressed` (day rows, sheet tabs). Confidence tags ring in their own color (`ring-2 ring-current/60`).
- **Disabled:** `opacity-40` + `disabled:cursor-not-allowed` (locked layer rows use `opacity-60`).
- **Loading:** `skeleton` utility blocks (6px radius, `ink-900/8`, 1.6s opacity pulse) shaped to the final layout so content loads without reflow. Minor text fallbacks remain in low-stakes spots ("Searching…", "Loading layers…").
- **Error:** inline `text-danger` sentence in place of the failed content — what failed plus a practical next step ("Couldn't load the forecast. Check your connection and try again."); short-form for small panels ("Couldn't load layers.").

### Spread Strip (signature)
The meteogram signature at row scale (`src/components/panels/SpreadStrip.tsx`): a
56×12 inline SVG at the end of every day row. A hairline baseline (`ink-300` at 0.6),
one faint 1px tick per model (`ink-400` at 0.55, ±3px tall) at its deviation from
the consensus, and a bold 2px round-capped **consensus tick in `accent`** spanning
nearly the strip's height. Renders nothing with fewer than two models. **The scale
is shared across the whole card** (see the rule below): the parent computes
`spreadExtent(days)` — the week's largest |model − consensus| deviation, floored at
1° — and passes it to every strip, so all strips render in the same
degrees-per-pixel.

**The Shared Scale Rule.** All spread strips in one card share one degrees-per-pixel
scale (`spreadExtent`, floored at 1°). A tight cluster must *genuinely* read tighter
than a scattered one, row to row — never rescale a strip to its own day's extent.

### Dot Strip (signature)
The same evidence at reading scale (`DotStrip` in
`src/components/confidence/ConfidenceDetail.tsx`): a 240×34 SVG above the per-model
table — an `ink-300` scale line, one 2.5px-radius dot per model (`ink-400` at 0.6),
the bold `accent` consensus tick with its value labeled beneath in 9px semibold
accent, and 9px `ink-400` endpoint temperatures (each hidden when the consensus
label would collide). This strip auto-scales to its own day — it is the drill-down
figure, not a row-to-row comparison.

### Panels / Cards
- **Corner Style:** 12px; sheets 16px.
- **Recipe:** the `panel` utility (see The One Recipe Rule); 16px padding.
- **Location card:** header row (location-accent dot + truncating title + ✕), display-size current temp with a 36px drawn weather glyph, then seven hairline-ruled day rows. Sizes to its widest row; never wraps a day.
- Cards and the hourly sheet enter/exit with a 300ms ease-out fade + small translate, and the enter fade is held until data settles so the animation runs on final content.

### Day Rows (signature)
Ruled rows (`divide-y divide-ink-900/8`), two targets per row side by side (a
nested button is invalid HTML): the day area
(`grid-cols-[2.5rem_1.5rem_1fr_auto]`: **tracked-caps weekday** — 10px medium
uppercase tracking-wider `ink-400` — an 18px drawn weather glyph, `max° / min°` with min in
`ink-400`, optional precip mm in `precip`, then the SpreadStrip) opens the hourly
view; the **ConfidenceTag** opens the confidence detail. Each highlights
independently with the active-selection treatment.

### Confidence Tag (annotation label)
A fill-free tinted-text annotation (`src/components/confidence/ConfidenceTag.tsx`):
info glyph + short lowercase label ("high"/"med"/"low"), 10px medium, colored
`text-conf-*` with **no background** — it reads as a note on the row, not a chip.
Interaction is carried by rings: `hover:ring-1 ring-current/40`, active
`ring-2 ring-current/60`, pill-shaped hit area (`px-1.5 py-0.5`). (The confidence
*detail* header keeps a small `bg-conf-*/10 text-conf-*` level pill — the one place
the tint fill survives, as a heading device.)

### Search
- **Field:** a `panel` at 12px radius, `px-3 py-2`, leading location-accent dot, borderless transparent input, `ink-400` placeholder; whole container rings accent on focus-within.
- **Results:** opaque dropdown (`bg-surface-solid`, panel shadow, `ink-900/10` ring), full-width rows, hover/focus fill `accent/8`.

### Buttons / Controls
- **Icon buttons** (✕, close): 28px hit area at 8px radius, `ink-400` glyph → `ink-600` + `ink-900/5` fill on hover; negative margin (`-m-1`) preserves optical alignment.
- **Round map controls** (locate, info): `panel` pills, `ink-600` glyph → `ink-900` on hover; 48px on mobile. Locate swaps its glyph for a spinning arc while resolving and drops to `ink-300` when permission is blocked (still activatable — it explains instead, via a dark toast anchored beside it).
- **Play/pause (time-lapse):** the one solid-accent button — 36px accent circle, white filled glyph, `shadow-control`, `hover:bg-accent/90`; disabled state is `ink-900/10` fill with `ink-400` glyph. Lives in a `panel` pill with the layer name and a tabular frame time (+ spinner while tiles load).
- **Native inputs:** checkboxes and range sliders use `accent-accent` — no custom re-drawing.

### Chips / Segmented A-B
The mobile A/B target: a `panel` at 12px radius with 4px padding holding two 8px
tabs; the active tab fills with its location color at 10% (`bg-loc-a/10 text-loc-a`
/ `bg-loc-b/10 text-loc-b`), inactive tabs are `ink-600`. Before a comparison
exists it collapses to a "+ Compare a place" `panel` pill carrying the reserved-red
dot. The weather sheet's location tabs use the same grammar with `accent/10` +
`ring-accent/40`. Dark hint toasts (`bg-ink-900`, white 12px semibold, pill,
`shadow-control`) flash transient guidance ("Tap the map to set B").

### Sheets (mobile)
Bottom sheets are `panel` + `rounded-t-2xl` with a centered grip bar (`h-1.5 w-10`
`ink-300` pill). The weather sheet snaps peek/half/full — tap the grip to cycle,
drag to the nearest snap. The sheet is a fixed-height (92vh) panel pushed down by
`translateY`: the settle animation is `transform 0.3s cubic-bezier(0.2,0.8,0.2,1)`
(none under reduced motion), the drag tracks the pointer 1:1 with no transition,
and the internal scroll area pads its bottom by the off-screen portion so every
row stays reachable at every snap. Its day list is
the same ruled-row + SpreadStrip + ConfidenceTag grammar as the desktop card. The
layers sheet slides in with `translate-y` over an `ink-900/35` scrim. Content
scrolls internally (`touch-action: pan-y`); the map never pans behind a sheet.

### Dialog (About) — the instrument's datasheet
Full-screen sheet on mobile; centered `max-w-3xl` card at 16px radius on desktop,
on the shared material — opaque `bg-surface-solid` + `shadow-panel` + `ink-900/10`
hairline ring — over an `ink-900/40` blurred scrim. Composed as a datasheet:
- **Sections** are hairline-ruled (`border-b ink-900/8`), and their 10px
  tracked-caps titles (semibold, `tracking-[0.14em]`, `ink-400`) *are* the headings
  — the Annotation Rule at section scale. Only the title block keeps a headline.
- **Capabilities** are a ruled definition list (`<dl>` with `divide-y ink-900/8`,
  fixed-width `ink-900` terms, `ink-600` definitions); **data sources** and
  **imagery channels** are wrapping spec rows in the same ruled grammar (name,
  chips, description, cadence chip).
- **Models** and **confidence thresholds** are ruled tables inside an
  `ink-900/10`-ringed rounded-lg frame with a `well`-tinted tracked-caps header row
  (`ink-600` — see the Ink-400 Floor Rule); confidence levels appear as
  `text-conf-*` semibold text in the Level column, no fills.
- **Worked examples** are "application note" blocks on the well surface
  (`rounded-lg bg-well ring-1 ring-ink-900/8`) with tracked-caps `ink-600` titles
  ("Application note · …").
- **Tags** (model role, cadence, satellite, "local") use the neutral bordered
  **CHIP**: 10px tracked caps, `ink-600` text, `ink-900/10` border, rounded, no
  fill — the text carries the meaning; semantic colors stay reserved for
  confidence and locations. Weight bars fill solid `accent` in `ink-900/10`
  tracks; imagery rows load as `skeleton` blocks.

### Hourly Chart (signature)
Dependency-free inline SVG (`src/components/hourly/HourlyChart.tsx`): two stacked
panels sharing one hour axis — temperature lines above paired precipitation bars —
**never a dual-axis chart**. Drawn like a figure: **1.5px** round-joined lines with
1.8px point dots, and on the primary series only, a whisper of area fill under the
line (`accent` at 0.06 opacity). Gridlines are the `hairline` token; every ink is
token-routed (`AXIS_INK` = `var(--color-ink-600)`, `GRID` =
`var(--color-hairline)`, `VALUE_INK` = `var(--color-ink-900)`). Series colors are
exactly `LOC_A`/`LOC_B`; identity is carried by a legend beside the chart. Precip
bars render in the series accent at 0.75 opacity with a **1mm domain floor**, so
trace drizzle draws as a sliver, never a full-height bar. Point density adapts to
width (every 3h → 1h), each plotted point labeled with its hour; hover/tap shows a
dashed `ink-600` crosshair, `surface-solid`-stroked dots, accent-colored readouts,
and bolds the active hour label.

### Map
- **Basemap:** CARTO Positron (`basemaps.cartocdn.com/gl/positron-gl-style`) — the near-grayscale ground is a design decision, not a default; it is the quiet field the meteogram sits on. `.map-container` pre-loads with `#eef0f2` to match Positron's ground tone. Locked north-up, no pitch.
- **Markers:** stock MapLibre pins colored `LOC_A`/`LOC_B`.
- **WMS overlays:** raster layers under user-controlled opacity (180ms fade when static); the time-lapse crossfades pre-loaded frames (incoming snaps on top instantly, outgoing fades 380ms) so no basemap flash appears mid-loop; 550ms/frame cadence.

### Weather Glyphs (signature)
The drawn condition-icon set (`src/components/weather/glyphs.tsx`): 13 monoline
glyphs on a 24×24 viewBox in the chrome icons' hand — round caps, ~1.8px stroke —
one per condition family (`sun`, `sun-cloud`, `cloud-sun`, `cloud`, `fog`,
`drizzle`, `rain-sun`, `rain`, `sleet`, `snow`, `snowflake`, `thunder`, and a
dashed-cloud `unknown`). Color is a two-layer grammar: **structure**
(clouds, fog lines, the thunder bolt) strokes `currentColor` — consumers set it,
normally `text-ink-600` — while **semantic marks** carry their own tokens: drops
and flakes in `var(--color-precip)`, solar discs/rays in `var(--color-sun)`. Each
glyph is a bare SVG fragment so one drawing serves both hosts
(`src/components/weather/WeatherIcon.tsx`): `WeatherIcon` wraps it in an `<svg
viewBox="0 0 24 24">` with an `aria-label` for HTML contexts (location cards at
18px/36px, the mobile sheet at 18px/24px), and `WeatherGlyph` returns the raw
fragment for embedding inside another SVG — the hourly chart places it via `<g
transform="translate(…) scale(0.6)">` with `color: var(--color-ink-600)`. The WMO
`weather_code` → glyph kind + label mapping lives in `src/lib/weatherCode.ts`. New
conditions extend the glyph set in the same vocabulary; never mix in emoji or
off-hand icons.

## Do's and Don'ts

### Do:
- **Do** draw evidence with every consensus value: a `SpreadStrip` per day row, the `DotStrip` in the confidence detail — faint `ink-400` model marks around a bold 2px `accent` consensus stroke.
- **Do** give all spread strips in a card one shared scale via `spreadExtent` (week max deviation, floored at 1°) — The Shared Scale Rule.
- **Do** start every floating element from the `panel` utility (blur 8px, `shadow-panel`, `rgb(22 24 29 / 0.1)` ring) and the radius scale (8/12/16px) — The One Recipe Rule.
- **Do** consume `@theme` tokens for every color — `var(--color-*)` inside SVG — and `lib/accents.ts` for location colors; add a token before adding a color.
- **Do** structure lists with hairline rules (`divide-y divide-ink-900/8`; `hairline` in figures) and label them with 10px tracked-caps `ink-400` annotations.
- **Do** put `tabular-nums` on every number and `focus-visible:outline-2 outline-accent` on every interactive element.
- **Do** use `bg-accent/10` + `ring-accent/40` + `aria-pressed` for any selected state; confidence stays tinted text with `ring-current` states, no fill.
- **Do** load with `skeleton` blocks shaped like the final content, hold enter-fades until data settles, and edit desktop and mobile siblings in the same pass.
- **Do** keep inputs ≥ 16px below `md` (iOS focus-zoom) and keep sheet content scrolling internally (`touch-action: pan-y`).

### Don't:
- **Don't** use raw palette classes (`slate-*`, `gray-*`) or literal hex in components; SVG figures route through `var(--color-*)` too.
- **Don't** rescale a spread strip to its own day, drop the 1° extent floor, or render a strip for fewer than two models.
- **Don't** use `loc-b` red for anything but location B — low confidence is `conf-low` (deliberately deeper), errors are `danger`.
- **Don't** put fills behind annotation labels: confidence tags, weekday initials, and table headers are text on paper (the confidence-detail header pill and the mobile A/B tabs are the sanctioned tinted-fill survivors).
- **Don't** build a dual-axis chart; temperature and precipitation get separate stacked panels sharing one x-axis, and the precip domain keeps its 1mm floor.
- **Don't** animate layout properties — transforms and opacity only, 300ms ease-out — except the weather sheet's height, which is its drag mechanic.
- **Don't** add a dark mode, a webfont, shadows that react to hover, or a second panel material.
- **Don't** swap the Positron basemap or re-enable rotation/pitch/page zoom; the muted, locked map is the meteogram's field.
- **Don't** render weather conditions with emoji or off-hand icons — every condition comes from the drawn glyph set (structure `currentColor`, drops/flakes `precip`, solar marks `sun`).
- **Don't** set `ink-400` text on the `well` surface — it fails AA there; small text on wells steps up to `ink-600` (The Ink-400 Floor Rule).
- **Don't** reference internal components or infrastructure in error copy — errors name what failed in the visitor's terms plus a recovery they can perform ("Check your connection and try again.").
