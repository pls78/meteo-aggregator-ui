// Toggle satellite WMS overlays (from GET /imagery), adjust their opacity, and
// show each active layer's legend (color key) fetched from the WMS.

import { useState } from 'react'
import { useImagery } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { WmsLayerParams } from '../../api/types'
import { RGB_LEGENDS } from '../../lib/layerLegends'
import { ChevronRightIcon } from '../icons'

// Build a GetLegendGraphic URL for a layer from its WMS endpoint + name. Legends
// are static color scales (independent of time).
function legendUrl(params: WmsLayerParams): string {
  const url = new URL(params.wms_url)
  url.searchParams.set('service', 'WMS')
  url.searchParams.set('version', '1.3.0')
  url.searchParams.set('request', 'GetLegendGraphic')
  url.searchParams.set('layer', params.layer)
  url.searchParams.set('format', 'image/png')
  url.searchParams.set('transparent', 'true')
  return url.toString()
}

// A layer's legend image. It loads while taking no layout space and only reveals
// itself once a real legend has arrived — so layers with no legend (GeoServer's
// ~20x20 cross-hatched placeholder) or failed loads never cause a layout bump.
export function LayerLegend({ params }: { params: WmsLayerParams }) {
  const [ready, setReady] = useState(false)
  return (
    <img
      src={legendUrl(params)}
      alt={`${params.title} legend`}
      className={`ml-6 h-auto max-w-full rounded bg-surface-solid ${ready ? 'mt-1' : 'hidden'}`}
      onLoad={(e) => setReady(e.currentTarget.naturalWidth >= 64)}
      onError={() => setReady(false)}
    />
  )
}

// Static colour key for RGB composite overlays, which have no WMS legend. Renders
// nothing for layers without an entry in RGB_LEGENDS (those use LayerLegend).
export function RgbColorKey({ layerId }: { layerId: string }) {
  const info = RGB_LEGENDS[layerId]
  if (!info) return null
  return (
    <div className="ml-6 mt-1 space-y-0.5 text-xs text-ink-600">
      {info.note && <p className="italic text-ink-400">{info.note}</p>}
      {info.swatches?.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-sm ring-1 ring-ink-900/15"
            style={{ backgroundColor: s.color }}
          />
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

export function LayerControl() {
  const { data: imagery, isLoading, isError } = useImagery()
  const { activeLayers, toggleLayer, opacity, setOpacity, animatingLayer } = useAppStore()
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="panel w-64 rounded-xl p-3 text-sm">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full cursor-pointer items-center justify-between rounded-lg font-semibold text-ink-900 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span>Satellite layers</span>
        <span
          className={`text-ink-400 transition-transform duration-300 ${
            collapsed ? '' : 'rotate-90'
          }`}
        >
          <ChevronRightIcon />
        </span>
      </button>

      {/* Animate height via grid-template-rows 0fr -> 1fr; content stays mounted. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        }`}
      >
        <div
          className={`overflow-hidden transition-opacity duration-300 ${
            collapsed ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="mt-3">
            {isLoading && <p className="text-ink-600">Loading layers…</p>}
            {isError && <p className="text-danger">Couldn’t load layers.</p>}

            <ul className="space-y-1.5">
              {imagery?.layers.map((layer) => {
                const on = activeLayers.includes(layer.layer)
                // Lock the layer set while a time-lapse is playing.
                const locked = animatingLayer !== null
                return (
                  <li key={layer.layer}>
                    <label
                      className={`flex items-start gap-2 text-ink-600 ${
                        locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={locked}
                        onChange={() => toggleLayer(layer.layer)}
                        className="mt-0.5 accent-accent"
                      />
                      <span>{layer.title}</span>
                    </label>
                    {on && (
                      <>
                        <LayerLegend params={layer} />
                        <RgbColorKey layerId={layer.layer} />
                      </>
                    )}
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 border-t border-ink-900/10 pt-3">
              <label className="block text-xs text-ink-600">
                Opacity: {Math.round(opacity * 100)}%
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="mt-1 w-full cursor-pointer accent-accent"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
