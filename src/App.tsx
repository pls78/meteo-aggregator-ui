// App composition: full-screen map with overlaid search (top-left), layer control
// (bottom-left), and weather/comparison cards (top-right).

import { MapView } from './components/map/MapView'
import { SearchPanel } from './components/search/SearchPanel'
import { LayerControl } from './components/layers/LayerControl'
import { ComparisonPanel } from './components/compare/ComparisonPanel'
import { HourlyPanel } from './components/hourly/HourlyPanel'
import { MobileShell } from './components/mobile/MobileShell'
import { useIsMobile } from './hooks/useMediaQuery'

// Desktop overlay layout (≥ md): floating cards, inline layer panel, hourly sheet.
function DesktopOverlays() {
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
      </div>

      {/* Hourly detail sheet: full-width, anchored to the bottom, above the map. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1001] px-2">
        <div className="pointer-events-auto">
          <HourlyPanel />
        </div>
      </div>
    </>
  )
}

function App() {
  const isMobile = useIsMobile()
  return (
    <>
      <MapView />
      {isMobile ? <MobileShell /> : <DesktopOverlays />}
    </>
  )
}

export default App
