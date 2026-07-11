// App-level configuration constants (committed, non-secret).

import type { SelectedLocation } from '../store/appStore'

// Fallback location seeded on load when the browser's geolocation is
// unavailable, denied, or times out (see useInitialLocation). Mediglia, Italy.
export const DEFAULT_LOCATION: SelectedLocation = {
  lat: 45.3833,
  lng: 9.3167,
  name: 'Mediglia',
}
