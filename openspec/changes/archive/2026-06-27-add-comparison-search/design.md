## Context

`SearchBox` is hardcoded to the primary slot: it calls `selectLocation(loc, 'primary')` and
owns its own query text. The store already supports a `comparison` slot
(`selectLocation`/`clearLocation`) and a `comparison` weather card already renders when that
slot is set. So this is purely a UI/wiring change in the search components.

## Goals / Non-Goals

**Goals:**
- Search by name for either location; add/remove the comparison from the search panel.
- Color-code the two bars to match the existing card bullets and map markers.
- Reuse existing store actions and the `useSearch` hook unchanged.

**Non-Goals:**
- No backend/API/model changes. No change to the Shift+click selection path (it keeps working;
  the second bar simply reflects whatever sets the comparison slot).

## Decisions

- **Generalize `SearchBox` to take `slot: Slot` and `accent: string`.** It reads its slot's
  location from the store, writes results to that slot via `selectLocation(loc, slot)`, and
  shows an accent dot (the same dot the weather card uses) at the left of the input.
- **New `SearchPanel` component** composes the bars:
  - Always renders the primary `SearchBox` (accent blue `#2563eb`).
  - Renders the comparison `SearchBox` (accent amber `#f59e0b`) **iff** `comparison !== null`,
    with a remove "×" that calls `clearLocation('comparison')`.
  - When `comparison === null`, renders a **"+"** button that adds the comparison; it is
    **disabled when `primary === null`** (nothing to copy). Clicking it calls
    `selectLocation({ ...primary }, 'comparison')`.
- **Input text reflects the selected location.** Each bar derives a display label from its
  slot's location (`name` ?? `"lat, lng"`) and syncs the input to it **when the input is not
  focused**, so external changes (the "+" copy, a Shift+click, a map click) show up without
  clobbering what the user is typing.
- **Initialization copy** uses the primary's `{ lat, lng, name }` so the comparison bar shows
  the same label and the second card opens on the same place.

## Risks / Trade-offs

- **Input/label sync vs. typing** → only sync on blur / when unfocused; never overwrite an
  actively-edited field. Mitigation: track a `focused` flag.
- **Adding comparison equal to primary** produces two identical cards momentarily — this is the
  intended initial state ("same as the one already selected"); the user then searches to change it.

## Open Questions

- None.
