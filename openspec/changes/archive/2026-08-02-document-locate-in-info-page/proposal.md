## Why

The in-app "how it works" page is where a visitor goes to learn what the app can do, and it
does not mention the locate control at all. Its "Point anywhere" card describes only how a
location is seeded on load, so the one control that answers "put me back where I am" is
undocumented. `harden-locate-control` also gave that control a behaviour worth stating rather
than leaving a user to discover: if the browser has location access blocked, the app says so
and points at site settings, because no amount of retrying can reopen a blocked prompt. A user
who has blocked location — often long ago, on a different site visit — otherwise reads a dead
button as a broken app.

## What Changes

- The info page's feature list covers locating yourself on demand, not just the on-load seed.
- It states what happens when the browser has location access blocked, and that the remedy
  lives in the browser's own site settings rather than anywhere in the app.
- No change to the locate control itself, to the aggregation content, or to the layer list.

No breaking changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `info-page`: the "Documented content" requirement gains coverage of the locate control and
  of the blocked-permission case, so the documented feature set matches what the app does.

## Impact

- `src/components/about/aboutContent.ts` — the `FEATURES` list (static copy only; the figures
  transcribed from the backend config are untouched).
- No code, API, or dependency changes. The wording must stay consistent with the message
  `src/components/locate/LocateButton.tsx` shows for the same situation.
