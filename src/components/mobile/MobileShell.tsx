// The mobile overlay set, shown below the `md` breakpoint (see App + useIsMobile).
// Composes over the shared full-screen map: a top bar (search + A/B target), the
// draggable weather sheet, and the satellite-layers FAB/sheet.

import { MobileTopBar } from './MobileTopBar'
import { WeatherSheet } from './WeatherSheet'
import { MobileLayers } from './MobileLayers'
import { MapAnimateControl } from '../map/MapAnimateControl'
import { AboutButton } from '../about/AboutButton'
import { LocateButton } from '../locate/LocateButton'

export function MobileShell() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1000]">
      <MobileTopBar />
      <MobileLayers />
      {/* Right-side FAB stack under the Layers FAB (top-24): locate, then info. The locate
          button is placed by a wrapper rather than its own className, because it positions
          its failure message against itself. The stack sits ABOVE the weather sheet
          (z-1010): the sheet is full-width, so at any snap that reaches them a same-z
          control is simply swallowed. Locate and info act on the map, so they hide once
          the sheet has covered it (`--map-controls`); the Layers control does not — it
          is the only way to turn imagery off, and imagery reads through the sheet. */}
      <div
        className="pointer-events-auto absolute right-3 top-[9.5rem] z-[1010]"
        style={{ visibility: 'var(--map-controls, visible)' as React.CSSProperties['visibility'] }}
      >
        <LocateButton className="h-12 w-12" />
      </div>
      <div
        className="pointer-events-auto absolute right-3 top-[13rem] z-[1010]"
        style={{ visibility: 'var(--map-controls, visible)' as React.CSSProperties['visibility'] }}
      >
        <AboutButton className="h-12 w-12" />
      </div>
      {/* Time-lapse control, riding just above the weather sheet's top edge (it is the
          only way to pause a running time-lapse, so it must never end up behind it).
          `--weather-sheet`/`--map-controls` are published by WeatherSheet: the matching
          ease keeps the control glued to the sheet while dragging as well as while it
          settles, and it steps aside once the sheet has covered the map. */}
      <div
        className="absolute left-1/2 z-[1010] -translate-x-1/2"
        style={{
          visibility: 'var(--map-controls, visible)' as React.CSSProperties['visibility'],
          bottom: 'calc(var(--weather-sheet, 6rem) + 0.75rem)',
          transitionProperty: 'bottom',
          transitionDuration: 'var(--weather-sheet-ease, 0s)',
          transitionTimingFunction: 'cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <MapAnimateControl />
      </div>
      <WeatherSheet />
    </div>
  )
}
