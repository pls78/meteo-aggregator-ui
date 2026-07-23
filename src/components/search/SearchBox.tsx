// Debounced place-name search over GET /search for a single location slot
// (primary or comparison). Selecting a result sets that slot's location and
// recenters the map. The input reflects the slot's current location label.

import { useEffect, useState } from 'react'
import { useSearch } from '../../hooks/queries'
import { useAppStore } from '../../store/appStore'
import type { Slot, SelectedLocation } from '../../store/appStore'
import type { Place } from '../../api/types'

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

function placeLabel(p: Place): string {
  return [p.name, p.admin1, p.country].filter(Boolean).join(', ')
}

function locationLabel(loc: SelectedLocation | null): string {
  if (!loc) return ''
  return loc.name ?? `${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)}`
}

interface Props {
  slot: Slot
  accent: string
  onRemove?: () => void
  /** Outer width/box classes; defaults to the desktop fixed width. */
  className?: string
}

export function SearchBox({ slot, accent, onRemove, className = 'w-80 max-w-[80vw]' }: Props) {
  const { primary, comparison, selectLocation, focusOn } = useAppStore()
  const location = slot === 'comparison' ? comparison : primary

  const [query, setQuery] = useState(() => locationLabel(location))
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const debounced = useDebounced(query)
  const { data: results, isFetching } = useSearch(debounced)

  // Reflect external location changes (the "+" copy, Shift+click, map clicks) in
  // the input, but never while the user is actively typing in it.
  const label = locationLabel(location)
  useEffect(() => {
    if (!focused) setQuery(label)
  }, [label, focused])

  function choose(p: Place) {
    const loc = { lat: p.latitude, lng: p.longitude, name: p.name }
    selectLocation(loc, slot)
    focusOn(loc)
    setQuery(placeLabel(p))
    setOpen(false)
  }

  const showResults = open && focused && debounced.trim().length >= 2

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white/75 px-3 py-2 shadow-lg backdrop-blur focus-within:border-blue-500">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full"
          style={{ background: accent }}
          aria-hidden
        />
        <input
          type="text"
          value={query}
          placeholder="Search for a place…"
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            setFocused(true)
            setOpen(true)
          }}
          onBlur={() => setFocused(false)}
          className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none md:text-sm"
        />
        {onRemove && (
          <button
            type="button"
            aria-label="Remove comparison"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRemove}
            className="shrink-0 cursor-pointer text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        )}
      </div>
      {showResults && (
        <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl">
          {isFetching && <li className="px-3 py-2 text-sm text-slate-500">Searching…</li>}
          {!isFetching && results && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">No results</li>
          )}
          {results?.map((p) => (
            <li key={`${p.id ?? `${p.latitude},${p.longitude}`}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(p)}
                className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-slate-800 hover:bg-blue-50"
              >
                {placeLabel(p)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
