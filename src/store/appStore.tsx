// Client UI state (not server data): the primary and comparison locations, the
// set of active satellite overlay layers, and overlay opacity. Server data lives
// in React Query. Implemented as a small Context provider to avoid extra deps.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface LatLng {
  lat: number
  lng: number
}

export interface SelectedLocation extends LatLng {
  name?: string
}

export type Slot = 'primary' | 'comparison'

interface AppState {
  primary: SelectedLocation | null
  comparison: SelectedLocation | null
  activeLayers: string[] // WMS layer ids currently shown
  opacity: number // 0..1, applied to all overlays
  focus: LatLng | null // coordinate the map should recenter on (e.g. after search)

  /** Plain click selects primary; Shift+click selects comparison. */
  selectLocation: (loc: SelectedLocation, slot: Slot) => void
  clearLocation: (slot: Slot) => void
  toggleLayer: (layer: string) => void
  setOpacity: (opacity: number) => void
  /** Request the map to recenter on a coordinate. */
  focusOn: (loc: LatLng) => void
}

const AppStoreContext = createContext<AppState | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [primary, setPrimary] = useState<SelectedLocation | null>(null)
  const [comparison, setComparison] = useState<SelectedLocation | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>([])
  const [opacity, setOpacity] = useState(0.7)
  const [focus, setFocus] = useState<LatLng | null>(null)

  // New object identity each call so the map recenters even on the same coords.
  const focusOn = useCallback((loc: LatLng) => setFocus({ lat: loc.lat, lng: loc.lng }), [])

  const selectLocation = useCallback((loc: SelectedLocation, slot: Slot) => {
    if (slot === 'comparison') setComparison(loc)
    else setPrimary(loc)
  }, [])

  const clearLocation = useCallback((slot: Slot) => {
    if (slot === 'comparison') setComparison(null)
    else setPrimary(null)
  }, [])

  const toggleLayer = useCallback((layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    )
  }, [])

  const value = useMemo<AppState>(
    () => ({
      primary,
      comparison,
      activeLayers,
      opacity,
      focus,
      selectLocation,
      clearLocation,
      toggleLayer,
      setOpacity,
      focusOn,
    }),
    [primary, comparison, activeLayers, opacity, focus, selectLocation, clearLocation, toggleLayer, focusOn],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore(): AppState {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
