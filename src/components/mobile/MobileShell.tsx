// The mobile overlay set, shown below the `md` breakpoint (see App + useIsMobile).
// Composes over the shared full-screen map: a top bar (search + A/B target), the
// draggable weather sheet, and the satellite-layers FAB/sheet.

import { MobileTopBar } from './MobileTopBar'
import { WeatherSheet } from './WeatherSheet'
import { MobileLayers } from './MobileLayers'

export function MobileShell() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1000]">
      <MobileTopBar />
      <MobileLayers />
      <WeatherSheet />
    </div>
  )
}
