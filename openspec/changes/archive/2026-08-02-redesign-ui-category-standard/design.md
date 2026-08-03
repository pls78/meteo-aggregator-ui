# Design — redesign-ui-category-standard

## Context

The incumbent look is default Tailwind: slate utility grays, `bg-white/70 backdrop-blur` cards, no tokens, no scale. The direction was resolved through the impeccable skill's decision flow: the user rejected themed visual worlds and chose the **category standard for map-first weather apps, played straight**, with **Windy.com as the named craft bar** (recorded as a brand commitment in PRODUCT.md). Mode: Operate — the tool must disappear into the weather glance. Guardrails from the interview: glance speed is sacred; no gimmicks; the map must stay at least as readable as today.

## Goals / Non-Goals

**Goals:**

- One coherent, tokenized visual system shared by both layouts; every component reads as the same product.
- "Real product" finish: deliberate type scale, consistent panel material, complete interactive states (hover/focus/active/disabled/loading), tuned spacing.
- The map recedes into a calm data surface; UI chrome annotates it without crowding it.
- WCAG AA contrast and visible focus throughout.

**Non-Goals:**

- No behavior, layout-structure, copy, or interaction changes; no store/hook/API edits.
- No dark mode (the app is a daylight glance tool; light-only, as today).
- No new runtime dependencies; no webfont payload.

## Decisions

1. **Tokens as Tailwind v4 `@theme` variables in `src/index.css`** — the stack's native token mechanism; components consume them as utility classes (`bg-surface`, `text-ink-600`). Alternative (CSS modules / separate tokens file) rejected: fights Tailwind v4 idiom.
2. **Type: system UI stack** (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`), `tabular-nums` on all data. Operate mode explicitly permits system stacks; zero payload suits free-tier economics. Fixed rem scale, ratio ≈1.2: 11px captions/legends, 12px labels, 13px body/data rows, 14px titles, 28px current-temp display. Alternative (self-hosted Inter) rejected: adds payload for near-identical result.
3. **Palette (restrained strategy — Operate default):**
   - Neutrals: cool ink ramp — `ink-900 #1b2431` (titles/data), `ink-600 #4d5a70` (secondary), `ink-400 #8593a8` (captions), on `surface rgb(255 255 255 / 0.88)` panels with `ring-black/8` hairline and a two-tier shadow vocabulary.
   - Accent (selection, primary action, links): `accent #0f62d6`. Used for states only, never decoration.
   - Location pair (markers, card dots, search bullets, chart series): A `#0f62d6`, B `#e8590c` — colorblind-distinguishable blue/orange, replacing the current pair everywhere via the single shared constant.
   - Semantics: confidence high `#178a50` / medium `#b07a10` / low `#c23a3a` (AA on surface); precipitation `#2f86c9`; error `#c23a3a`.
4. **Basemap: swap CARTO Voyager → CARTO Positron** (same free vector-tile family, same attribution mechanics, one URL change in `MapView`). Positron's near-grayscale ground makes weather overlays and markers the loudest layer — the Windy-class move — and improves label/overlay contrast. Alternative (custom style JSON fork) rejected: maintenance burden for marginal gain. The `.map-container` loading background updates to match Positron's ground tone.
5. **Panel material is one recipe** — `bg-surface backdrop-blur-md ring-1 ring-black/8 rounded-xl shadow-*` — applied to every floating element (cards, search, layer panel, sheets, dialogs, FABs). Radius vocabulary: 12px panels, 8px inner controls, full pills for tags.
6. **States completed everywhere**: `focus-visible:ring-2 ring-accent` on all interactive elements; hover = one step of surface tint (`black/4`); active selection = `accent/10` fill + `accent` ring, replacing the current `bg-slate-100 ring-slate-300`; disabled = 40% ink; loading = skeleton blocks, not text ("Loading…" strings become shimmer rows).
7. **Impeccable process hooks**: the direction contract comment (THESIS/OWN-WORLD/STORY/FIRST VIEWPORT/FORM/FINISH) goes into `index.html` as the first child of `<body>`; after the build, `detect.mjs` runs once over changed targets; the `impeccable-finish-reviewer` subagent reviews screenshots; the `impeccable-documenter` writes `DESIGN.md` from the built system.

## Risks / Trade-offs

- [Glass panels over a light map can dip below AA for mid-tone text] → surface opacity fixed at ≥0.88 and contrast spot-checked over the brightest Positron ground.
- [Restyling ~20 components by hand invites drift] → tokens only; a component never introduces a raw hex or slate-* class; detector run catches strays.
- [Positron swap changes satellite-overlay perceived contrast] → verified visually with layers active during the screenshot round.
- [Two layouts drift] → each component pass edits desktop and mobile siblings together (repo rule).

## Migration Plan

Pure presentational change: single branch, no data or config migration. Rollback = git revert. Deploy via the standard `npm run build` + `wrangler pages deploy`.

## Open Questions

None — direction, quality bar, scope, and guardrails are user-confirmed.
