// Floating time-lapse control, overlaid on the map (bottom-center). Animation
// plays a single layer, so the button is enabled only when exactly one overlay
// is active; with two or more it stays visible but disabled. Hidden when no
// layer is active. While playing it shows the layer title and the current
// frame's local time; layer selection is locked elsewhere (see LayerControl /
// MobileLayers) so the active layer can't change mid-play.

import { useImagery } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import { shortTitle } from '../../lib/layerMeta'

// Filled play/pause glyphs as inline SVG so they render identically everywhere
// and sit optically centred (the play triangle is nudged right a hair).
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4 translate-x-px">
      <path d="M8 5.2v13.6a1 1 0 0 0 1.52.86l11.02-6.8a1 1 0 0 0 0-1.72L9.52 4.34A1 1 0 0 0 8 5.2Z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
      <rect x="6.5" y="5" width="4" height="14" rx="1.3" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.3" />
    </svg>
  )
}

// Small spinner shown beside the frame time while its tiles are still fetching.
function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5 animate-spin text-slate-400">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function MapAnimateControl() {
  const { data: imagery } = useImagery()
  const { activeLayers, animatingLayer, frameIndex, frameLoading, toggleLayerAnimation } = useAppStore()

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

  const text = single ? shortTitle(target!.title) : 'Select one layer to animate'

  return (
    <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-white/70 py-1.5 pl-1.5 pr-4 shadow-xl ring-1 ring-black/5 backdrop-blur">
      <button
        type="button"
        onClick={() => target && toggleLayerAnimation(target.layer)}
        disabled={!single}
        aria-pressed={isThis}
        aria-label={isThis ? 'Pause animation' : 'Animate layer'}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
      >
        {isThis ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="flex min-w-0 max-w-[13rem] flex-col leading-tight">
        <span
          title={single ? target!.title : undefined}
          className={`truncate text-sm font-semibold ${single ? 'text-slate-800' : 'text-slate-400'}`}
        >
          {text}
        </span>
        {isThis && label && (
          <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums text-slate-500">
            {label}
            {frameLoading && <Spinner />}
          </span>
        )}
      </div>
    </div>
  )
}
