// The meteogram signature at row scale: the day's per-model high temperatures as
// faint ticks around the bold consensus tick. Every strip in a card shares one
// degrees-per-pixel scale (the week's widest deviation, computed by the parent via
// spreadExtent), so a tight cluster genuinely reads tighter than a scattered one —
// confidence as visible width, comparable row to row. Data comes from the
// /forecast breakdown already in the cached response — no extra fetch. Renders
// nothing with fewer than two models.

import type { DayConsensus } from '../../api/types'

const W = 56
const H = 12
const PAD = 3

const nums = (vs: Array<number | string | null | undefined>) =>
  vs.filter((v): v is number => typeof v === 'number')

const deviations = (day: DayConsensus): number[] => {
  const consensus = day.values.temperature_2m_max
  if (typeof consensus !== 'number') return []
  return nums(day.breakdown.map((c) => c.values.temperature_2m_max)).map((v) => v - consensus)
}

/** Shared scale for a set of day rows: the largest |model − consensus| in the
 *  week (floored at 1°), so all strips render in the same degrees-per-pixel. */
export function spreadExtent(days: DayConsensus[]): number {
  const devs = days.flatMap(deviations).map(Math.abs)
  return Math.max(1, ...devs)
}

export function SpreadStrip({ day, extent }: { day: DayConsensus; extent: number }) {
  const devs = deviations(day)
  if (devs.length < 2) return null

  // Domain centered on the consensus: [-extent, +extent] plus a hair of padding.
  const e = extent + 0.25
  const x = (dev: number) => PAD + ((dev + e) / (2 * e)) * (W - 2 * PAD)
  const mid = H / 2

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      aria-label={`Model spread ${(Math.max(...devs) - Math.min(...devs)).toFixed(1)} degrees`}
      role="img"
      className="shrink-0"
    >
      <line x1={PAD} y1={mid} x2={W - PAD} y2={mid} stroke="var(--color-ink-300)" strokeWidth={1} opacity={0.6} />
      {devs.map((d, i) => (
        <line key={i} x1={x(d)} y1={mid - 3} x2={x(d)} y2={mid + 3} stroke="var(--color-ink-400)" strokeWidth={1} opacity={0.55} />
      ))}
      <line x1={x(0)} y1={1.5} x2={x(0)} y2={H - 1.5} stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}
