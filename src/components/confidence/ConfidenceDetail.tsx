// Confidence detail for one day: the per-model day-high temperatures behind the
// blended value, plus a plain-language explanation of how the confidence level
// was derived. Shown in place of the hourly chart when a day's confidence label
// is tapped. Reads only data already in the /forecast response — no extra fetch.

import { Fragment } from 'react'
import type { DayConsensus, DailyValue } from '../../api/types'

// Band thresholds on the model spread, transcribed from the backend config
// (../meteo-aggregator-api/meteo_aggregator/config.py: CONFIDENCE_HIGH_MAX / _MEDIUM_MAX).
// Keep in sync if the backend changes.
const HIGH_MAX = 1.5
const MEDIUM_MAX = 3.5

// Raw model ids from breakdown[].model → the short names used in the info page.
const MODEL_NAMES: Record<string, string> = {
  ecmwf_ifs025: 'ECMWF IFS',
  ecmwf_aifs025_single: 'ECMWF AIFS',
  gfs_seamless: 'GFS',
  icon_seamless: 'ICON',
  italia_meteo_arpae_icon_2i: 'ICON-2i',
}
const modelName = (id: string) => MODEL_NAMES[id] ?? id

// Blend weights by model id and lead-time bucket, transcribed from the backend
// config (config.py: WEIGHTS_NEAR_TERM / WEIGHTS_RANGE, NEAR_TERM_DAYS). The
// weight shown per model is renormalized over the models present that day, which
// is exactly how the backend blends the consensus. Keep in sync with config.py.
const NEAR_TERM_DAYS = 3
const WEIGHTS_NEAR_TERM: Record<string, number> = {
  italia_meteo_arpae_icon_2i: 0.5,
  ecmwf_ifs025: 0.18,
  ecmwf_aifs025_single: 0.12,
  icon_seamless: 0.12,
  gfs_seamless: 0.08,
}
const WEIGHTS_RANGE: Record<string, number> = {
  ecmwf_ifs025: 0.35,
  ecmwf_aifs025_single: 0.3,
  icon_seamless: 0.2,
  gfs_seamless: 0.15,
}

const LEVEL_STYLE: Record<string, string> = {
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-rose-100 text-rose-700',
}

const isNum = (v: DailyValue): v is number => typeof v === 'number'
const fmt = (v: number) => `${v.toFixed(1)}°`
const pct = (w: number) => `${Math.round(w * 100)}%`

export function ConfidenceDetail({ day }: { day: DayConsensus }) {
  const { level, spread } = day.confidence
  const consensus = day.values.temperature_2m_max

  // Each present model's day-high and its blend weight for this lead day, with
  // weights renormalized over the models actually present (matching the backend).
  const table = day.lead_day < NEAR_TERM_DAYS ? WEIGHTS_NEAR_TERM : WEIGHTS_RANGE
  const present = day.breakdown
    .map((c) => ({ name: modelName(c.model), value: c.values.temperature_2m_max, raw: table[c.model] ?? 0 }))
    .filter((r): r is { name: string; value: number; raw: number } => isNum(r.value))
  const totalW = present.reduce((sum, r) => sum + r.raw, 0)
  // Tightest to widest. Fall back to equal weights if the bucket has none (mirrors
  // the backend's plain-mean fallback when all weights are zero).
  const rows = present
    .map((r) => ({
      ...r,
      weight: totalW > 0 ? r.raw / totalW : present.length ? 1 / present.length : 0,
    }))
    .sort((a, b) => b.value - a.value)

  const spreadText = isNum(spread) ? `${spread.toFixed(1)}°` : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${LEVEL_STYLE[level] ?? ''}`}>
          {level} confidence
        </span>
        {spreadText && (
          <span className="text-xs text-slate-500">model spread {spreadText}</span>
        )}
      </div>

      {/* Per-model day-high temperatures + blend weight behind the consensus */}
      {rows.length > 0 ? (
        <div className="space-y-1.5">
          <div className="inline-grid grid-cols-[6.5rem_2.75rem_3.5rem] items-baseline gap-x-3 text-sm">
            {/* Header */}
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Model</span>
            <span className="text-right text-[10px] font-medium uppercase tracking-wide text-slate-400">Weight</span>
            <span className="text-right text-[10px] font-medium uppercase tracking-wide text-slate-400">Temp</span>

            {rows.map((r) => (
              <Fragment key={r.name}>
                <span className="text-slate-600">{r.name}</span>
                <span className="text-right tabular-nums text-slate-500">{pct(r.weight)}</span>
                <span className="text-right font-medium tabular-nums text-slate-900">{fmt(r.value)}</span>
              </Fragment>
            ))}

            {isNum(consensus) && (
              <>
                <span className="col-span-3 mt-1 border-t border-slate-200" />
                <span className="col-span-2 font-medium text-slate-700">Consensus</span>
                <span className="text-right font-semibold tabular-nums text-slate-900">{fmt(consensus)}</span>
              </>
            )}
          </div>
          <p className="max-w-[17rem] text-[11px] text-slate-400">
            Weight is each model’s share of the blended consensus for this day.
          </p>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No per-model temperatures available for this day.</p>
      )}

      {/* Why this level. Capped so the desktop card can hug the table width
          instead of stretching to this sentence's length. */}
      <p className="max-w-[17rem] text-xs leading-relaxed text-slate-500">
        Confidence reflects how much the models disagree on the day’s high (plus the
        ICON ensemble spread, when available)
        {spreadText ? <> — here the spread is <span className="font-medium text-slate-600">{spreadText}</span></> : null}.
        Spreads up to {HIGH_MAX.toFixed(1)}° read as <span className="font-medium text-emerald-700">high</span>,
        up to {MEDIUM_MAX.toFixed(1)}° as <span className="font-medium text-amber-700">medium</span>,
        wider as <span className="font-medium text-rose-700">low</span>.
      </p>
    </div>
  )
}
