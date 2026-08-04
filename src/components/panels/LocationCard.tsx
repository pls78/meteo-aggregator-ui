// Weather overlay card for one selected location: current conditions (from
// /hourly hour 0) and the daily forecast (from /forecast).

import { useForecast, useHourly } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { Slot, SelectedLocation } from '../../store/appStore'
import type { DailyValue } from '../../api/types'
import { weatherInfo } from '../../lib/weatherCode'
import { WeatherIcon } from '../weather/WeatherIcon'
import { ConfidenceTag } from '../confidence/ConfidenceTag'
import { SpreadStrip, spreadExtent } from './SpreadStrip'
import { XIcon } from '../icons'

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

// Skeleton mirroring the current-conditions block, so the card loads into its
// final layout instead of a bare "Loading…" line.
function CurrentSkeleton() {
  return (
    <div className="mb-4 flex items-center gap-3" aria-hidden>
      <span className="skeleton h-9 w-9" />
      <div className="space-y-1.5">
        <span className="skeleton block h-6 w-20" />
        <span className="skeleton block h-3 w-32" />
      </div>
    </div>
  )
}

export function LocationCard({ location, slot, accent }: Props) {
  const { clearLocation, selectedDay, selectedDayView, selectDay, showDayConfidence } = useAppStore()
  const forecast = useForecast(location)
  const hourly = useHourly(location)

  const now = hourly.data?.hours[0]?.values
  const title =
    location.name ?? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`

  // The card sizes to its widest day rather than wrapping one, bounded so it stays an
  // overlay on the map (and so two cards still fit side by side when comparing).
  return (
    <section className="panel w-max min-w-72 max-w-[22rem] rounded-xl p-4">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: accent }}
          />
          <h2 className="truncate text-sm font-semibold text-ink-900">{title}</h2>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => clearLocation(slot)}
          className="-m-1 grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/5 hover:text-ink-600 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <XIcon />
        </button>
      </header>

      {/* Current conditions */}
      {hourly.isError || forecast.isError ? (
        <p className="text-sm text-danger">Couldn’t load the forecast. Check your connection and try again.</p>
      ) : hourly.isLoading ? (
        <CurrentSkeleton />
      ) : now ? (
        <div className="mb-4 flex items-center gap-3">
          <WeatherIcon code={now.weather_code} className="h-9 w-9 text-ink-600" />
          <div>
            <div className="text-[1.75rem] font-semibold leading-8 tracking-tight text-ink-900 tabular-nums">
              {num(now.temperature_2m)}°C
            </div>
            <div className="text-xs text-ink-600">
              {weatherInfo(now.weather_code).label} · {num(now.relative_humidity_2m)}% RH
            </div>
          </div>
        </div>
      ) : null}

      {/* Daily forecast — tap a day to open its hours in the bottom sheet. */}
      {forecast.isLoading && !forecast.isError && (
        <div className="space-y-1.5" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="skeleton block h-6 w-full" />
          ))}
        </div>
      )}
      {forecast.data && (
        <div>
          {/* Column captions, set like a figure header over the day rows. */}
          <div className="mb-0.5 flex items-center gap-2 border-b border-ink-900/8 pb-1 text-[10px] font-medium uppercase tracking-wider text-ink-400">
            <div className="grid flex-1 grid-cols-[2.5rem_1.5rem_1fr_auto] items-center gap-2 px-1.5">
              <span>Day</span>
              <span />
              <span>High / low · rain</span>
              <span className="w-14 text-center">Spread</span>
            </div>
            <span className="w-12 shrink-0 pl-1.5">Conf</span>
          </div>
        <ul className="divide-y divide-ink-900/8">
          {/* One shared scale for the week, so strip width is comparable across rows. */}
          {forecast.data.days.map((day) => {
            const active = day.date === selectedDay
            const hourlyActive = active && selectedDayView === 'hourly'
            const confActive = active && selectedDayView === 'confidence'
            return (
              <li key={day.date} className="py-px">
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
                    className={`grid flex-1 cursor-pointer grid-cols-[2.5rem_1.5rem_1fr_auto] items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      hourlyActive
                        ? 'bg-accent/10 ring-1 ring-accent/40'
                        : 'hover:bg-ink-900/5'
                    }`}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">{WEEKDAY(day.date)}</span>
                    <WeatherIcon code={day.values.weather_code} className="h-[18px] w-[18px] text-ink-600" />
                    {/* Never wraps — the card widens instead (see the section above). */}
                    <span className="whitespace-nowrap text-ink-900">
                      <span className="font-medium tabular-nums">{num(day.values.temperature_2m_max)}°</span>
                      <span className="tabular-nums text-ink-400"> / {num(day.values.temperature_2m_min)}°</span>
                      {typeof day.values.precipitation_sum === 'number' &&
                        day.values.precipitation_sum > 0 && (
                          <span className="ml-1 text-precip">
                            {num(day.values.precipitation_sum, 1)}mm
                          </span>
                        )}
                    </span>
                    <SpreadStrip day={day} extent={spreadExtent(forecast.data.days)} />
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
        </div>
      )}
    </section>
  )
}
