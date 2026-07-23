// A self-contained (no charting dep) SVG chart for one or two locations' hours of
// a single day. Two stacked panels share one x-axis (hour of day): a temperature
// line per location on top, precipitation bars beneath. One axis per panel — temp
// and precip never share a scale. Colors are the fixed location accents (blue
// primary / amber comparison); identity is carried by the legend (rendered by the
// panel), so the amber line's lower contrast on white is backed by a visible label.
//
// The chart fills its container's width and adapts how many temperature points it
// plots to the space available: a point every 3 h when narrow, every 2 h at medium
// width, every hour when wide — so wider space shows more detail.

import { useLayoutEffect, useRef, useState } from 'react'
import type { HourConsensus } from '../../api/types'
import { weatherInfo } from '../../lib/weatherCode'

export interface ChartSeries {
  name: string
  accent: string
  hours: HourConsensus[] // already filtered to the day
}

const PAD_L = 40
const PAD_R = 34 // room for the end-of-line value label (e.g. "30°")
const ICON_H = 22
const TEMP_H = 120
const GAP = 12
const PRECIP_H = 48
const AXIS_H = 20

const AXIS_INK = '#64748b' // slate-500
const GRID = '#e2e8f0' // slate-200
const VALUE_INK = '#475569' // slate-600

const num = (v: number | string | null | undefined): number | null =>
  typeof v === 'number' ? v : null
const hourOf = (h: HourConsensus) => Number(String(h.date).slice(11, 13))
const pad2 = (n: number) => String(n).padStart(2, '0')

// Hours between plotted temperature points, chosen from the available width.
const strideFor = (w: number) => (w >= 640 ? 1 : w >= 420 ? 2 : 3)

export function HourlyChart({ series }: { series: ChartSeries[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const clean = series.map((s) => ({
    ...s,
    hours: [...s.hours].sort((a, b) => hourOf(a) - hourOf(b)),
  }))

  // Shared x domain: the union of hours present across series.
  const allHours = Array.from(
    new Set(clean.flatMap((s) => s.hours.map(hourOf))),
  ).sort((a, b) => a - b)

  return (
    <div ref={ref} className="w-full">
      {w > 0 && allHours.length > 0 && <Chart clean={clean} allHours={allHours} width={w} />}
    </div>
  )
}

function Chart({
  clean,
  allHours,
  width,
}: {
  clean: ChartSeries[]
  allHours: number[]
  width: number
}) {
  const hMin = allHours[0]
  const hMax = allHours[allHours.length - 1]
  const span = Math.max(1, hMax - hMin)
  const stride = strideFor(width)

  // Hovered (mouse) / tapped (touch) point: shows a crosshair + value readout.
  const [active, setActive] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const tempTop = ICON_H
  const tempBot = tempTop + TEMP_H
  const precipTop = tempBot + GAP
  const precipBot = precipTop + PRECIP_H
  const height = precipBot + AXIS_H

  const plotW = Math.max(1, width - PAD_L - PAD_R)
  const pxPerHour = plotW / span
  const x = (hour: number) => PAD_L + (hour - hMin) * pxPerHour

  // Temperature scale (padded), shared across both series.
  const temps = clean.flatMap((s) =>
    s.hours.map((h) => num(h.values.temperature_2m)).filter((v): v is number => v !== null),
  )
  const tLo = temps.length ? Math.min(...temps) - 1 : 0
  const tHi = temps.length ? Math.max(...temps) + 1 : 1
  const tSpan = tHi - tLo || 1
  const yTemp = (v: number) => tempBot - ((v - tLo) / tSpan) * TEMP_H

  // Precipitation scale (0-based), shared across both series.
  const precips = clean.flatMap((s) =>
    s.hours.map((h) => num(h.values.precipitation)).filter((v): v is number => v !== null),
  )
  const pMax = precips.length ? Math.max(...precips) : 0
  const yPrecip = (v: number) => precipBot - (pMax > 0 ? (v / pMax) * PRECIP_H : 0)

  const tempTicks = [tLo, (tLo + tHi) / 2, tHi]
  const barW = clean.length > 1 ? pxPerHour * 0.26 : pxPerHour * 0.5

  // Plotted temperature hours: every `stride` from the start, always including the
  // last hour so the line reaches the right edge.
  const sample = (hours: HourConsensus[]) => {
    const byHour = new Map(hours.map((h) => [hourOf(h), h]))
    const picked: HourConsensus[] = []
    for (let hh = hMin; hh <= hMax; hh += stride) {
      const h = byHour.get(hh)
      if (h) picked.push(h)
    }
    const lastH = byHour.get(hMax)
    if (lastH && picked[picked.length - 1] !== lastH) picked.push(lastH)
    return picked
  }

  // Weather icons stay at >= 3 h so they never crowd; hour labels sit under every
  // plotted temperature point (same hours the line samples).
  const iconStep = Math.max(3, stride)
  const pointHours = allHours.filter((h) => (h - hMin) % stride === 0)
  if (pointHours.length && pointHours[pointHours.length - 1] !== hMax) pointHours.push(hMax)

  // Snap a pointer x (client coords) to the nearest visible point.
  const pick = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = clientX - rect.left
    let best = pointHours[0]
    let bestD = Infinity
    for (const h of pointHours) {
      const d = Math.abs(x(h) - px)
      if (d < bestD) {
        bestD = d
        best = h
      }
    }
    setActive(best)
  }
  const tempAt = (s: ChartSeries, hour: number) => {
    const h = s.hours.find((hh) => hourOf(hh) === hour)
    return h ? num(h.values.temperature_2m) : null
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Hourly temperature and precipitation"
      className="block touch-pan-y"
      onPointerMove={(e) => e.pointerType === 'mouse' && pick(e.clientX)}
      onPointerDown={(e) => pick(e.clientX)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
    >
      {/* Temperature gridlines + °C labels */}
      {tempTicks.map((t, i) => (
        <g key={`tg${i}`}>
          <line x1={PAD_L} y1={yTemp(t)} x2={width - PAD_R} y2={yTemp(t)} stroke={GRID} strokeWidth={1} />
          <text x={PAD_L - 6} y={yTemp(t) + 3} textAnchor="end" fontSize={10} fill={AXIS_INK}>
            {Math.round(t)}°
          </text>
        </g>
      ))}

      {/* Precip baseline + max label */}
      <line x1={PAD_L} y1={precipBot} x2={width - PAD_R} y2={precipBot} stroke={GRID} strokeWidth={1} />
      {pMax > 0 ? (
        <text x={PAD_L - 6} y={precipTop + 8} textAnchor="end" fontSize={10} fill={AXIS_INK}>
          {pMax.toFixed(pMax < 2 ? 1 : 0)}mm
        </text>
      ) : (
        <text x={PAD_L + 2} y={precipBot - PRECIP_H / 2} fontSize={10} fill={AXIS_INK}>
          no precipitation
        </text>
      )}

      {/* Precipitation bars (one group per series, paired when two) */}
      {clean.map((s, si) =>
        s.hours.map((h) => {
          const p = num(h.values.precipitation)
          if (p === null || p <= 0) return null
          const offset = clean.length > 1 ? (si === 0 ? -barW - 1 : 1) : -barW / 2
          return (
            <rect
              key={`p${si}-${hourOf(h)}`}
              x={x(hourOf(h)) + offset}
              y={yPrecip(p)}
              width={barW}
              height={precipBot - yPrecip(p)}
              rx={1.5}
              fill={s.accent}
              opacity={0.75}
            />
          )
        }),
      )}

      {/* Temperature line + dots per series, at the chosen point stride */}
      {clean.map((s, si) => {
        const picked = sample(s.hours)
        const pts = picked
          .map((h) => {
            const t = num(h.values.temperature_2m)
            return t === null ? null : `${x(hourOf(h))},${yTemp(t)}`
          })
          .filter((p): p is string => p !== null)
        if (pts.length === 0) return null
        const last = picked[picked.length - 1]
        const lastT = num(last?.values.temperature_2m)
        return (
          <g key={`t${si}`}>
            <polyline points={pts.join(' ')} fill="none" stroke={s.accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {picked.map((h) => {
              const t = num(h.values.temperature_2m)
              return t === null ? null : (
                <circle key={`d${si}-${hourOf(h)}`} cx={x(hourOf(h))} cy={yTemp(t)} r={1.8} fill={s.accent} />
              )
            })}
            {lastT !== null && (
              <text x={x(hourOf(last)) + 6} y={yTemp(lastT) + 3} fontSize={10} fontWeight={600} fill={VALUE_INK}>
                {Math.round(lastT)}°
              </text>
            )}
          </g>
        )
      })}

      {/* Weather icons (primary series) */}
      {clean[0]?.hours
        .filter((h) => (hourOf(h) - hMin) % iconStep === 0)
        .map((h) => (
          <text key={`ic${hourOf(h)}`} x={x(hourOf(h))} y={ICON_H - 6} textAnchor="middle" fontSize={13}>
            {weatherInfo(h.values.weather_code).icon}
          </text>
        ))}

      {/* Hour axis — one label under each plotted point */}
      {pointHours.map((h) => (
        <text
          key={`ax${h}`}
          x={x(h)}
          y={height - 6}
          textAnchor="middle"
          fontSize={10}
          fontWeight={h === active ? 700 : 400}
          fill={h === active ? VALUE_INK : AXIS_INK}
        >
          {pad2(h)}
        </text>
      ))}

      {/* Crosshair for the hovered/tapped point */}
      {active !== null && (
        <g pointerEvents="none">
          <line
            x1={x(active)}
            y1={tempTop}
            x2={x(active)}
            y2={precipBot}
            stroke={AXIS_INK}
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.7}
          />
          {clean.map((s, si) => {
            const t = tempAt(s, active)
            if (t === null) return null
            const xa = x(active)
            const nearRight = xa > width - PAD_R - 30
            return (
              <g key={`hl${si}`}>
                <circle cx={xa} cy={yTemp(t)} r={3.5} fill={s.accent} stroke="#fff" strokeWidth={1.5} />
                <text
                  x={nearRight ? xa - 7 : xa + 7}
                  y={yTemp(t) - 5}
                  textAnchor={nearRight ? 'end' : 'start'}
                  fontSize={11}
                  fontWeight={700}
                  fill={s.accent}
                >
                  {Math.round(t)}°
                </text>
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}
