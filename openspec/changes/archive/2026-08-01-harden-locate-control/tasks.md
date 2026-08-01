## 1. Bound the resolving state

- [x] 1.1 Give each locate request an identity in `LocateButton`, so a callback can tell whether
      it belongs to the request the UI is currently showing
- [x] 1.2 Start a watchdog timer alongside `getCurrentPosition`, set comfortably above the 8s
      `PositionOptions.timeout` so a normally-failing request reports its own error first
- [x] 1.3 On watchdog expiry, leave the loading state and report the failure, leaving the control
      clickable
- [x] 1.4 Stop disabling the button while resolving; instead ignore a second activation while a
      request is genuinely in flight, so the control can never be a dead end
- [x] 1.5 Clear the watchdog on success, on error, and on unmount

## 2. Honour a late fix

- [x] 2.1 Accept a success callback from a watchdogged request: select the location and clear any
      failure message left behind by that request
- [x] 2.2 Ignore a callback from a request the user has already superseded with a newer one
- [x] 2.3 Verify a late fix does not clobber a location the user selected in the meantime

## 3. Blocked permission

- [x] 3.1 Probe `navigator.permissions.query({ name: 'geolocation' })` where available, treating
      it as optional and advisory
- [x] 3.2 When the state is `denied`, present the control as blocked and explain that access must
      be re-enabled in the browser's site settings, rather than offering a retry
- [x] 3.3 Subscribe to permission-state changes where supported, so unblocking recovers the
      control without a reload
- [x] 3.4 Fall back to today's retryable, generic-message behaviour when the Permissions API is
      absent or the query rejects

## 4. Persistent failure message

- [x] 4.1 Drop the 3s auto-hide; keep the message until the user acts
- [x] 4.2 Clear it when a new request starts, and give the user a way to dismiss it
- [x] 4.3 Confirm the message is announced to assistive tech and anchors to the button in both
      layouts — it is positioned `absolute` today but the button is not a positioned ancestor,
      so check where it actually lands

## 5. Day rows keep to one line

- [x] 5.1 Stop the values column wrapping in the day row
- [x] 5.2 Let the desktop card size to its content between a sensible minimum and a bound, instead
      of the fixed `w-72`
- [x] 5.3 Apply the matching row change to the mobile sheet so the two layouts stay in sync
- [x] 5.4 Check the comparison layout, where two cards sit side by side in the top-right corner,
      at a narrow desktop window

## 6. Verify

- [x] 6.1 Reproduce the original hang — open the app, activate the control, leave the permission
      prompt unanswered — and confirm the control recovers on its own and can be retried
- [x] 6.2 Answer the prompt slowly, after the watchdog has fired, and confirm the location is
      still selected and the failure message clears
- [x] 6.3 Block location for the site and confirm the control explains it instead of failing
      silently; unblock it and confirm the control recovers
- [x] 6.4 Force a wide day (sub-zero max/min with a multi-digit precipitation figure) and confirm
      no row wraps in either layout
- [x] 6.5 Run `npm run lint` and `npm run build`
