// The hourly detail sheet: slides up across the bottom of the map when a day is
// selected (via tapping a day in a location card). Shows that day's hours for the
// primary location, and — when a comparison location is also selected — overlays
// both on one chart for the same day, color-coded per location. Frontend-only;
// relies on the backend returning hourly timestamps in the location's local
// timezone so `date.slice(0,10)` groups hours under the tapped day.

import { useEffect, useState } from 'react'
import { useHourlyRange } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { SelectedLocation } from '../../store/appStore'
import type { AggregatedHourlyForecast } from '../../api/types'
import { HourlyChart, type ChartSeries } from './HourlyChart'

const PRIMARY_ACCENT = '#2563eb'
const COMPARISON_ACCENT = '#f59e0b'
const FADE_MS = 300

const labelOf = (l: SelectedLocation) =>
  l.name ?? `${l.lat.toFixed(3)}, ${l.lng.toFixed(3)}`

const prettyDay = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })

export function HourlyPanel() {
  const { selectedDay, primary, comparison, clearDay } = useAppStore()
  const enabled = selectedDay !== null

  // Enter/exit animation: `rendered` lags `selectedDay` so the sheet can fade out.
  const [rendered, setRendered] = useState<string | null>(selectedDay)
  const [visible, setVisible] = useState(false)

  const pWeek = useHourlyRange(primary, { enabled })
  const cWeek = useHourlyRange(comparison, { enabled })

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
  if (primary) series.push({ name: labelOf(primary), accent: PRIMARY_ACCENT, hours: hoursFor(pWeek.data) })
  if (comparison) series.push({ name: labelOf(comparison), accent: COMPARISON_ACCENT, hours: hoursFor(cWeek.data) })

  const present = [primary && pWeek, comparison && cWeek].filter(Boolean) as ReturnType<typeof useHourlyRange>[]
  const isLoading = present.some((q) => q.isLoading)
  const isError = present.some((q) => q.isError)
  const hasHours = series.some((s) => s.hours.length > 0)

  return (
    <div
      className={`mx-auto max-w-5xl transition-[opacity,transform] duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <section className="rounded-t-2xl bg-white/97 p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur">
        <header className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-slate-900">{prettyDay(day)}</h2>
            <span className="text-xs text-slate-400">hourly</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Legend — required for two series; carries identity beside the colored marks. */}
            {series.length > 1 && (
              <ul className="flex items-center gap-3">
                {series.map((s) => (
                  <li key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600">
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
              className="cursor-pointer text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </header>

        {isError ? (
          <p className="py-6 text-center text-sm text-rose-600">
            Couldn’t load hourly data. Is the backend running?
          </p>
        ) : isLoading ? (
          <p className="py-6 text-center text-sm text-slate-500">Loading hourly forecast…</p>
        ) : !hasHours ? (
          <p className="py-6 text-center text-sm text-slate-500">No hourly data for this day.</p>
        ) : (
          <div className="overflow-x-auto">
            <HourlyChart series={series} />
          </div>
        )}
      </section>
    </div>
  )
}
