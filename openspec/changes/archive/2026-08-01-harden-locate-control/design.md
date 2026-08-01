## Context

`LocateButton` drives a three-state machine (`idle` / `loading` / `error`) around a single
`navigator.geolocation.getCurrentPosition` call, and disables itself while `loading`. It
passes `timeout: 8000`, which reads like a guarantee that the call always settles — but the
Geolocation specification excludes the permission-prompt wait from that clock. A prompt left
unanswered, or dismissed in a way the browser does not surface as an error, therefore invokes
neither callback. The state machine has no other exit, and the disabled button removes the
retry path, so the control is stuck until the page reloads.

The same file also flashes its failure message for three seconds and then erases it, so a
failure that happens while the user is looking at the map leaves no trace.

Separately, the day row markup is duplicated between `LocationCard` (desktop, inside a fixed
`w-72` card) and `WeatherSheet` (mobile, full width). Its values column is an ordinary
wrapping span, so a wide day — sub-zero max and min plus a multi-digit precipitation figure —
breaks onto a second line in the desktop card while its neighbours stay on one, which is what
makes the list look broken rather than merely tight.

## Goals / Non-Goals

**Goals:**

- The resolving state is bounded by something the app controls, not by the browser's goodwill.
- A slow-but-eventually-granted permission still produces a location.
- Every failure leaves the control usable, and blocked permission is named as such.
- A day row never wraps, in either layout.

**Non-Goals:**

- Changing the on-load seeding path (`useInitialLocation`). Its silent fallback to the
  configured default is deliberate and specified; a watchdog there would only race the
  fallback it already has.
- Persisting or remembering a permission decision across visits.
- Prompting for permission on the user's behalf, or trying to reopen a blocked prompt —
  no API allows this, which is precisely why the blocked state has to be explained instead.

## Decisions

**A watchdog timer bounds the resolving state, rather than trusting `PositionOptions.timeout`.**
The browser's timeout is the natural mechanism and it is already set, but it provably does not
cover the failure being fixed. A `setTimeout` started alongside the request is the only thing
that can observe "the browser has told us nothing at all". The window should sit comfortably
above the 8s geolocation timeout so that a normally-failing request reports its real error
first, and the watchdog only speaks when the browser stays silent.

*Alternative considered:* shortening `PositionOptions.timeout`. Rejected — it changes nothing
in the stuck case, because that clock never starts.

**A late position is honoured rather than discarded.** Once the watchdog fires, the request is
abandoned as far as the UI is concerned, but its success callback may still arrive — commonly
when the user reads the permission prompt before granting it. Dropping that result would make
a deliberate grant appear to do nothing. Each request therefore carries an identity so the
callbacks can tell "my request" from "a request that was superseded"; a late success from a
watchdogged request still selects the location and clears the stale failure message, while a
late success from a request the user has already replaced with a newer one is ignored.

*Alternative considered:* a hard cancel flag that ignores everything post-watchdog. Simpler,
but it converts a slow success into a silent failure — the same class of bug being fixed.

**Blocked permission is detected through the Permissions API, treated as optional.**
`navigator.permissions.query({ name: 'geolocation' })` distinguishes "blocked, retrying is
pointless" from "failed, retrying is reasonable" — a distinction the Geolocation error code
alone cannot draw reliably, since a denial and a dismissal can surface identically. The API is
absent on older Safari, so its absence must degrade to today's behaviour (retryable, generic
message) rather than to a wrong claim that the permission is blocked. Where the browser
supports subscribing to permission-state changes, the control should follow them, so a user
who unblocks the permission in site settings sees the control recover without a reload.

**A blocked control stays actionable, and is never marked `aria-disabled`.** Found while
implementing: marking the blocked state as disabled tells assistive tech not to attempt the
control, while the design simultaneously relies on activating it to reveal the explanation —
a contradiction, and one strict enough that Playwright refuses to click such an element at
all. Only the resolving state is genuinely inert. Blocked is instead conveyed by a muted
appearance and an explicit accessible name, and activating it surfaces the reason. Re-entry
during a live request is guarded in code rather than by disabling the button, which is also
what keeps the control from ever becoming a dead end.

**The failure message persists until the user acts.** It clears when a new request starts or
when the user dismisses it. This makes the message a piece of state the user resolves, rather
than an animation they may or may not catch.

**The card sizes to its content within a bound, instead of the row shrinking to fit the card.**
The proposal's alternative — keeping the fixed width and making the values smaller or
truncated — hides data the user asked for. Letting the card grow keeps every figure legible;
the bound keeps it an overlay rather than a panel, which matters most in the comparison layout
where two cards sit side by side in the top-right corner. The row itself must also be told not
to wrap, since a growable container alone does not prevent wrapping inside it.

**Both layouts change together.** The day row exists twice by design; the desktop card is where
it visibly breaks, but leaving the mobile copy untouched would let the two drift apart, which
is the specific failure mode this codebase has to guard against.

## Risks / Trade-offs

- **The watchdog fires while a legitimate prompt is still open** → The late-success path is
  what makes this safe: the user still gets their location when they grant it, and the interim
  message is cleared rather than left contradicting the map. The window is chosen to be long
  enough that this is uncommon in the first place.
- **Permissions API state is stale or unsupported** → Every code path treats it as advisory.
  It can suppress a pointless retry and explain why, but it is never the thing that decides a
  request failed; an actual request result always wins.
- **A wider card crowds the map, especially with two cards side by side** → Bounded growth, and
  the card only grows when a day genuinely needs it, so the common case looks unchanged.
- **Two copies of the day row drift** → Mitigated only by changing them in the same commit and
  checking both layouts; extracting a shared row component is a larger refactor than this
  change should carry.
