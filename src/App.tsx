// App composition: full-screen map with overlaid search (top-left), layer control
// (bottom-left), and weather/comparison cards (top-right).

import { MapView } from './components/map/MapView'
import { SearchPanel } from './components/search/SearchPanel'
import { LayerControl } from './components/layers/LayerControl'
import { ComparisonPanel } from './components/compare/ComparisonPanel'

function App() {
  return (
    <>
      <MapView />

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
    </>
  )
}

export default App
