// The mobile overlay set, shown below the `md` breakpoint (see App + useIsMobile).
// Composes over the shared full-screen map: a top bar (search + A/B target), the
// draggable weather sheet, and the satellite-layers FAB/sheet.

import { MobileTopBar } from './MobileTopBar'
import { WeatherSheet } from './WeatherSheet'
import { MobileLayers } from './MobileLayers'
import { AboutButton } from '../about/AboutButton'
import { LocateButton } from '../locate/LocateButton'

export function MobileShell() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1000]">
      <MobileTopBar />
      <MobileLayers />
      {/* Right-side FAB stack under the Layers FAB (top-24): locate, then info. */}
      <LocateButton className="pointer-events-auto absolute right-3 top-[9.5rem] z-[1000] h-12 w-12" />
      <AboutButton className="pointer-events-auto absolute right-3 top-[13rem] z-[1000] h-12 w-12" />
      <WeatherSheet />
    </div>
  )
}
