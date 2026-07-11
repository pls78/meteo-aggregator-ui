## 1. Default-location config

- [x] 1.1 Create `src/lib/config.ts` exporting a typed `DEFAULT_LOCATION` (`{ lat: number; lng: number; name: string }`, assignable to `SelectedLocation`) with sensible coordinates and display name.

## 2. Initial-location logic

- [x] 2.1 Add a `useInitialLocation()` hook (e.g. `src/hooks/useInitialLocation.ts`) that runs once on mount, guarded by a `useRef` latch so it never seeds twice (covers StrictMode double-invoke).
- [x] 2.2 In the hook, if `primary` is already set, do nothing; otherwise call `navigator.geolocation.getCurrentPosition(success, error, { timeout, maximumAge })`.
- [x] 2.3 On success, set `primary` to the returned coordinate (only if `primary` is still `null`) and `focusOn` it.
- [x] 2.4 Route missing `navigator.geolocation`, permission denial, error, and timeout to one `applyDefault()` path that selects `DEFAULT_LOCATION` as `primary` (only if still `null`) and `focusOn`s it — silently, with no prompt or error UI.

## 3. Wire into the app

- [x] 3.1 Invoke `useInitialLocation()` once from `App.tsx` (inside `AppStoreProvider`) so it runs for both desktop and mobile layouts.

## 4. Verify

- [x] 4.1 `npm run build` (tsc + vite) passes.
- [ ] 4.2 Manually verify: on load with geolocation allowed the map centers on the current position; with geolocation blocked/denied it silently centers on `DEFAULT_LOCATION`; a click before geolocation resolves is not overridden.
