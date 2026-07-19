// Mobile satellite layers: a Layers FAB (top-right, below the search) that opens a
// modal bottom sheet with a scrim. The sheet lists layers with large tap targets,
// legends, and an opacity slider; it scrolls internally so the map never pans.

import { useState } from 'react'
import { useImagery } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import { LayerLegend, RgbColorKey } from '../layers/LayerControl'

export function MobileLayers() {
  const { data: imagery, isLoading, isError } = useImagery()
  const { activeLayers, toggleLayer, opacity, setOpacity, animatingLayer } = useAppStore()
  const [open, setOpen] = useState(false)

  const activeCount = activeLayers.length

  return (
    <>
      <button
        type="button"
        aria-label="Satellite layers"
        onClick={() => setOpen(true)}
        className="pointer-events-auto absolute right-3 top-24 z-[1000] grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-slate-700 shadow-xl ring-1 ring-black/5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="h-6 w-6">
          <path d="M12 3 3 8l9 5 9-5-9-5z" />
          <path d="M3 13l9 5 9-5M3 18l9 5 9-5" opacity=".6" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Scrim */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 z-[1001] bg-slate-900/35 transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Sheet */}
      <section
        aria-label="Satellite layers"
        className={`pointer-events-auto absolute inset-x-0 bottom-0 z-[1002] flex max-h-[74%] flex-col rounded-t-2xl bg-white shadow-[0_-8px_30px_-8px_rgba(15,23,42,0.3)] transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 justify-center py-2.5">
          <span className="h-1.5 w-10 rounded-full bg-slate-300" />
        </div>
        <header className="flex shrink-0 items-center justify-between px-4 pb-2">
          <h2 className="text-base font-semibold text-slate-900">Satellite layers</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="text-2xl leading-none text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4" style={{ touchAction: 'pan-y' }}>
          {isLoading && <p className="py-3 text-sm text-slate-500">Loading layers…</p>}
          {isError && <p className="py-3 text-sm text-rose-600">Couldn’t load layers.</p>}
          <ul className="divide-y divide-slate-100">
            {imagery?.layers.map((layer) => {
              const on = activeLayers.includes(layer.layer)
              // Lock the layer set while a time-lapse is playing.
              const locked = animatingLayer !== null
              return (
                <li key={layer.layer} className="py-1">
                  <label
                    className={`flex items-center gap-3 py-2 text-sm text-slate-800 ${
                      locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={locked}
                      onChange={() => toggleLayer(layer.layer)}
                      className="h-5 w-5 shrink-0"
                    />
                    <span className="flex-1">{layer.title}</span>
                  </label>
                  {on && (
                    <div className="pb-2">
                      <LayerLegend params={layer} />
                      <RgbColorKey layerId={layer.layer} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="shrink-0 border-t border-slate-200 px-4 py-4">
          <label className="block text-xs font-medium text-slate-500">
            Overlay opacity — {Math.round(opacity * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
        </div>
      </section>
    </>
  )
}
