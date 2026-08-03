// Mobile top bar: a full-width search that targets the active slot, plus the A/B
// target control. A tap on the map fills whichever slot is active (see MapView +
// appStore.activeSlot). "+ Compare" seeds B from A and arms B for the next tap.

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { SearchBox } from '../search/SearchBox'
import { XIcon } from '../icons'
import { LOC_A, LOC_B } from '../../lib/accents'

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

  const accent = activeSlot === 'comparison' ? LOC_B : LOC_A

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
            className="panel flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold text-ink-600 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: LOC_B }} />
            + Compare a place
          </button>
        ) : (
          <div className="panel flex rounded-xl p-1">
            <button
              type="button"
              onClick={() => setActiveSlot('primary')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                activeSlot === 'primary' ? 'bg-loc-a/10 text-loc-a' : 'text-ink-600'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: LOC_A }} />A
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSlot('comparison')
                flashHint()
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                activeSlot === 'comparison' ? 'bg-loc-b/10 text-loc-b' : 'text-ink-600'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: LOC_B }} />B
              <span
                role="button"
                tabIndex={0}
                aria-label="Remove comparison"
                onClick={(e) => {
                  e.stopPropagation()
                  clearLocation('comparison')
                }}
                className="ml-1 grid h-5 w-5 place-items-center rounded text-ink-400 transition-colors hover:text-ink-600 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <XIcon className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        )}

        <span
          className={`rounded-full bg-ink-900 px-2.5 py-1 text-xs font-semibold text-white shadow-control transition-opacity ${
            hint ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Tap the map to set B
        </span>
      </div>
    </div>
  )
}
