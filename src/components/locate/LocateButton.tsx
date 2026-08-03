// "Use my location" control: on click, requests the browser's current position and selects it
// into the active slot (primary on desktop; the A/B target on mobile), recentering the map.
// Shows a spinner while resolving and an inline message, which stays until acted on, if
// geolocation is denied or fails. Placement is the caller's job via `className`; both layouts
// reuse this trigger.
//
// The control is deliberately defensive about the Geolocation API: `PositionOptions.timeout`
// does NOT cover the time the permission prompt is on screen, so a prompt left unanswered
// invokes neither callback and would otherwise leave the spinner running forever. A watchdog
// bounds the wait, and a fix that arrives after it is still honoured.

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { XIcon } from '../icons'

const GEO_OPTIONS: PositionOptions = { timeout: 8000, maximumAge: 60000 }

// Comfortably above GEO_OPTIONS.timeout, so a request that fails normally reports its own
// error and the watchdog only speaks when the browser stays silent altogether.
const WATCHDOG_MS = 15000

const FAILED_MSG = 'Couldn’t get your location'
const BLOCKED_MSG = 'Location is blocked. Allow it for this site in your browser’s settings.'

type Status = 'idle' | 'loading'

export function LocateButton({ className = '' }: { className?: string }) {
  const { activeSlot, selectLocation, focusOn } = useAppStore()
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)
  // Advisory only: null when the browser can't tell us (older Safari), in which case the
  // control behaves exactly as it does for any other failure — available and retryable.
  const [permission, setPermission] = useState<PermissionState | null>(null)

  // Identifies the request the UI is currently showing. Only a NEW request advances it, so a
  // fix that lands after the watchdog gave up still belongs to the current request and is
  // honoured; a fix from a request the user has already replaced is ignored.
  const reqId = useRef(0)
  const watchdog = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(watchdog.current), [])

  // Follow the permission state where the browser exposes it, so unblocking in site settings
  // recovers the control without a reload.
  useEffect(() => {
    let live = true
    let subscription: PermissionStatus | null = null
    navigator.permissions
      ?.query({ name: 'geolocation' as PermissionName })
      .then((s) => {
        if (!live) return
        subscription = s
        setPermission(s.state)
        s.onchange = () => setPermission(s.state)
      })
      .catch(() => {
        /* unsupported or rejected — stay advisory-null */
      })
    return () => {
      live = false
      if (subscription) subscription.onchange = null
    }
  }, [])

  const blocked = permission === 'denied'

  function settle(id: number) {
    if (id !== reqId.current) return false // superseded by a newer request
    window.clearTimeout(watchdog.current)
    setStatus('idle')
    return true
  }

  function locate() {
    if (blocked) {
      // Activating could not produce a prompt or a position — explain instead of pretending.
      setMessage(BLOCKED_MSG)
      return
    }
    if (status === 'loading') return
    setMessage(null)

    if (!navigator.geolocation) {
      setMessage(FAILED_MSG)
      return
    }

    const id = ++reqId.current
    setStatus('loading')

    window.clearTimeout(watchdog.current)
    watchdog.current = window.setTimeout(() => {
      // The browser has told us nothing at all. Stop showing a spinner and let the user retry,
      // but leave reqId alone so a late fix for this request is still accepted below.
      if (id !== reqId.current) return
      setStatus('idle')
      setMessage(FAILED_MSG)
    }, WATCHDOG_MS)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!settle(id)) return
        setMessage(null) // clears a watchdog message this same request left behind
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        selectLocation(loc, activeSlot)
        focusOn(loc)
      },
      (err) => {
        if (!settle(id)) return
        setMessage(err.code === err.PERMISSION_DENIED ? BLOCKED_MSG : FAILED_MSG)
      },
      GEO_OPTIONS,
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label={blocked ? 'Location access is blocked — why?' : 'Use my location'}
        title={blocked ? BLOCKED_MSG : 'Use my location'}
        onClick={locate}
        // Not `disabled`, and not `aria-disabled` when blocked: activating it still does
        // something useful (it explains why locating is unavailable), so marking it
        // unactionable would tell assistive tech not to try. Only the resolving state is
        // genuinely inert, and re-entry is guarded in locate().
        aria-disabled={status === 'loading'}
        className={`panel grid h-full w-full place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
          blocked ? 'text-ink-300' : 'text-ink-600 hover:text-ink-900'
        }`}
      >
        {status === 'loading' ? (
          <svg className="h-5 w-5 animate-spin text-ink-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
          </svg>
        )}
      </button>

      {/* Anchored to the button (this wrapper is the positioned ancestor) and kept until the
          user retries or dismisses it — a brief flash is too easy to miss. */}
      {message && (
        <div
          role="status"
          className="absolute right-full top-1/2 mr-2 flex w-max max-w-[16rem] -translate-y-1/2 items-start gap-2 rounded-lg bg-ink-900 px-2.5 py-1.5 text-left text-xs font-medium text-white shadow-control"
        >
          <span>{message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setMessage(null)}
            className="shrink-0 cursor-pointer text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
