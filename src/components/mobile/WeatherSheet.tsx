// Mobile weather: one draggable bottom sheet with three snap heights (peek/half/
// full). Peek shows current conditions; half adds the daily list; full adds the
// hourly chart for the tapped day. Two locations ride an A/B tab (the hourly chart
// still overlays both). Content scrolls inside the sheet so the map never pans.

import { useEffect, useRef, useState } from 'react'
import { useForecast, useHourly, useHourlyRange } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { SelectedLocation, Slot } from '../../store/appStore'
import type { AggregatedHourlyForecast, DailyValue } from '../../api/types'
import { WeatherIcon } from '../weather/WeatherIcon'
import { HourlyChart, type ChartSeries } from '../hourly/HourlyChart'
import { ConfidenceDetail } from '../confidence/ConfidenceDetail'
import { ConfidenceTag } from '../confidence/ConfidenceTag'
import { SpreadStrip, spreadExtent } from '../panels/SpreadStrip'
import { LOC_A, LOC_B } from '../../lib/accents'
type Snap = 'peek' | 'half' | 'full'
const PEEK_PX = 96

const num = (v: DailyValue, d = 0) => (typeof v === 'number' ? v.toFixed(d) : '–')
const label = (l: SelectedLocation) => l.name ?? `${l.lat.toFixed(3)}, ${l.lng.toFixed(3)}`
const WEEKDAY = (iso: string) => new Date(iso).toLocaleDateString(undefined, { weekday: 'short' })
const prettyDay = (iso: string) =>
  new Date(`${iso}T00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })

function snapPx(s: Snap, vh: number) {
  return s === 'peek' ? PEEK_PX : s === 'half' ? vh * 0.46 : vh * 0.88
}
function nearestSnap(px: number, vh: number): Snap {
  const opts: Snap[] = ['peek', 'half', 'full']
  return opts.reduce(
    (best, s) => (Math.abs(snapPx(s, vh) - px) < Math.abs(snapPx(best, vh) - px) ? s : best),
    'half',
  )
}

// One location's current conditions (dot + name + temp + icon), compact enough to
// sit two-up in the peek header when comparing.
function CurrentBlock({
  loc,
  accent,
  q,
}: {
  loc: SelectedLocation | null
  accent: string
  q: ReturnType<typeof useHourly>
}) {
  if (!loc) return null
  const now = q.data?.hours[0]?.values
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: accent }} />
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-ink-600">{label(loc)}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-ink-900">
            {now ? `${num(now.temperature_2m)}°` : q.isError ? '—' : '…'}
          </span>
          {now && <WeatherIcon code={now.weather_code} className="h-6 w-6 text-ink-600" />}
        </div>
      </div>
    </div>
  )
}

export function WeatherSheet() {
  const { primary, comparison, selectedDay, selectedDayView, selectDay, showDayConfidence } = useAppStore()
  const showConfidence = selectedDayView === 'confidence'
  const [tab, setTab] = useState<Slot>('primary')
  const [snap, setSnap] = useState<Snap>('half')
  const [dragH, setDragH] = useState<number | null>(null)
  // Viewport height as state: the sheet's fixed layout height and its translate
  // both derive from it, so orientation changes must re-render.
  const [vh, setVh] = useState(() => window.innerHeight)
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const drag = useRef<{ startY: number; startH: number; moved: boolean } | null>(null)
  // The day-detail section and the sheet's internal scroll container, so opening
  // a day can bring the detail into view (at the half snap it often sits below
  // the fold, and the tap would look inert). Scrolled via the container only —
  // scrollIntoView would also scroll the overflow-hidden app root and shift the
  // whole viewport.
  const detailRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!selectedDay) return
    const el = detailRef.current
    const c = scrollRef.current
    if (!el || !c) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const delta = el.getBoundingClientRect().top - c.getBoundingClientRect().top
    c.scrollTo({ top: c.scrollTop + delta - 4, behavior: reduce ? 'auto' : 'smooth' })
  }, [selectedDay, selectedDayView])

  // A cleared comparison falls back to the primary tab.
  useEffect(() => {
    if (!comparison) setTab('primary')
  }, [comparison])

  const shown = tab === 'comparison' ? comparison : primary
  const forecast = useForecast(shown)
  // Current conditions for both slots so the peek header can show them side by side.
  const pHourly = useHourly(primary)
  const cHourly = useHourly(comparison)

  // The hourly week is only needed for the hourly view; the confidence detail
  // reuses the daily `forecast` already loaded above.
  const dayOpen = selectedDay !== null && !showConfidence
  const pWeek = useHourlyRange(primary, { enabled: dayOpen })
  const cWeek = useHourlyRange(comparison, { enabled: dayOpen })
  const shownDay = forecast.data?.days.find((d) => d.date === selectedDay)

  if (!primary && !comparison) return null

  // Fixed-height sheet pushed down by translateY: only transform ever animates
  // (never a layout property). Dragging tracks the pointer 1:1 with no
  // transition; the settle-to-snap animates, except under reduced motion. The
  // internal scroll container compensates for the off-screen portion with
  // bottom padding so every row stays reachable at every snap.
  const maxH = Math.round(vh * 0.92)
  const visible = Math.min(dragH ?? snapPx(snap, vh), maxH)
  const down = Math.max(0, maxH - visible)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onDown(e: React.PointerEvent) {
    drag.current = { startY: e.clientY, startH: snapPx(snap, vh), moved: false }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return
    const d = drag.current
    const h = Math.max(70, Math.min(maxH, d.startH + (d.startY - e.clientY)))
    if (Math.abs(e.clientY - d.startY) > 4) d.moved = true
    setDragH(h)
  }
  function onUp() {
    const d = drag.current
    if (!d) return
    if (!d.moved) setSnap((s) => (s === 'peek' ? 'half' : s === 'half' ? 'full' : 'peek'))
    else setSnap(nearestSnap(dragH ?? snapPx(snap, vh), vh))
    setDragH(null)
    drag.current = null
  }

  const dayHours = (data: AggregatedHourlyForecast | undefined) =>
    (data?.hours ?? []).filter((h) => String(h.date).slice(0, 10) === selectedDay)
  const series: ChartSeries[] = []
  if (primary) series.push({ name: label(primary), accent: LOC_A, hours: dayHours(pWeek.data) })
  if (comparison) series.push({ name: label(comparison), accent: LOC_B, hours: dayHours(cWeek.data) })
  const hasHours = series.some((s) => s.hours.length > 0)

  return (
    <section
      className="panel pointer-events-auto absolute inset-x-0 bottom-0 z-[1000] flex flex-col overflow-hidden rounded-t-2xl"
      style={{
        height: `${maxH}px`,
        transform: `translateY(${down}px)`,
        transition:
          dragH != null || reduceMotion ? 'none' : 'transform 0.3s cubic-bezier(0.2,0.8,0.2,1)',
        touchAction: 'none',
      }}
    >
      {/* Grip: tap cycles peek/half/full, drag snaps to nearest. */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="flex shrink-0 cursor-grab justify-center py-2.5"
      >
        <span className="h-1.5 w-10 rounded-full bg-ink-300" />
      </div>

      {/* Current conditions (visible even at peek). Both locations side by side
          when comparing, so the header isn't stuck on the primary only. */}
      <div className="flex shrink-0 items-center gap-3 px-4 pb-2">
        <CurrentBlock loc={primary} accent={LOC_A} q={pHourly} />
        {comparison && (
          <>
            <div className="h-9 w-px shrink-0 bg-ink-900/10" />
            <CurrentBlock loc={comparison} accent={LOC_B} q={cHourly} />
          </>
        )}
      </div>

      {/* Scrollable detail (hidden visually at peek by the sheet height) */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4"
        style={{ touchAction: 'pan-y', paddingBottom: down + 24 }}
      >
        {comparison && (
          <div className="mb-3 flex gap-2">
            {(['primary', 'comparison'] as Slot[]).map((s) => {
              const loc = s === 'comparison' ? comparison : primary
              const on = tab === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTab(s)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    on ? 'bg-accent/10 text-ink-900 ring-1 ring-accent/40' : 'text-ink-600 ring-1 ring-ink-900/10'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: s === 'comparison' ? LOC_B : LOC_A }} />
                  <span className="max-w-[7rem] truncate">{loc ? label(loc) : s}</span>
                </button>
              )
            })}
          </div>
        )}

        {forecast.isError ? (
          <p className="py-4 text-sm text-danger">Couldn’t load the forecast. Check your connection and try again.</p>
        ) : (
          <>
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
            {forecast.data?.days.map((day) => {
              const active = day.date === selectedDay
              const hourlyActive = active && selectedDayView === 'hourly'
              const confActive = active && selectedDayView === 'confidence'
              return (
                <li key={day.date} className="py-px">
                  {/* Day area opens hourly; the confidence tag opens the confidence
                      detail. Each highlights only when it's the open view.
                      (Separate targets — a nested button is invalid HTML.) */}
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => selectDay(day.date)}
                      aria-pressed={hourlyActive}
                      className={`grid flex-1 grid-cols-[2.5rem_1.5rem_1fr_auto] items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                        hourlyActive ? 'bg-accent/10 ring-1 ring-accent/40' : ''
                      }`}
                    >
                      <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">{WEEKDAY(day.date)}</span>
                      <WeatherIcon code={day.values.weather_code} className="h-[18px] w-[18px] text-ink-600" />
                      {/* Never wraps, matching the desktop card's day row. */}
                      <span className="whitespace-nowrap text-ink-900">
                        <span className="font-medium tabular-nums">{num(day.values.temperature_2m_max)}°</span>
                        <span className="tabular-nums text-ink-400"> / {num(day.values.temperature_2m_min)}°</span>
                        {typeof day.values.precipitation_sum === 'number' && day.values.precipitation_sum > 0 && (
                          <span className="ml-1 text-precip">{num(day.values.precipitation_sum, 1)}mm</span>
                        )}
                      </span>
                      <SpreadStrip day={day} extent={spreadExtent(forecast.data?.days ?? [])} />
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
          </>
        )}

        {/* Detail for the tapped day: hourly chart, or confidence detail when the
            confidence label was tapped. */}
        <div ref={detailRef} className="mt-4 border-t border-ink-900/10 pt-3">
          {!selectedDay ? (
            <p className="text-center text-xs text-ink-400">Tap a day for its hour-by-hour forecast</p>
          ) : showConfidence ? (
            <>
              <div className="mb-2 flex items-baseline gap-2">
                <h3 className="text-sm font-semibold text-ink-900">{prettyDay(selectedDay)}</h3>
                <span className="text-xs text-ink-400">confidence</span>
              </div>
              {forecast.isError ? (
                <p className="py-3 text-center text-sm text-danger">Couldn’t load the forecast. Check your connection and try again.</p>
              ) : shownDay ? (
                <ConfidenceDetail day={shownDay} />
              ) : (
                <span className="skeleton block h-24 w-full" aria-hidden />
              )}
            </>
          ) : (
            <>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">{prettyDay(selectedDay)}</h3>
                {series.length > 1 && (
                  <ul className="flex gap-3 text-xs text-ink-600">
                    {series.map((s) => (
                      <li key={s.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.accent }} />
                        <span className="max-w-[6rem] truncate">{s.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {pWeek.isError || cWeek.isError ? (
                <p className="py-3 text-center text-sm text-danger">Couldn’t load hourly data. Check your connection and try again.</p>
              ) : (pWeek.isLoading || cWeek.isLoading) && !hasHours ? (
                <span className="skeleton block h-32 w-full" aria-hidden />
              ) : !hasHours ? (
                <p className="py-3 text-center text-sm text-ink-600">No hourly data for this day.</p>
              ) : (
                <div className="overflow-x-auto">
                  <HourlyChart series={series} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
