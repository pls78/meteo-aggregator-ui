# Redesign the About dialog as an instrument datasheet

## Why

The About dialog is the last surface speaking iteration-1's grammar (retokened only): a same-size feature-card grid and a stock shadow, recorded in DESIGN.md as a grandfathered deviation. The user approved re-deriving it in the meteogram world; the surface seed (key 3ead242d, mode read) assigned the datasheet structure, user-accepted.

## What Changes

- The dialog recomposes as the instrument's datasheet: hairline-ruled sections with tracked-caps titles; the features grid becomes a ruled definition table; confidence levels become a threshold table; satellite layers become channel rows; sources become spec rows. Worked examples stay as plain-prose application notes.
- All content, factual figures, and behavior (open/close/Escape/backdrop, focus, the API-derived layer list) are unchanged; the panel adopts the shared material.
- Retires the "grandfathered About" deviation in DESIGN.md.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `visual-design`: adds a requirement that every surface — dense reading surfaces included — composes from the current visual world's vocabulary; no surface retains a prior world's composition.

## Impact

- `src/components/about/AboutDialog.tsx` (recomposed); `aboutContent.ts` untouched (content is the contract). DESIGN.md deviation entry updated at finish.
