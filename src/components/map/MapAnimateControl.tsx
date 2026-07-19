// Floating time-lapse control, overlaid on the map (bottom-center). It plays a
// single layer: the one currently animating, or otherwise the topmost active
// overlay. Shows the layer title and, while playing, the current frame's local
// time. Hidden when no layer is active. Layer selection is locked elsewhere
// while a layer plays (see LayerControl / MobileLayers), so only one animates.

import { useImagery } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'

export function MapAnimateControl() {
  const { data: imagery } = useImagery()
  const { activeLayers, animatingLayer, frameIndex, toggleLayerAnimation } = useAppStore()

  const layers = imagery?.layers ?? []
  // Prefer the layer that's already animating; else the topmost active overlay
  // (last in draw order = rendered on top).
  const target =
    layers.find((l) => l.layer === animatingLayer) ??
    [...layers].reverse().find((l) => activeLayers.includes(l.layer))

  if (!target) return null

  const isThis = animatingLayer === target.layer
  const frames = target.times ?? []
  const t = isThis && frames.length ? frames[Math.min(frameIndex, frames.length - 1)] : null
  const label = t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null

  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-xl ring-1 ring-black/5">
      <button
        type="button"
        onClick={() => toggleLayerAnimation(target.layer)}
        aria-pressed={isThis}
        aria-label={isThis ? 'Pause animation' : 'Animate layer'}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-white transition-colors hover:bg-slate-700"
      >
        <span aria-hidden className="text-xs leading-none">
          {isThis ? '⏸' : '▶'}
        </span>
      </button>
      <span className="max-w-[9rem] truncate text-xs font-medium text-slate-700">{target.title}</span>
      {isThis && label && (
        <span className="font-mono text-xs tabular-nums text-slate-500">{label}</span>
      )}
    </div>
  )
}
