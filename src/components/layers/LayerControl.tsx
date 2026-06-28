// Toggle satellite WMS overlays (from GET /imagery), adjust their opacity, and
// show each active layer's legend (color key) fetched from the WMS.

import { useState } from 'react'
import { useImagery } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { WmsLayerParams } from '../../api/types'

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
function LayerLegend({ params }: { params: WmsLayerParams }) {
  const [ready, setReady] = useState(false)
  return (
    <img
      src={legendUrl(params)}
      alt={`${params.title} legend`}
      className={`ml-6 h-auto max-w-full rounded bg-white ${ready ? 'mt-1' : 'hidden'}`}
      onLoad={(e) => setReady(e.currentTarget.naturalWidth >= 64)}
      onError={() => setReady(false)}
    />
  )
}

export function LayerControl() {
  const { data: imagery, isLoading, isError } = useImagery()
  const { activeLayers, toggleLayer, opacity, setOpacity } = useAppStore()
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="w-64 rounded-xl bg-white/95 p-3 text-sm shadow-xl ring-1 ring-black/5">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full cursor-pointer items-center justify-between font-semibold text-slate-900"
      >
        <span>Satellite layers</span>
        <span
          className={`text-slate-400 transition-transform duration-300 ${
            collapsed ? '' : 'rotate-90'
          }`}
        >
          ▸
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
            {isLoading && <p className="text-slate-500">Loading layers…</p>}
            {isError && <p className="text-rose-600">Couldn’t load layers.</p>}

            <ul className="space-y-1.5">
              {imagery?.layers.map((layer) => (
                <li key={layer.layer}>
                  <label className="flex cursor-pointer items-start gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={activeLayers.includes(layer.layer)}
                      onChange={() => toggleLayer(layer.layer)}
                      className="mt-0.5"
                    />
                    <span>{layer.title}</span>
                  </label>
                  {activeLayers.includes(layer.layer) && <LayerLegend params={layer} />}
                </li>
              ))}
            </ul>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <label className="block text-xs text-slate-500">
                Opacity: {Math.round(opacity * 100)}%
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="mt-1 w-full cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
