# Clear button in the location search fields

## Why

Clearing a search field currently means deleting the previous place name character by character before typing a new one — needless friction on the most-used control, especially on mobile.

## What Changes

- A clear control (the native-search-style filled-circle ✕) appears at the end of a location search field while it contains text and is being edited; clicking it empties the field, keeps focus, and leaves the selected location untouched.
- It is visually and behaviorally distinct from the comparison bar's existing remove control (plain ✕, removes location B): the clear control only appears during editing.
- One component (`SearchBox`) serves both layouts, so desktop and mobile get it together.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `location-search`: adds a requirement for clearing the search text without affecting the selected location.

## Impact

- `src/components/search/SearchBox.tsx` only (plus a shared glyph in `components/icons.tsx`). No store, hook, or API changes.
