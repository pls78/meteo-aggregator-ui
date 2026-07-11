// On load, seed the primary location so a first-time visitor sees weather right away:
// try the browser's current position, and silently fall back to DEFAULT_LOCATION when
// geolocation is unsupported, denied, errored, or timed out. Runs once per mount; never
// overrides a location the user has already selected. No persistence — re-runs every visit.

import { useEffect, useRef } from 'react'
import { useAppStore, type SelectedLocation } from '../store/appStore'
import { DEFAULT_LOCATION } from '../lib/config'

const GEO_OPTIONS: PositionOptions = {
  timeout: 8000, // fall back promptly if the sensor is slow or blocked
  maximumAge: 5 * 60 * 1000, // accept a recent cached fix
}

export function useInitialLocation(): void {
  const { primary, selectLocation, focusOn } = useAppStore()

  // Latest primary, read at async-callback time so a fix that resolves after the user
  // has already clicked doesn't clobber their choice.
  const primaryRef = useRef(primary)
  primaryRef.current = primary

  // Seed at most once per mount (also guards StrictMode's double-invoke in dev).
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    // Already have a location (e.g. fast user interaction) — nothing to seed.
    if (primaryRef.current) return

    const seed = (loc: SelectedLocation) => {
      if (primaryRef.current) return // user picked one while we were resolving
      selectLocation(loc, 'primary')
      focusOn(loc)
    }

    const applyDefault = () => seed(DEFAULT_LOCATION)

    if (!navigator.geolocation) {
      applyDefault()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => seed({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      applyDefault, // denied, unavailable, or timed out — silent fallback
      GEO_OPTIONS,
    )
  }, [selectLocation, focusOn])
}
