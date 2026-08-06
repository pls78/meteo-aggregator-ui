# Design — redesign-about-datasheet

## Context

Read surface inside the committed meteogram world; the seed assigned the datasheet structure (my candidate 6), user-accepted. Identity vocabulary is fixed by DESIGN.md; only composition changes.

## Goals / Non-Goals

**Goals:** the dialog reads as the instrument's spec sheet — every block ruled, labeled in tracked caps, tabular where the content is tabular; category-fluent readers scan it in seconds. **Non-Goals:** content or copy changes; behavior changes; new tokens.

## Decisions

1. **Section grammar**: tracked-caps titles ARE the headings (no kicker+heading stacks); hairline rules separate sections; prose capped at 60ch. No section numerals (sequence carries no information — craft-floor default).
2. **Features → ruled definition table** (term column + description column, `divide-y` hairlines) replacing the card grid.
3. **Confidence → one threshold table** (level in its semantic color, spread bound, note) replacing the three bordered cards.
4. **Sources → spec rows** (name, note, mono host right-aligned); models table keeps its structure with datasheet styling (well header, hairlines, tabular numerals).
5. **Layers → channel rows** derived from `GET /imagery` exactly as today (name, satellite tag, cadence badge, description in a ruled row).
6. **Weight tables** keep the bar visualization (it is a figure) inside ruled blocks; worked examples become "application note" blocks on the `well` surface.
7. **Panel material**: the dialog adopts the shared `panel` recipe on `surface-solid` (dense reading surface — opaque allowed) and `shadow-panel`, dropping the stock `shadow-2xl` one-off.

## Risks / Trade-offs

- [Datasheet density vs general-reader comprehension] → prose intros and worked examples remain verbatim; tables carry only what was already tabular.

## Migration Plan

One-component recomposition; rollback = git revert.

## Open Questions

None.
