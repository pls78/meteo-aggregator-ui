// Weather overlay card for one selected location: current conditions (from
// /hourly hour 0) and the daily forecast (from /forecast).

import { useForecast, useHourly } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { Slot, SelectedLocation } from '../../store/appStore'
import type { DailyValue } from '../../api/types'
import { weatherInfo } from '../../lib/weatherCode'
import { ConfidenceTag } from '../confidence/ConfidenceTag'

function num(v: DailyValue, digits = 0): string {
  return typeof v === 'number' ? v.toFixed(digits) : '–'
}

const WEEKDAY = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short' })

interface Props {
  location: SelectedLocation
  slot: Slot
  /** Accent color dot matching the map marker. */
  accent: string
}

export function LocationCard({ location, slot, accent }: Props) {
  const { clearLocation, selectedDay, selectedDayView, selectDay, showDayConfidence } = useAppStore()
  const forecast = useForecast(location)
  const hourly = useHourly(location)

  const now = hourly.data?.hours[0]?.values
  const title =
    location.name ?? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`

  return (
    <section className="w-72 rounded-xl bg-white/95 p-4 shadow-xl ring-1 ring-black/5">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: accent }}
          />
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => clearLocation(slot)}
          className="cursor-pointer text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>
      </header>

      {/* Current conditions */}
      {hourly.isError || forecast.isError ? (
        <p className="text-sm text-rose-600">Couldn’t load weather. Is the backend running?</p>
      ) : hourly.isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : now ? (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl">{weatherInfo(now.weather_code).icon}</span>
          <div>
            <div className="text-2xl font-semibold text-slate-900">
              {num(now.temperature_2m)}°C
            </div>
            <div className="text-xs text-slate-500">
              {weatherInfo(now.weather_code).label} · {num(now.relative_humidity_2m)}% RH
            </div>
          </div>
        </div>
      ) : null}

      {/* Daily forecast — tap a day to open its hours in the bottom sheet. */}
      {forecast.data && (
        <ul className="space-y-0.5">
          {forecast.data.days.map((day) => {
            const active = day.date === selectedDay
            const hourlyActive = active && selectedDayView === 'hourly'
            const confActive = active && selectedDayView === 'confidence'
            return (
              <li key={day.date}>
                {/* Two targets per row, each highlighting only when it's the open
                    view: the day area opens hourly, the confidence tag opens the
                    confidence detail. (A nested button is invalid HTML, so this is
                    a flex container rather than one button.) */}
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => selectDay(day.date)}
                    aria-pressed={hourlyActive}
                    title="Show hourly forecast for this day"
                    className={`grid flex-1 cursor-pointer grid-cols-[2.5rem_1.5rem_1fr] items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-slate-100 ${
                      hourlyActive ? 'bg-slate-100 ring-1 ring-slate-300' : ''
                    }`}
                  >
                    <span className="text-slate-500">{WEEKDAY(day.date)}</span>
                    <span>{weatherInfo(day.values.weather_code).icon}</span>
                    <span className="text-slate-800">
                      <span className="font-medium">{num(day.values.temperature_2m_max)}°</span>
                      <span className="text-slate-400"> / {num(day.values.temperature_2m_min)}°</span>
                      {typeof day.values.precipitation_sum === 'number' &&
                        day.values.precipitation_sum > 0 && (
                          <span className="ml-1 text-blue-500">
                            {num(day.values.precipitation_sum, 1)}mm
                          </span>
                        )}
                    </span>
                  </button>
                  <ConfidenceTag
                    level={day.confidence.level}
                    active={confActive}
                    onClick={() => showDayConfidence(day.date)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
