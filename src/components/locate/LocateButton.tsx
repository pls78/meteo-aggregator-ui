// "Use my location" control: on click, requests the browser's current position and selects it
// into the active slot (primary on desktop; the A/B target on mobile), recentering the map.
// Shows a spinner while resolving and a brief inline message if geolocation is denied or fails.
// Placement is the caller's job via `className`; both layouts reuse this trigger.

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/appStore'

const GEO_OPTIONS: PositionOptions = { timeout: 8000, maximumAge: 60000 }

type Status = 'idle' | 'loading' | 'error'

export function LocateButton({ className = '' }: { className?: string }) {
  const { activeSlot, selectLocation, focusOn } = useAppStore()
  const [status, setStatus] = useState<Status>('idle')
  const errorTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(errorTimer.current), [])

  function flashError() {
    setStatus('error')
    window.clearTimeout(errorTimer.current)
    errorTimer.current = window.setTimeout(() => setStatus('idle'), 3000)
  }

  function locate() {
    if (status === 'loading') return
    if (!navigator.geolocation) {
      flashError()
      return
    }
    window.clearTimeout(errorTimer.current)
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('idle')
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        selectLocation(loc, activeSlot)
        focusOn(loc)
      },
      flashError, // denied, unavailable, or timed out
      GEO_OPTIONS,
    )
  }

  return (
    <button
      type="button"
      aria-label="Use my location"
      title="Use my location"
      onClick={locate}
      disabled={status === 'loading'}
      className={`relative grid place-items-center rounded-full bg-white/95 text-slate-600 shadow-xl ring-1 ring-black/5 hover:text-slate-900 ${className}`}
    >
      {status === 'loading' ? (
        <svg className="h-5 w-5 animate-spin text-slate-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
        </svg>
      )}
      {status === 'error' && (
        <span
          role="status"
          className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
        >
          Couldn’t get your location
        </span>
      )}
    </button>
  )
}
