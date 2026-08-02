## Context

The info page's `FEATURES` list in `src/components/about/aboutContent.ts` is six short cards,
each a title and one or two sentences. The first, "Point anywhere", covers choosing a location:
*"Click the map or search a town. On first load it starts at your location, or a configured
default."* That sentence describes the on-load seed and stops there, so the locate control —
which has existed since `add-locate-button` and gained real behaviour in
`harden-locate-control` — appears nowhere in the app's own documentation.

The rest of the file is figures transcribed from the backend (`config.py`, `aggregation.py`)
plus per-layer editorial copy; none of that is in scope here. This change is copy only.

## Goals / Non-Goals

**Goals:**

- A reader of the info page learns that they can return to their own position at any time.
- A reader whose browser has location blocked understands that the app is not broken, and
  where the fix actually lives.

**Non-Goals:**

- Any change to the locate control's behaviour — that shipped and is specified already.
- Restructuring the info page, adding a section, or growing the card count for its own sake.
- Documenting the watchdog, the late-fix rule, or anything else about *how* locating works.
  Those are implementation concerns; `CLAUDE.md` and `HANDOFF.md` carry them for developers.

## Decisions

**Extend the existing "Point anywhere" card rather than adding a seventh.** The card already
owns the question "how does the app decide where I'm looking?", and locating yourself is an
answer to exactly that. A separate card would split one idea across two places and dilute a
list whose value is its brevity. The constraint this puts on the copy is real: the card has to
stay two or three sentences, so the blocked case must be said in one.

*Alternative considered:* a dedicated "Find me" card. Rejected on the grounds above — the
feature is a refinement of location choice, not a peer of "Compare two places".

**State the remedy, not the diagnosis.** The useful sentence is where the user goes to fix it
(the browser's site settings), not an explanation of permission models. A user who blocked
location months ago does not need to be told what a permission is; they need to be told the app
cannot reopen that prompt and where the switch is.

**Keep the wording consistent with the control's own message.** `LocateButton` says *"Location
is blocked. Allow it for this site in your browser's settings."* The info page should not
invent a second vocabulary for the same state — a user who sees both should recognise them as
describing one thing. This is a wording constraint, deliberately not a shared constant: the two
serve different lengths and registers, and coupling them in code would over-engineer two
sentences.

## Risks / Trade-offs

- **The card grows long enough to unbalance the list** → Hold it to three sentences; if the
  blocked case cannot be said in one, that is a signal the copy is explaining too much.
- **The two messages drift apart over time** → They are near each other in review terms (one
  spec requirement now names the consistency), and the spec scenario states it explicitly, so a
  future edit to either has a reason to check the other.
