// The info / "how it works" dialog: a light modal over the map describing the app's
// features, data sources, aggregation/weighting method, and satellite layers. Opened
// from a trigger in either layout via the shared appStore `aboutOpen` flag. Dismissed
// with the ✕ button, Escape, or a backdrop click. Content lives in aboutContent.ts.

import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/appStore'
import {
  CONFIDENCE,
  FEATURES,
  MODELS,
  SATELLITE_LAYERS,
  SOURCES,
  WEIGHTS_NEAR_TERM,
  WEIGHTS_RANGE,
  type ModelRole,
  type Weight,
} from './aboutContent'

const ROLE_BADGE: Record<ModelRole, string> = {
  global: 'text-sky-700 bg-sky-50',
  ml: 'text-slate-600 bg-slate-100',
  local: 'text-amber-700 bg-amber-50',
}

const CADENCE_BADGE: Record<string, string> = {
  fast: 'text-rose-700 bg-rose-50',
  normal: 'text-sky-700 bg-sky-50',
  daily: 'text-slate-500 bg-slate-100',
}

const CONF_BORDER: Record<string, string> = {
  high: 'border-t-emerald-500',
  medium: 'border-t-amber-500',
  low: 'border-t-rose-500',
}
const CONF_TEXT: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-rose-600',
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-sky-700">
      <span className="h-px w-4 bg-current opacity-60" />
      {children}
    </p>
  )
}

function WeightTable({ title, tag, rows }: { title: string; tag: string; rows: Weight[] }) {
  const max = Math.max(...rows.map((r) => r.weight))
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <span className="font-mono text-xs text-slate-400">{tag}</span>
      </header>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.model} className={r.absent ? 'opacity-50' : undefined}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-800">
                {r.model}
                {r.local && (
                  <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-px font-mono text-[0.6rem] uppercase tracking-wide text-amber-700">
                    local
                  </span>
                )}
              </span>
              <span className="font-mono text-xs tabular-nums text-slate-500">
                {r.absent ? `— ${r.absent}` : r.weight.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 h-[7px] overflow-hidden rounded-full bg-slate-200">
              {!r.absent && (
                <div
                  className={`h-full rounded-full ${r.local ? 'bg-amber-500' : 'bg-sky-500'}`}
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
        className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="relative z-10 flex max-h-full w-full flex-col overflow-hidden bg-white shadow-2xl outline-none sm:max-h-[88vh] sm:max-w-3xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-5 py-3.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-amber-500 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z" />
            </svg>
          </span>
          <div className="mr-auto min-w-0">
            <p className="text-sm font-semibold leading-tight text-slate-900">meteo-aggregator</p>
            <p className="font-mono text-[0.68rem] tracking-wide text-slate-400">ABOUT · HOW IT WORKS</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setAboutOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
          {/* Overview */}
          <section className="border-b border-slate-100 px-6 py-6">
            <Eyebrow>What this is</Eyebrow>
            <h2 id="about-title" className="mb-3 text-2xl font-bold tracking-tight text-slate-900 text-balance">
              One honest forecast, drawn from five weather models
            </h2>
            <p className="max-w-[60ch] text-slate-600">
              meteo-aggregator is a map-first weather app. Click anywhere — or search a place — and it blends several
              numerical weather models into a single <b className="font-semibold text-slate-800">consensus forecast
              with a confidence level</b>, then lets you overlay live <b className="font-semibold text-slate-800">
              satellite imagery</b> from EUMETSAT on the same map.
            </p>
          </section>

          {/* Features */}
          <section className="border-b border-slate-100 px-6 py-6">
            <Eyebrow>Features</Eyebrow>
            <h3 className="mb-4 text-lg font-semibold text-slate-900">What you can do</h3>
            <div className="grid gap-px overflow-hidden rounded-xl border border-slate-100 bg-slate-100 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white p-4">
                  <h4 className="mb-1 text-sm font-semibold text-slate-900">{f.title}</h4>
                  <p className="text-sm text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data sources */}
          <section className="border-b border-slate-100 px-6 py-6">
            <Eyebrow>Data sources</Eyebrow>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Where the numbers come from</h3>
            <p className="mb-4 max-w-[60ch] text-sm text-slate-600">
              Forecasts, ensemble spread and place search come from Open-Meteo (no key required); satellite imagery
              comes from EUMETSAT’s EUMETView, fetched directly by your browser.
            </p>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {SOURCES.map((s) => (
                <div key={s.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <h4 className="text-sm font-semibold text-slate-900">{s.title}</h4>
                  <p className="mt-0.5 text-[0.82rem] text-slate-600">{s.body}</p>
                  <code className="mt-1 block font-mono text-[0.72rem] text-sky-700">{s.host}</code>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 font-mono text-[0.66rem] uppercase tracking-wider text-slate-400">
                    <th className="border-b border-slate-200 px-3.5 py-2.5 font-medium">Model</th>
                    <th className="border-b border-slate-200 px-3.5 py-2.5 font-medium">Kind</th>
                    <th className="border-b border-slate-200 px-3.5 py-2.5 font-medium">Role</th>
                    <th className="border-b border-slate-200 px-3.5 py-2.5 font-medium">Resolution</th>
                    <th className="border-b border-slate-200 px-3.5 py-2.5 font-medium">Horizon</th>
                  </tr>
                </thead>
                <tbody>
                  {MODELS.map((m) => (
                    <tr key={m.name}>
                      <td className="border-b border-slate-100 px-3.5 py-3">
                        <span className="font-semibold text-slate-900">{m.name}</span>
                        <span className="block text-xs text-slate-400">{m.source}</span>
                      </td>
                      <td className="border-b border-slate-100 px-3.5 py-3 text-slate-600">{m.kind}</td>
                      <td className="border-b border-slate-100 px-3.5 py-3">
                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide ${ROLE_BADGE[m.role]}`}>
                          {m.roleLabel}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-3.5 py-3 font-mono tabular-nums text-slate-700">{m.resolution}</td>
                      <td className="border-b border-slate-100 px-3.5 py-3 font-mono tabular-nums text-slate-700">{m.horizon}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Aggregation */}
          <section className="border-b border-slate-100 px-6 py-6">
            <Eyebrow>How we aggregate</Eyebrow>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Weighting by lead time</h3>
            <p className="mb-4 max-w-[60ch] text-sm text-slate-600">
              For every day and every variable, the consensus is a <b className="font-semibold text-slate-800">weighted
              average of the models that have data that day</b>. The weights shift with how far out the forecast is: the
              2&nbsp;km local model leads for the first three days, then ECMWF takes over at range.
            </p>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <WeightTable title="Near term" tag="days 1–3" rows={WEIGHTS_NEAR_TERM} />
              <WeightTable title="Longer range" tag="days 4+" rows={WEIGHTS_RANGE} />
            </div>

            <div className="mb-3 flex gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm">
              <span className="mt-0.5 shrink-0 text-sky-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                  <path d="M21 12a9 9 0 1 1-9-9" />
                  <path d="M16 3v5h5" />
                </svg>
              </span>
              <p className="text-slate-600">
                <b className="font-semibold text-slate-800">Weights renormalize over the models present.</b> They don’t
                need to sum to 1 — when a model is missing for a day or variable (ICON-2i past day 3, or AIFS, which
                supplies no precipitation probability), the remaining weights are rescaled to sum to 1 so gaps never
                skew the blend.
              </p>
            </div>
            <div className="mb-5 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <span className="mt-0.5 shrink-0 text-amber-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                  <path d="M12 4v16M4 8V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3M9 20h6" />
                </svg>
              </span>
              <p className="text-slate-600">
                <b className="font-semibold text-slate-800">Some things can’t be averaged.</b> Sunrise, sunset, the
                weather-code icon and wind direction take the value from the single highest-weighted model present —
                averaging a timestamp or a category is meaningless.
              </p>
            </div>

            <h4 className="mb-1 font-semibold text-slate-900">Confidence, from how much the models disagree</h4>
            <p className="mb-3 max-w-[60ch] text-sm text-slate-600">
              Confidence uses the <b className="font-semibold text-slate-800">larger</b> of two signals — how far the
              models spread apart, and the ICON ensemble spread — measured on next-day high temperature. The daily range
              shown is the consensus ± that spread.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {CONFIDENCE.map((c) => (
                <div key={c.level} className={`rounded-xl border border-t-[3px] border-slate-200 bg-slate-50 p-3.5 ${CONF_BORDER[c.level]}`}>
                  <span className={`font-mono text-[0.7rem] font-semibold uppercase tracking-widest ${CONF_TEXT[c.level]}`}>{c.label}</span>
                  <div className="my-0.5 font-mono text-lg tabular-nums text-slate-900">{c.range}</div>
                  <small className="text-xs text-slate-400">{c.note}</small>
                </div>
              ))}
            </div>
          </section>

          {/* Satellite layers */}
          <section className="px-6 py-6">
            <Eyebrow>Satellite layers</Eyebrow>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">What each overlay shows & how often it updates</h3>
            <p className="mb-4 max-w-[60ch] text-sm text-slate-600">
              Imagery comes from EUMETSAT’s geostationary MTG and MSG satellites, plus the polar-orbiting Sentinel-3. The
              badge on each layer is how often a fresh frame arrives.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SATELLITE_LAYERS.map((l) => (
                <div key={l.title} className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{l.title}</h4>
                    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[0.66rem] font-semibold ${CADENCE_BADGE[l.cadenceKind]}`}>
                      {l.cadence}
                    </span>
                  </div>
                  <p className="text-[0.82rem] text-slate-600">{l.description}</p>
                  <span className="mt-auto w-fit rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-slate-400">
                    {l.satellite}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <footer className="flex flex-wrap justify-between gap-3 bg-slate-50 px-6 py-4 font-mono text-[0.72rem] text-slate-400">
            <span>multi-model consensus + EUMETSAT imagery</span>
            <span>metric · no account · no keys</span>
          </footer>
        </div>
      </div>
    </div>
  )
}
