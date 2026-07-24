// App composition: full-screen map with overlaid search (top-left), layer control
// (bottom-left), and weather/comparison cards (top-right).

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
import { useAppStore } from './store/appStore'

// Desktop overlay layout (≥ md): floating cards, inline layer panel, hourly sheet.
function DesktopOverlays() {
  // The time-lapse control floats bottom-centre whenever a layer is active. Lift
  // the detail sheet above it in that case so the sheet renders above the fixed
  // control instead of covering it; otherwise the sheet sits flush at the bottom.
  const { activeLayers } = useAppStore()
  const layerActive = activeLayers.length > 0
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

        <div className="pointer-events-auto absolute bottom-4 left-4">
          <LayerControl />
        </div>

        {/* Time-lapse control, centered along the bottom of the map (fixed here). */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <MapAnimateControl />
        </div>

        {/* Bottom-right stack, lifted above the map's attribution control: locate then info. */}
        <div className="pointer-events-auto absolute bottom-10 right-4 flex flex-col-reverse gap-2">
          <AboutButton className="h-10 w-10" />
          <LocateButton className="h-10 w-10" />
        </div>
      </div>

      {/* Hourly / confidence detail sheet, anchored to the bottom — lifted above
          the animate control when a layer is active so the control stays clear. */}
      <div
        className={`pointer-events-none absolute inset-x-0 z-[1001] px-2 ${
          layerActive ? 'bottom-20' : 'bottom-0'
        }`}
      >
        <div className="pointer-events-auto">
          <HourlyPanel />
        </div>
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
