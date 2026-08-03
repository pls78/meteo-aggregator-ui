// Mobile satellite layers: a Layers FAB (top-right, below the search) that opens a
// modal bottom sheet with a scrim. The sheet lists layers with large tap targets,
// legends, and an opacity slider; it scrolls internally so the map never pans.

import { useState } from 'react'
import { useImagery } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import { LayerLegend, RgbColorKey } from '../layers/LayerControl'
import { XIcon } from '../icons'

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
        className="panel pointer-events-auto absolute right-3 top-24 z-[1000] grid h-12 w-12 place-items-center rounded-2xl text-ink-600 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="h-6 w-6">
          <path d="M12 3 3 8l9 5 9-5-9-5z" />
          <path d="M3 13l9 5 9-5M3 18l9 5 9-5" opacity=".6" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Scrim */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 z-[1001] bg-ink-900/35 transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Sheet */}
      <section
        aria-label="Satellite layers"
        className={`panel pointer-events-auto absolute inset-x-0 bottom-0 z-[1002] flex max-h-[74%] flex-col rounded-t-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex shrink-0 justify-center py-2.5">
          <span className="h-1.5 w-10 rounded-full bg-ink-300" />
        </div>
        <header className="flex shrink-0 items-center justify-between px-4 pb-2">
          <h2 className="text-base font-semibold text-ink-900">Satellite layers</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="-m-1 grid h-9 w-9 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-ink-900/5 hover:text-ink-600 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4" style={{ touchAction: 'pan-y' }}>
          {isLoading && <p className="py-3 text-sm text-ink-600">Loading layers…</p>}
          {isError && <p className="py-3 text-sm text-danger">Couldn’t load layers.</p>}
          <ul className="divide-y divide-ink-900/8">
            {imagery?.layers.map((layer) => {
              const on = activeLayers.includes(layer.layer)
              // Lock the layer set while a time-lapse is playing.
              const locked = animatingLayer !== null
              return (
                <li key={layer.layer} className="py-1">
                  <label
                    className={`flex items-center gap-3 py-2 text-sm text-ink-900 ${
                      locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={locked}
                      onChange={() => toggleLayer(layer.layer)}
                      className="h-5 w-5 shrink-0 accent-accent"
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

        <div className="shrink-0 border-t border-ink-900/10 px-4 py-4">
          <label className="block text-xs font-medium text-ink-600">
            Overlay opacity — {Math.round(opacity * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </label>
        </div>
      </section>
    </>
  )
}
