// Lays out the selected location card(s): single card for the primary location,
// or both primary and comparison side by side when two are selected. Each card
// fades/slides in once its data is ready, fades out + back in when the location
// changes, and fades out when cleared.

import { useEffect, useState } from 'react'
import { useForecast, useHourly } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { SelectedLocation, Slot } from '../../store/appStore'
import { LocationCard } from '../panels/LocationCard'
import { LOC_A, LOC_B } from '../../lib/accents'

const FADE_MS = 300

const idOf = (l: SelectedLocation | null) => (l ? `${l.lat},${l.lng}` : null)

// Wraps a card so it animates on enter/exit. `rendered` is the location actually
// shown; it lags `location` so the outgoing card can finish fading before the
// incoming one is adopted. The enter fade is held until data has settled so the
// transition runs on final, non-reflowing content.
function FadingCard({
  location,
  slot,
  accent,
}: {
  location: SelectedLocation | null
  slot: Slot
  accent: string
}) {
  const [rendered, setRendered] = useState<SelectedLocation | null>(location)
  const [visible, setVisible] = useState(false)

  const forecast = useForecast(location)
  const hourly = useHourly(location)
  // "Settled" = succeeded or failed; either way the card content is final.
  const dataReady =
    (forecast.isSuccess || forecast.isError) && (hourly.isSuccess || hourly.isError)

  const locId = idOf(location)
  const renderedId = idOf(rendered)

  // Enter/exit/swap: drive `rendered` and the fade-out (independent of loading).
  useEffect(() => {
    if (!location) {
      setVisible(false)
      const t = setTimeout(() => setRendered(null), FADE_MS)
      return () => clearTimeout(t)
    }
    if (renderedId !== locId) {
      if (renderedId !== null) {
        // A different card is showing: fade it out, then adopt the new location.
        setVisible(false)
        const t = setTimeout(() => setRendered(location), FADE_MS)
        return () => clearTimeout(t)
      }
      setRendered(location) // nothing shown yet: adopt immediately (hidden)
    }
  }, [locId, renderedId, location])

  // Fade in once the adopted location's data is ready.
  useEffect(() => {
    if (location && renderedId === locId && dataReady) {
      const r = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(r)
    }
  }, [locId, renderedId, dataReady, location])

  if (!rendered) return null

  return (
    <div
      // shrink-0: a card sizes itself to its widest day, so it must not be squeezed back
      // into wrapping when two are shown side by side.
      className={`shrink-0 transition-[opacity,transform] duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      <LocationCard location={rendered} slot={slot} accent={accent} />
    </div>
  )
}

export function ComparisonPanel() {
  const { primary, comparison } = useAppStore()

  return (
    <div className="pointer-events-auto flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] gap-3 overflow-auto">
      <FadingCard location={primary} slot="primary" accent={LOC_A} />
      <FadingCard location={comparison} slot="comparison" accent={LOC_B} />
    </div>
  )
}
