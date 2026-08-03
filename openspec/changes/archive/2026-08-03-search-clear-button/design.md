# Design — search-clear-button

## Context

`SearchBox` reflects the selected location's label when idle and restores it on blur; the comparison instance already carries a plain-✕ remove button. A second permanent ✕ would be ambiguous.

## Goals / Non-Goals

**Goals:** one-tap clear while editing; no ambiguity with the remove control; keyboard operable. **Non-Goals:** changing selection semantics (clearing text never clears the location; blur without a new choice still restores the label).

## Decisions

1. **Visibility rule**: the clear control renders only when the field has text AND focus is inside the search container. Idle bars keep today's look; the comparison bar shows two ✕s only mid-edit, where the circled-fill glyph vs the plain stroke ✕ (and position, inside vs edge) keep them distinct.
2. **Focus tracking moves to the container** (`onFocus`/`onBlur` with a `relatedTarget` containment check on the wrapper): tabbing from the input to the clear button no longer counts as blur, so the button doesn't vanish before a keyboard user can press it. The blur-restores-label behavior is preserved for focus leaving the whole container.
3. **Glyph**: `ClearIcon` (filled circle + white cross) added to the shared icon set; `text-ink-300 hover:text-ink-400`, accent focus ring — quiet until needed.
4. **Click behavior**: `onMouseDown` prevents default (input keeps focus), click sets the query to `''` and keeps the dropdown armed; results reappear once ≥2 characters are typed, as today.

## Risks / Trade-offs

- [Two ✕s visible mid-edit in the comparison bar] → different glyph weight, placement, and the clear control's transience keep the roles readable; verified in the screenshot round.

## Migration Plan

Presentational/interaction-local; rollback = git revert.

## Open Questions

None.
