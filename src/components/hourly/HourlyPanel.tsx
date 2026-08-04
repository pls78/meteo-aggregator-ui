// The hourly detail sheet: slides up across the bottom of the map when a day is
// selected (via tapping a day in a location card). Shows that day's hours for the
// primary location, and — when a comparison location is also selected — overlays
// both on one chart for the same day, color-coded per location. Frontend-only;
// relies on the backend returning hourly timestamps in the location's local
// timezone so `date.slice(0,10)` groups hours under the tapped day.

import { useEffect, useState } from 'react'
import { useForecast, useHourlyRange } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { SelectedLocation } from '../../store/appStore'
import type { AggregatedHourlyForecast, DayConsensus } from '../../api/types'
import { HourlyChart, type ChartSeries } from './HourlyChart'
import { ConfidenceDetail } from '../confidence/ConfidenceDetail'
import { XIcon } from '../icons'
import { LOC_A, LOC_B } from '../../lib/accents'

const FADE_MS = 300

const labelOf = (l: SelectedLocation) =>
  l.name ?? `${l.lat.toFixed(3)}, ${l.lng.toFixed(3)}`

const prettyDay = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

// `floating` = the sheet is lifted off the bottom edge (above the animate control),
// so all corners round; otherwise it sits flush and only the top corners round.
export function HourlyPanel({ floating = false }: { floating?: boolean }) {
  const { selectedDay, selectedDayView, primary, comparison, clearDay } = useAppStore()
  const showConfidence = selectedDayView === 'confidence'
  // Only fetch the hourly week for the hourly view; confidence reuses the cached
  // daily forecast the location cards already loaded.
  const enabled = selectedDay !== null && !showConfidence

  // Enter/exit animation: `rendered` lags `selectedDay` so the sheet can fade out.
  const [rendered, setRendered] = useState<string | null>(selectedDay)
  const [visible, setVisible] = useState(false)

  const pWeek = useHourlyRange(primary, { enabled })
  const cWeek = useHourlyRange(comparison, { enabled })
  const pForecast = useForecast(primary)
  const cForecast = useForecast(comparison)

  useEffect(() => {
    if (selectedDay) {
      setRendered(selectedDay)
      const r = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(r)
    }
    setVisible(false)
    const t = setTimeout(() => setRendered(null), FADE_MS)
    return () => clearTimeout(t)
  }, [selectedDay])

  if (!rendered) return null

  const day = rendered
  const hoursFor = (data: AggregatedHourlyForecast | undefined) =>
    (data?.hours ?? []).filter((h) => String(h.date).slice(0, 10) === day)

  const series: ChartSeries[] = []
  if (primary) series.push({ name: labelOf(primary), accent: LOC_A, hours: hoursFor(pWeek.data) })
  if (comparison) series.push({ name: labelOf(comparison), accent: LOC_B, hours: hoursFor(cWeek.data) })

  const present = [primary && pWeek, comparison && cWeek].filter(Boolean) as ReturnType<typeof useHourlyRange>[]
  const isLoading = present.some((q) => q.isLoading)
  const isError = present.some((q) => q.isError)
  const hasHours = series.some((s) => s.hours.length > 0)

  // Confidence detail is per-location (unlike the shared-day hourly chart), so
  // show one panel per present location, side by side when comparing.
  const confidencePanels: ConfidencePanel[] = []
  if (primary) confidencePanels.push({ name: labelOf(primary), accent: LOC_A, q: pForecast })
  if (comparison) confidencePanels.push({ name: labelOf(comparison), accent: LOC_B, q: cForecast })

  return (
    <div
      className={`mx-auto transition-[opacity,transform] duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${showConfidence ? 'w-fit max-w-full' : 'max-w-5xl'}`}
    >
      <section className={`panel p-4 ${floating ? 'rounded-2xl' : 'rounded-t-2xl'}`}>
        <header className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-ink-900">{prettyDay(day)}</h2>
            <span className="text-xs text-ink-400">{showConfidence ? 'confidence' : 'hourly'}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Legend — required for two series; carries identity beside the colored marks. */}
            {!showConfidence && series.length > 1 && (
              <ul className="flex items-center gap-3">
                {series.map((s) => (
                  <li key={s.name} className="flex items-center gap-1.5 text-xs text-ink-600">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.accent }} />
                    <span className="max-w-[8rem] truncate">{s.name}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              aria-label="Close hourly view"
              onClick={clearDay}
              className="-m-1 grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/5 hover:text-ink-600 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <XIcon />
            </button>
          </div>
        </header>

        {showConfidence ? (
          <ConfidenceView day={day} panels={confidencePanels} />
        ) : isError ? (
          <p className="py-6 text-center text-sm text-danger">
            Couldn’t load hourly data. Check your connection and try again.
          </p>
        ) : isLoading ? (
          <div className="space-y-2 py-4" aria-hidden>
            <span className="skeleton block h-28 w-full" />
            <span className="skeleton block h-10 w-full" />
          </div>
        ) : !hasHours ? (
          <p className="py-6 text-center text-sm text-ink-600">No hourly data for this day.</p>
        ) : (
          <div className="overflow-x-auto">
            <HourlyChart series={series} />
          </div>
        )}
      </section>
    </div>
  )
}

interface ConfidencePanel {
  name: string
  accent: string
  q: ReturnType<typeof useForecast>
}

// The confidence body: one column per location, each showing that location's
// per-model temps + explanation for the selected day.
function ConfidenceView({ day, panels }: { day: string; panels: ConfidencePanel[] }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      {panels.map(({ name, accent, q }) => {
        const dayData: DayConsensus | undefined = q.data?.days.find((d) => d.date === day)
        return (
          <div key={name}>
            {panels.length > 1 && (
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
                <span className="max-w-[10rem] truncate">{name}</span>
              </div>
            )}
            {q.isError ? (
              <p className="py-4 text-sm text-danger">Couldn’t load the forecast. Check your connection and try again.</p>
            ) : dayData ? (
              <ConfidenceDetail day={dayData} />
            ) : (
              <span className="skeleton block h-24 w-56" aria-hidden />
            )}
          </div>
        )
      })}
    </div>
  )
}
