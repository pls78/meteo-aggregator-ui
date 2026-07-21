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

/** Which view the open day shows: its hourly chart, or its confidence detail. */
export type DayView = 'hourly' | 'confidence'

interface AppState {
  primary: SelectedLocation | null
  comparison: SelectedLocation | null
  activeLayers: string[] // WMS layer ids currently shown
  opacity: number // 0..1, applied to all overlays
  focus: LatLng | null // coordinate the map should recenter on (e.g. after search)
  selectedDay: string | null // YYYY-MM-DD of the day open in the expansion (shared by both locations)
  selectedDayView: DayView // whether the open day shows its hourly chart or its confidence detail
  activeSlot: Slot // which slot a plain map tap fills (mobile A/B target); desktop stays 'primary'
  aboutOpen: boolean // whether the info / "how it works" dialog is open (shared by both layouts)
  animatingLayer: string | null // the layer id currently playing a time-lapse, if any
  frameIndex: number // current animation frame; 0 = newest, higher = older
  frameLoading: boolean // whether the current animation frame's tiles are still loading

  /** Plain click selects primary; Shift+click selects comparison. */
  selectLocation: (loc: SelectedLocation, slot: Slot) => void
  clearLocation: (slot: Slot) => void
  toggleLayer: (layer: string) => void
  setOpacity: (opacity: number) => void
  /** Start/stop the time-lapse loop for a single layer; stopping snaps back to the newest frame. */
  toggleLayerAnimation: (layer: string) => void
  /** Set the current animation frame (driven by the map's animation clock). */
  setFrameIndex: (index: number) => void
  /** Report whether the current frame's tiles are still loading (driven by the map). */
  setFrameLoading: (loading: boolean) => void
  /** Request the map to recenter on a coordinate. */
  focusOn: (loc: LatLng) => void
  /** Open the hourly view for a day; selecting the already-open hourly day closes it. */
  selectDay: (date: string) => void
  /** Open the confidence detail for a day; re-selecting the already-open confidence day closes it. */
  showDayConfidence: (date: string) => void
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
  const [selectedDayView, setSelectedDayView] = useState<DayView>('hourly')
  const [activeSlot, setActiveSlot] = useState<Slot>('primary')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [animatingLayer, setAnimatingLayer] = useState<string | null>(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [frameLoading, setFrameLoading] = useState(false)

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

  const toggleLayerAnimation = useCallback((layer: string) => {
    setFrameIndex(0) // start (and stop) from the newest frame
    setAnimatingLayer((prev) => (prev === layer ? null : layer))
  }, [])

  // Tapping the day row (anywhere but the confidence label) opens the hourly view;
  // tapping the already-open hourly day toggles it closed.
  const selectDay = useCallback(
    (date: string) => {
      if (selectedDay === date && selectedDayView === 'hourly') {
        setSelectedDay(null)
      } else {
        setSelectedDay(date)
        setSelectedDayView('hourly')
      }
    },
    [selectedDay, selectedDayView],
  )

  // Tapping the confidence label opens the confidence detail in the same slot;
  // tapping the already-open confidence day toggles it closed.
  const showDayConfidence = useCallback(
    (date: string) => {
      if (selectedDay === date && selectedDayView === 'confidence') {
        setSelectedDay(null)
      } else {
        setSelectedDay(date)
        setSelectedDayView('confidence')
      }
    },
    [selectedDay, selectedDayView],
  )

  const clearDay = useCallback(() => {
    setSelectedDay(null)
    setSelectedDayView('hourly')
  }, [])

  // The expansion has nothing to show once no location is selected; close it.
  useEffect(() => {
    if (!primary && !comparison) {
      setSelectedDay(null)
      setSelectedDayView('hourly')
    }
  }, [primary, comparison])

  // If the animating layer is turned off, stop and reset to the newest frame.
  useEffect(() => {
    if (animatingLayer && !activeLayers.includes(animatingLayer)) {
      setAnimatingLayer(null)
      setFrameIndex(0)
    }
  }, [activeLayers, animatingLayer])

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
      selectedDayView,
      activeSlot,
      aboutOpen,
      animatingLayer,
      frameIndex,
      frameLoading,
      selectLocation,
      clearLocation,
      toggleLayer,
      setOpacity,
      toggleLayerAnimation,
      setFrameIndex,
      setFrameLoading,
      focusOn,
      selectDay,
      showDayConfidence,
      clearDay,
      setActiveSlot,
      setAboutOpen,
    }),
    [primary, comparison, activeLayers, opacity, focus, selectedDay, selectedDayView, activeSlot, aboutOpen, animatingLayer, frameIndex, frameLoading, selectLocation, clearLocation, toggleLayer, toggleLayerAnimation, focusOn, selectDay, showDayConfidence, clearDay],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore(): AppState {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
