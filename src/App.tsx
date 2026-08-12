// App composition: full-screen map with overlaid search (top-left), layer control
// (bottom-left), and weather/comparison cards (top-right).

import { useEffect, useRef, useState } from 'react'
import { MapView } from './components/map/MapView'
import { MapAnimateControl } from './components/map/MapAnimateControl'
import { SearchPanel } from './components/search/SearchPanel'
import { LayerControl } from './components/layers/LayerControl'
import { ComparisonPanel } from './components/compare/ComparisonPanel'
import { HourlyPanel } from './components/hourly/HourlyPanel'
import { MobileShell } from './components/mobile/MobileShell'
import { AboutDialog } from './components/about/AboutDialog'
import { AboutButton } from './components/about/AboutButton'
import { LocateButton } from './components/locate/LocateButton'
import { useIsMobile } from './hooks/useMediaQuery'
import { useInitialLocation } from './hooks/useInitialLocation'

// Desktop overlay layout (≥ md): floating cards, inline layer panel, hourly sheet.
function DesktopOverlays() {
  // The bottom controls (layer control, time-lapse control) must stay clear of
  // the detail sheet, whose size depends on its content (chart vs. confidence
  // columns vs. skeletons). Watch the sheet wrapper and lift each control above
  // it by transform only — but only when the centered panel actually reaches
  // that control's span; a narrow sheet (the confidence detail) can leave a
  // control at rest. The sheet wrapper spans the full width, so the observer
  // also refires on window resizes, when overlap can change; the control
  // wrappers are observed too, so a control appearing while the sheet is open
  // (activating a layer) lifts immediately. The sheet stays mounted through its
  // exit fade, so lifted controls glide back down with it.
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const layerCtrlRef = useRef<HTMLDivElement | null>(null)
  const animCtrlRef = useRef<HTMLDivElement | null>(null)
  const [layerLift, setLayerLift] = useState(0)
  const [animLift, setAnimLift] = useState(0)
  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    const measure = () => {
      const panel = el.querySelector('section')
      // Both controls sit at bottom-4; their 16px inset and the wanted 16px gap
      // above the sheet cancel, so the lift is exactly the sheet's height.
      // translateY leaves horizontal extents untouched, so the controls' rects
      // are valid even while lifted. 16px gap beside as above the sheet.
      const liftFor = (ctrl: HTMLDivElement | null) => {
        if (!panel || !ctrl || ctrl.getBoundingClientRect().width === 0) return 0
        const p = panel.getBoundingClientRect()
        const c = ctrl.getBoundingClientRect()
        const clear = p.left >= c.right + 16 || p.right <= c.left - 16
        return clear ? 0 : el.getBoundingClientRect().height
      }
      setLayerLift(liftFor(layerCtrlRef.current))
      setAnimLift(liftFor(animCtrlRef.current))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (layerCtrlRef.current) ro.observe(layerCtrlRef.current)
    if (animCtrlRef.current) ro.observe(animCtrlRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      {/* Overlays. The wrapper is click-through; children re-enable pointer events. */}
      <div className="pointer-events-none absolute inset-0 z-[1000] p-4">
        <div className="pointer-events-auto absolute left-4 top-4">
          <SearchPanel />
        </div>

        <div className="absolute right-4 top-4">
          <ComparisonPanel />
        </div>

        {/* Bottom-right stack, lifted above the map's attribution control: locate then info. */}
        <div className="pointer-events-auto absolute bottom-10 right-4 flex flex-col-reverse gap-2">
          <AboutButton className="h-10 w-10" />
          <LocateButton className="h-10 w-10" />
        </div>
      </div>

      {/* Hourly / confidence detail sheet, always flush at the bottom edge; the
          bottom controls lift themselves above it instead. */}
      <div ref={sheetRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-[1001] px-2">
        <div className="pointer-events-auto">
          <HourlyPanel />
        </div>
      </div>

      {/* Time-lapse control, centered along the bottom — lifted above the open
          detail sheet just like the layer control. Centering lives in the inline
          transform because it replaces Tailwind's translate classes. */}
      <div
        ref={animCtrlRef}
        className="pointer-events-none absolute bottom-4 left-1/2 z-[1002] transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translate(-50%, -${animLift}px)` }}
      >
        <MapAnimateControl />
      </div>

      {/* Layer control — lifted above the open detail sheet so they never overlap,
          returning to the bottom-left corner when the sheet closes. */}
      <div
        ref={layerCtrlRef}
        className="pointer-events-auto absolute bottom-4 left-4 z-[1002] transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: layerLift ? `translateY(-${layerLift}px)` : undefined }}
      >
        <LayerControl />
      </div>
    </>
  )
}

function App() {
  const isMobile = useIsMobile()
  useInitialLocation() // seed a location on load (geolocation, else configured default)
  return (
    <>
      <MapView />
      {isMobile ? <MobileShell /> : <DesktopOverlays />}
      <AboutDialog />
    </>
  )
}

export default App
