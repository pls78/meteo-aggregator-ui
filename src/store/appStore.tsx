// Client UI state (not server data): the primary and comparison locations, the
// set of active satellite overlay layers, and overlay opacity. Server data lives
// in React Query. Implemented as a small Context provider to avoid extra deps.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  selectedDay: string | null // YYYY-MM-DD of the day open in the hourly view (shared by both locations)
  activeSlot: Slot // which slot a plain map tap fills (mobile A/B target); desktop stays 'primary'
  aboutOpen: boolean // whether the info / "how it works" dialog is open (shared by both layouts)
  animating: boolean // whether the active overlays are playing a time-lapse loop
  frameIndex: number // current animation frame; 0 = newest, higher = older

  /** Plain click selects primary; Shift+click selects comparison. */
  selectLocation: (loc: SelectedLocation, slot: Slot) => void
  clearLocation: (slot: Slot) => void
  toggleLayer: (layer: string) => void
  setOpacity: (opacity: number) => void
  /** Start/stop the time-lapse loop; stopping snaps back to the newest frame. */
  toggleAnimating: () => void
  /** Set the current animation frame (driven by the map's animation clock). */
  setFrameIndex: (index: number) => void
  /** Request the map to recenter on a coordinate. */
  focusOn: (loc: LatLng) => void
  /** Open the hourly view for a day; selecting the already-open day closes it. */
  selectDay: (date: string) => void
  clearDay: () => void
  /** Choose which slot a plain map tap fills (mobile A/B target). */
  setActiveSlot: (slot: Slot) => void
  /** Open or close the info / "how it works" dialog. */
  setAboutOpen: (open: boolean) => void
}

const AppStoreContext = createContext<AppState | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [primary, setPrimary] = useState<SelectedLocation | null>(null)
  const [comparison, setComparison] = useState<SelectedLocation | null>(null)
  const [activeLayers, setActiveLayers] = useState<string[]>([])
  const [opacity, setOpacity] = useState(0.7)
  const [focus, setFocus] = useState<LatLng | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [activeSlot, setActiveSlot] = useState<Slot>('primary')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)

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

  const toggleAnimating = useCallback(() => {
    setAnimating((prev) => {
      if (prev) setFrameIndex(0) // stopping returns to the newest frame
      return !prev
    })
  }, [])

  const selectDay = useCallback(
    (date: string) => setSelectedDay((prev) => (prev === date ? null : date)),
    [],
  )
  const clearDay = useCallback(() => setSelectedDay(null), [])

  // The hourly view has nothing to show once no location is selected; close it.
  useEffect(() => {
    if (!primary && !comparison) setSelectedDay(null)
  }, [primary, comparison])

  // Nothing to animate without an active overlay; stop and reset to the newest frame.
  useEffect(() => {
    if (activeLayers.length === 0 && animating) {
      setAnimating(false)
      setFrameIndex(0)
    }
  }, [activeLayers, animating])

  // Without a comparison, a map tap can only mean the primary; keep the target there.
  useEffect(() => {
    if (!comparison) setActiveSlot('primary')
  }, [comparison])

  const value = useMemo<AppState>(
    () => ({
      primary,
      comparison,
      activeLayers,
      opacity,
      focus,
      selectedDay,
      activeSlot,
      aboutOpen,
      animating,
      frameIndex,
      selectLocation,
      clearLocation,
      toggleLayer,
      setOpacity,
      toggleAnimating,
      setFrameIndex,
      focusOn,
      selectDay,
      clearDay,
      setActiveSlot,
      setAboutOpen,
    }),
    [primary, comparison, activeLayers, opacity, focus, selectedDay, activeSlot, aboutOpen, animating, frameIndex, selectLocation, clearLocation, toggleLayer, toggleAnimating, focusOn, selectDay, clearDay],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore(): AppState {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
