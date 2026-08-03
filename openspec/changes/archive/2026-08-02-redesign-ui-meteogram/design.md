# Design — redesign-ui-meteogram

## Context

User-pinned direction after reversing the canon pick: **The Meteogram** (roll 3's assignment, seed d8a5e4e2). The token foundation, Positron basemap, icons, states, and skeletons from the archived category-standard change carry forward; this change replaces the *material and signature* so the identity is visibly the product's own: consensus drawn over spread.

## Goals / Non-Goals

**Goals:**

- The consensus mechanism is visible at a glance: every day row shows the models' spread and the blended value as marks, not just a "med" pill.
- Panels read as figures on paper — hairline rules, annotation typography — while staying instantly glanceable (Operate mode, guardrails unchanged: glance speed, no gimmicks, map readability).
- One retuned token set; both layouts stay in lockstep.

**Non-Goals:** behavior/interaction changes; new data fetches; dark mode; icon-set replacement (still a follow-up).

## Decisions

1. **Palette (from the pinned card):** ground `#fcfcfa` at 95% opacity (paper, blur kept subtle), ink-900 `#16181d`, consensus blue `#2456a6` = accent = location A, reserved red `#d1495b` = location B (never used for anything else), per-model trace `ink-300` ticks. Confidence tags keep their semantic colors as *labels*; the strip is the evidence. Flatter elevation: hairline ring + one soft shadow tier.
2. **SpreadStrip component** (`src/components/panels/SpreadStrip.tsx`): pure inline SVG, ~w-16 h-3 per row. Domain = min..max of that day's `breakdown` temperature_2m_max padded 1°; faint 1px ticks per model, 2px accent tick for consensus. Renders nothing when <2 models present. Same component in LocationCard and WeatherSheet rows.
3. **ConfidenceDetail dot strip**: same domain logic at larger scale (full-width line, dots + labeled consensus tick) above the existing table — the figure the table annotates.
4. **Figure composition**: day rows separated by hairlines (`divide-y ink-900/8`); weekday in 10px tracked caps `ink-400`; card header = place name + a thin rule; controls (layers, animate pill) keep their shapes but adopt paper material.
5. **HourlyChart**: grid hairlines lighten, temperature stroke 1.5px with a subtle area fill (`accent/6`) for the primary series only, axis labels 9–10px tracked caps. Colors already tokenized.
6. **Contract + finish**: new direction-contract comment in `index.html` (FORM: meteogram, user-pinned, seed d8a5e4e2); finish review + verdict; documenter rewrites DESIGN.md from the built world.

## Risks / Trade-offs

- [Spread strips add per-row marks that could slow the glance] → strips are quiet (faint ticks), aligned in their own column, and the temp numbers stay the loudest marks in the row.
- [Red location B vs red "low" tag proximity] → conf-low stays darker `#c23a3a` and only ever appears inside a tag pill with text; B-red appears only as series/marker/dot color.
- [Paper panels over bright satellite imagery] → opacity 0.95 keeps text AA everywhere; verified in the layer screenshot.

## Migration Plan

Presentational only; rollback = git revert. Same deploy path.

## Open Questions

None — direction user-pinned; scope identical to the archived change.
