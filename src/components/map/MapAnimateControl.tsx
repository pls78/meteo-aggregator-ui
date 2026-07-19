// Floating time-lapse control, overlaid on the map (bottom-center). Animation
// plays a single layer, so the button is enabled only when exactly one overlay
// is active; with two or more it stays visible but disabled. Hidden when no
// layer is active. While playing it shows the layer title and the current
// frame's local time; layer selection is locked elsewhere (see LayerControl /
// MobileLayers) so the active layer can't change mid-play.

import { useImagery } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'

export function MapAnimateControl() {
  const { data: imagery } = useImagery()
  const { activeLayers, animatingLayer, frameIndex, toggleLayerAnimation } = useAppStore()

  const layers = imagery?.layers ?? []
  const active = layers.filter((l) => activeLayers.includes(l.layer))

  if (active.length === 0) return null

  // Only a single active overlay can be animated.
  const single = active.length === 1
  const target = single ? active[0] : null
  const isThis = target !== null && animatingLayer === target.layer

  const frames = target?.times ?? []
  const t = isThis && frames.length ? frames[Math.min(frameIndex, frames.length - 1)] : null
  const label = t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

  const text = single ? target!.title : 'Select one layer to animate'

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-xl ring-1 ring-black/5">
      <button
        type="button"
        onClick={() => target && toggleLayerAnimation(target.layer)}
        disabled={!single}
        aria-pressed={isThis}
        aria-label={isThis ? 'Pause animation' : 'Animate layer'}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
      >
        <span aria-hidden className="text-xs leading-none">
          {isThis ? '⏸' : '▶'}
        </span>
      </button>
      <span
        className={`max-w-[11rem] truncate text-xs font-medium ${single ? 'text-slate-700' : 'text-slate-400'}`}
      >
        {text}
      </span>
      {isThis && label && (
        <span className="font-mono text-xs tabular-nums text-slate-500">{label}</span>
      )}
    </div>
  )
}
