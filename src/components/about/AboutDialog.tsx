// The info / "how it works" dialog, composed as the instrument's datasheet:
// hairline-ruled sections with tracked-caps titles, definition/threshold/channel
// tables, and worked examples as application notes. Opened from a trigger in
// either layout via the shared appStore `aboutOpen` flag; dismissed with the ✕
// button, Escape, or a backdrop click. Content lives in aboutContent.ts.

import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/appStore'
import { useImagery } from '../../hooks/queries'
import { cadenceFromTimes, shortTitle } from '../../lib/layerMeta'
import { XIcon } from '../icons'
import {
  CONFIDENCE,
  FEATURES,
  LAYER_INFO,
  MODELS,
  SOURCES,
  WEIGHTS_NEAR_TERM,
  WEIGHTS_RANGE,
  type Weight,
} from './aboutContent'

// Neutral bordered chip for role/cadence/satellite tags: the text carries the
// meaning; semantic colors stay reserved for confidence and locations.
const CHIP =
  'whitespace-nowrap rounded border border-ink-900/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-600'

const CONF_TEXT: Record<string, string> = {
  high: 'text-conf-high',
  medium: 'text-conf-medium',
  low: 'text-conf-low',
}

// Illustrative worked example for the blend-weights section: tomorrow's high (a
// near-term day, so the days 1–3 weights apply). The five near-term weights sum
// to 1, so no renormalization is needed. The confidence example below reuses these
// same five forecasts, since temperature max is the confidence variable.
const WEIGHT_EXAMPLE = [
  { model: 'ICON-2i', value: '24.0', weight: '0.50', contribution: '12.00' },
  { model: 'ECMWF IFS', value: '25.0', weight: '0.18', contribution: '4.50' },
  { model: 'ECMWF AIFS', value: '26.0', weight: '0.12', contribution: '3.12' },
  { model: 'ICON', value: '25.0', weight: '0.12', contribution: '3.00' },
  { model: 'GFS', value: '27.0', weight: '0.08', contribution: '2.16' },
]

// A ruled datasheet section: the tracked-caps title IS the heading.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-ink-900/8 px-6 py-5">
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
        {title}
      </h3>
      {children}
    </section>
  )
}

// Application-note block on the well surface (worked examples).
function ApplicationNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-well p-4 ring-1 ring-ink-900/8">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-600">
        {title}
      </p>
      {children}
    </div>
  )
}

function WeightTable({ title, tag, rows }: { title: string; tag: string; rows: Weight[] }) {
  const max = Math.max(...rows.map((r) => r.weight))
  return (
    <div className="rounded-lg p-4 ring-1 ring-ink-900/8">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
        <span className="text-xs tabular-nums text-ink-400">{tag}</span>
      </header>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.model} className={r.absent ? 'opacity-50' : undefined}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-ink-900">
                {r.model}
                {r.local && (
                  <span className="ml-1.5 rounded border border-ink-900/10 px-1.5 py-px text-[10px] uppercase tracking-wide text-ink-600">
                    local
                  </span>
                )}
              </span>
              <span className="text-xs tabular-nums text-ink-600">
                {r.absent ? `— ${r.absent}` : r.weight.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 h-[7px] overflow-hidden rounded-full bg-ink-900/10">
              {!r.absent && (
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(r.weight / max) * 100}%` }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AboutDialog() {
  const { aboutOpen, setAboutOpen } = useAppStore()
  const { data: imagery } = useImagery()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aboutOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAboutOpen(false)
    }
    window.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [aboutOpen, setAboutOpen])

  if (!aboutOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => setAboutOpen(false)}
        className="absolute inset-0 cursor-default bg-ink-900/40 backdrop-blur-sm"
      />

      {/* Panel: a dense reading surface — solid ground, shared elevation. */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="relative z-10 flex max-h-full w-full flex-col overflow-hidden bg-surface-solid shadow-panel ring-1 ring-ink-900/10 outline-none sm:max-h-[88vh] sm:max-w-3xl sm:rounded-2xl"
      >
        {/* Part header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-ink-900/10 px-5 py-3.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            {/* Three stacked clouds, offset down-left toward the front, to evoke aggregation. Matches the favicon. */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" transform="translate(8.6 5.3) scale(0.6) translate(-1.9 -5.3)" opacity="0.42" vectorEffect="non-scaling-stroke" />
              <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" transform="translate(6 7.9) scale(0.6) translate(-1.9 -5.3)" opacity="0.72" vectorEffect="non-scaling-stroke" />
              <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" transform="translate(3.4 10.5) scale(0.6) translate(-1.9 -5.3)" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
          <div className="mr-auto min-w-0">
            <p className="text-sm font-semibold leading-tight text-ink-900">meteo-aggregator</p>
            <p className="text-[10px] uppercase tracking-wide text-ink-400">About · how it works</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setAboutOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/5 hover:text-ink-600 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          {/* Title block */}
          <section className="border-b border-ink-900/8 px-6 py-6">
            <h2 id="about-title" className="mb-3 text-2xl font-bold tracking-tight text-ink-900 text-balance">
              Five weather models, one forecast
            </h2>
            <p className="max-w-[60ch] text-ink-600">
              meteo-aggregator is a map-first weather app. Click anywhere, or search a place, and it blends several
              numerical weather models into a single <b className="font-semibold text-ink-900">consensus forecast
              with a confidence level</b>. You can also overlay live <b className="font-semibold text-ink-900">
              satellite imagery</b> from EUMETSAT on the same map.
            </p>
          </section>

          {/* Capabilities as a ruled definition table */}
          <Section title="Capabilities">
            <dl className="divide-y divide-ink-900/8">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:gap-4">
                  <dt className="shrink-0 text-sm font-medium text-ink-900 sm:w-36">{f.title}</dt>
                  <dd className="text-sm text-ink-600">{f.body}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* Data sources as spec rows */}
          <Section title="Data sources">
            <p className="mb-3 max-w-[60ch] text-sm text-ink-600">
              Forecasts, ensemble spread and place search come from Open-Meteo, which needs no key. Satellite imagery
              comes from EUMETSAT’s EUMETView, fetched by your browser.
            </p>
            <ul className="divide-y divide-ink-900/8">
              {SOURCES.map((s) => (
                <li key={s.title} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="shrink-0 text-sm font-medium text-ink-900 sm:w-36">{s.title}</span>
                  <span className="min-w-0 flex-1 text-sm text-ink-600">{s.body}</span>
                  <code className="shrink-0 font-mono text-[0.72rem] text-ink-600">{s.host}</code>
                </li>
              ))}
            </ul>
          </Section>

          {/* Model complement */}
          <Section title="Models">
            <div className="overflow-x-auto rounded-lg ring-1 ring-ink-900/10">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-well text-[10px] uppercase tracking-wider text-ink-600">
                    <th className="border-b border-ink-900/10 px-3.5 py-2.5 font-medium">Model</th>
                    <th className="border-b border-ink-900/10 px-3.5 py-2.5 font-medium">Kind</th>
                    <th className="border-b border-ink-900/10 px-3.5 py-2.5 font-medium">Role</th>
                    <th className="border-b border-ink-900/10 px-3.5 py-2.5 font-medium">Resolution</th>
                    <th className="border-b border-ink-900/10 px-3.5 py-2.5 font-medium">Horizon</th>
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map((m) => (
                    <tr key={m.name}>
                      <td className="border-b border-ink-900/8 px-3.5 py-3">
                        <span className="font-semibold text-ink-900">{m.name}</span>
                        <span className="block text-xs text-ink-400">{m.source}</span>
                      </td>
                      <td className="border-b border-ink-900/8 px-3.5 py-3 text-ink-600">{m.kind}</td>
                      <td className="border-b border-ink-900/8 px-3.5 py-3">
                        <span className={CHIP}>
                          {m.roleLabel}
                        </span>
                      </td>
                      <td className="border-b border-ink-900/8 px-3.5 py-3 tabular-nums text-ink-600">{m.resolution}</td>
                      <td className="border-b border-ink-900/8 px-3.5 py-3 tabular-nums text-ink-600">{m.horizon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Blend weights */}
          <Section title="Blend weights">
            <p className="mb-4 max-w-[60ch] text-sm text-ink-600">
              For each day and each variable, the consensus is a <b className="font-semibold text-ink-900">weighted
              average of the models that have data that day</b>. The weights shift with how far out the forecast is: the
              2&nbsp;km local model leads for the first three days, then ECMWF takes over at range.
            </p>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <WeightTable title="Near term" tag="days 1–3" rows={WEIGHTS_NEAR_TERM} />
              <WeightTable title="Longer range" tag="days 4+" rows={WEIGHTS_RANGE} />
            </div>

            <div className="mb-4">
              <ApplicationNote title="Application note · tomorrow’s high (near term)">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[380px] border-collapse text-sm">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wide text-ink-600">
                        <th className="py-1 pr-3 text-left font-medium">Model</th>
                        <th className="px-3 py-1 text-right font-medium">Forecast</th>
                        <th className="px-3 py-1 text-right font-medium">Weight</th>
                        <th className="py-1 pl-3 text-right font-medium">Contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {WEIGHT_EXAMPLE.map((r) => (
                        <tr key={r.model}>
                          <td className="py-1 pr-3 text-ink-600">{r.model}</td>
                          <td className="px-3 py-1 text-right tabular-nums text-ink-600">{r.value} °C</td>
                          <td className="px-3 py-1 text-right tabular-nums text-ink-600">{r.weight}</td>
                          <td className="py-1 pl-3 text-right tabular-nums text-ink-600">{r.contribution}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-ink-900/10 font-semibold text-ink-900">
                        <td className="py-1.5 pr-3 text-left">Consensus</td>
                        <td className="px-3 py-1.5 text-right" />
                        <td className="px-3 py-1.5 text-right tabular-nums">1.00</td>
                        <td className="py-1.5 pl-3 text-right tabular-nums">24.8 °C</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <p className="mt-2 text-xs text-ink-600">
                  Each forecast times its weight, summed: 12.00 + 4.50 + 3.12 + 3.00 + 2.16 = 24.78, so the consensus
                  high is 24.8&nbsp;°C. These five weights already sum to 1, so nothing needs renormalizing.
                </p>
              </ApplicationNote>
            </div>

            <div className="max-w-[65ch] space-y-3 text-sm text-ink-600">
              <p>
                <b className="font-semibold text-ink-900">Weights renormalize over the models present.</b> They don’t
                need to sum to 1. When a model is missing for a day or variable (ICON-2i past day 3, or AIFS, which
                supplies no precipitation probability), the app rescales the remaining weights to sum to 1 so gaps
                don’t skew the blend.
              </p>
              <p>
                <b className="font-semibold text-ink-900">Some things can’t be averaged.</b> Sunrise, sunset, the
                weather-code icon and wind direction take the value from the single highest-weighted model present.
                Averaging a timestamp or a category would be meaningless.
              </p>
            </div>
          </Section>

          {/* Confidence */}
          <Section title="Confidence">
            <p className="mb-3 max-w-[60ch] text-sm text-ink-600">
              Confidence takes the <b className="font-semibold text-ink-900">larger</b> of two signals: how far the
              models spread apart, and the ICON ensemble spread, both measured on next-day high temperature. The daily
              range shown is the consensus ± that spread.
            </p>
            <div className="mb-4 rounded-lg ring-1 ring-ink-900/10">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-well text-[10px] uppercase tracking-wider text-ink-600">
                    <th className="border-b border-ink-900/10 px-3.5 py-2 font-medium">Level</th>
                    <th className="border-b border-ink-900/10 px-3.5 py-2 font-medium">Spread</th>
                    <th className="border-b border-ink-900/10 px-3.5 py-2 font-medium">Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {CONFIDENCE.map((c) => (
                    <tr key={c.level}>
                      <td className={`border-b border-ink-900/8 px-3.5 py-2.5 text-sm font-semibold ${CONF_TEXT[c.level]}`}>
                        {c.label}
                      </td>
                      <td className="border-b border-ink-900/8 px-3.5 py-2.5 tabular-nums text-ink-900">{c.range}</td>
                      <td className="border-b border-ink-900/8 px-3.5 py-2.5 text-ink-600">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ApplicationNote title="Application note · the same five highs">
              <p className="mb-3 text-sm text-ink-600">
                Those five model highs were{' '}
                <span className="tabular-nums text-ink-900">24, 25, 26, 25, 27&nbsp;°C</span>.
              </p>
              <dl className="text-sm">
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-ink-600">Spread between models (std dev)</dt>
                  <dd className="tabular-nums text-ink-900">1.0&nbsp;°C</dd>
                </div>
                <div className="flex justify-between gap-4 py-1">
                  <dt className="text-ink-600">ICON ensemble spread</dt>
                  <dd className="tabular-nums text-ink-900">1.3&nbsp;°C</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-ink-900/8 py-1.5">
                  <dt className="font-medium text-ink-600">Take the larger</dt>
                  <dd className="tabular-nums font-semibold text-ink-900">1.3&nbsp;°C</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-ink-600">
                1.3&nbsp;°C ≤ 1.5&nbsp;°C, so this day reads{' '}
                <span className="font-semibold text-conf-high">High</span> confidence, with a range of{' '}
                <span className="tabular-nums text-ink-900">24.8 ± 1.3 → 23.5 to 26.1&nbsp;°C</span>.
              </p>
            </ApplicationNote>
          </Section>

          {/* Imagery channels, derived from GET /imagery */}
          <Section title="Imagery channels">
            <p className="mb-3 max-w-[60ch] text-sm text-ink-600">
              Imagery comes from EUMETSAT’s geostationary MTG and MSG satellites. The badge on each channel is how
              often a fresh frame arrives.
            </p>
            {imagery ? (
              <ul className="divide-y divide-ink-900/8">
                {imagery.layers.map((layer) => {
                  const info = LAYER_INFO[layer.layer]
                  const name = info?.name ?? shortTitle(layer.title)
                  const cadence = cadenceFromTimes(layer.times)
                  return (
                    <li key={layer.layer} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
                      <span className="shrink-0 text-sm font-medium text-ink-900 sm:w-40">{name}</span>
                      {info?.satellite && (
                        <span className="shrink-0 rounded border border-ink-900/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-400">
                          {info.satellite}
                        </span>
                      )}
                      <span className="min-w-[14rem] flex-1 text-sm text-ink-600">{info?.description ?? name}</span>
                      {cadence && (
                        <span className={`shrink-0 ${CHIP}`}>
                          {cadence.label}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="space-y-2" aria-hidden>
                {Array.from({ length: 4 }, (_, i) => (
                  <span key={i} className="skeleton block h-8 w-full" />
                ))}
              </div>
            )}
          </Section>

          <footer className="flex flex-wrap justify-between gap-3 bg-well px-6 py-4 text-xs text-ink-600">
            <span>multi-model consensus + EUMETSAT imagery</span>
            <span>metric · no account · no keys</span>
          </footer>
        </div>
      </div>
    </div>
  )
}
