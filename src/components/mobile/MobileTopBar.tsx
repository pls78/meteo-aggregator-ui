// Mobile top bar: a full-width search that targets the active slot, plus the A/B
// target control. A tap on the map fills whichever slot is active (see MapView +
// appStore.activeSlot). "+ Compare" seeds B from A and arms B for the next tap.

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { SearchBox } from '../search/SearchBox'

const PRIMARY = '#2563eb'
const COMPARISON = '#f59e0b'

export function MobileTopBar() {
  const { primary, comparison, activeSlot, setActiveSlot, selectLocation, clearLocation } =
    useAppStore()
  const [hint, setHint] = useState(false)
  const hintTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(hintTimer.current), [])

  function flashHint() {
    setHint(true)
    window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHint(false), 2600)
  }

  function addCompare() {
    if (!primary) return
    selectLocation({ ...primary }, 'comparison') // seed B from A, then re-place by tapping
    setActiveSlot('comparison')
    flashHint()
  }

  const accent = activeSlot === 'comparison' ? COMPARISON : PRIMARY

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex flex-col gap-2 p-3">
      <div className="pointer-events-auto">
        <SearchBox slot={activeSlot} accent={accent} className="w-full" />
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        {!comparison ? (
          <button
            type="button"
            onClick={addCompare}
            disabled={!primary}
            className="flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-lg backdrop-blur disabled:opacity-40"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COMPARISON }} />
            + Compare a place
          </button>
        ) : (
          <div className="flex rounded-xl bg-white/80 p-1 shadow-lg ring-1 ring-black/5 backdrop-blur">
            <button
              type="button"
              onClick={() => setActiveSlot('primary')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ${
                activeSlot === 'primary' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIMARY }} />A
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSlot('comparison')
                flashHint()
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ${
                activeSlot === 'comparison' ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COMPARISON }} />B
              <span
                role="button"
                tabIndex={0}
                aria-label="Remove comparison"
                onClick={(e) => {
                  e.stopPropagation()
                  clearLocation('comparison')
                }}
                className="ml-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </span>
            </button>
          </div>
        )}

        <span
          className={`rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg transition-opacity ${
            hint ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Tap the map to set B
        </span>
      </div>
    </div>
  )
}
