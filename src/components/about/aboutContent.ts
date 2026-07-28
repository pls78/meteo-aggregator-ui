// Static content for the info / "how it works" dialog. Figures here are transcribed
// from the backend config (../meteo-aggregator-api/meteo_aggregator/config.py) and the
// aggregation method (aggregation.py). Keep them in sync if the backend changes.

export interface Feature {
  title: string
  body: string
}

export const FEATURES: Feature[] = [
  { title: 'Point anywhere', body: 'Click the map or search a town. On first load it starts at your location, or a configured default.' },
  { title: 'Compare two places', body: 'Shift-click (or the A / B target on mobile) to hold a second location side by side.' },
  { title: 'Hour by hour', body: 'Tap a day for its hour-by-hour temperature line and precipitation bars; hover (or tap) a point for its exact value.' },
  { title: 'Consensus + confidence', body: 'Each day shows one blended value and a confidence tag; tap the tag to see every model’s temperature, its blend weight, and how the confidence was computed.' },
  { title: 'Live satellite layers', body: 'Toggle EUMETSAT imagery onto the map: cloud, dust, lightning, convection. Play a time-lapse of recent frames.' },
  { title: 'Metric & keyless', body: 'Metric units throughout. No account, no API keys; it talks straight to open weather services.' },
]

export interface Source {
  title: string
  body: string
  host: string
}

export const SOURCES: Source[] = [
  { title: 'Forecast API', body: 'Five numerical models in one call; see the table below.', host: 'api.open-meteo.com' },
  { title: 'Ensemble API', body: 'ICON ensemble spread feeds the confidence score.', host: 'ensemble-api.open-meteo.com' },
  { title: 'Geocoding API', body: 'Turns a place name into coordinates for the search box.', host: 'geocoding-api.open-meteo.com' },
  { title: 'EUMETView WMS', body: 'MTG and MSG satellite layers, fetched by your browser.', host: 'view.eumetsat.int' },
]

export type ModelRole = 'global' | 'local' | 'ml'

export interface ModelRow {
  name: string
  source: string
  kind: string
  role: ModelRole
  roleLabel: string
  resolution: string
  horizon: string
}

export const MODELS: ModelRow[] = [
  { name: 'ECMWF IFS', source: 'European Centre, physics', kind: 'Physics', role: 'global', roleLabel: 'Global', resolution: '25 km', horizon: '15 d' },
  { name: 'ECMWF AIFS', source: 'ECMWF machine-learning', kind: 'ML', role: 'ml', roleLabel: 'Global · ML', resolution: '25 km', horizon: '15 d' },
  { name: 'GFS', source: 'NOAA, physics', kind: 'Physics', role: 'global', roleLabel: 'Global', resolution: '11 km', horizon: '16 d' },
  { name: 'ICON', source: 'DWD, physics', kind: 'Physics', role: 'global', roleLabel: 'Global', resolution: '11 km', horizon: '7 d' },
  { name: 'ICON-2i', source: 'ItaliaMeteo ARPAE, high-res', kind: 'Physics', role: 'local', roleLabel: 'Local', resolution: '2 km', horizon: '3 d' },
]

export interface Weight {
  model: string
  weight: number
  local?: boolean
  absent?: string // set when the model is out of range for this table
}

// config.WEIGHTS_NEAR_TERM (lead days 0..2, i.e. days 1–3).
export const WEIGHTS_NEAR_TERM: Weight[] = [
  { model: 'ICON-2i', weight: 0.5, local: true },
  { model: 'ECMWF IFS', weight: 0.18 },
  { model: 'ECMWF AIFS', weight: 0.12 },
  { model: 'ICON', weight: 0.12 },
  { model: 'GFS', weight: 0.08 },
]

// config.WEIGHTS_RANGE (lead days 3+, i.e. days 4 onward). ICON-2i drops out (3-day horizon).
export const WEIGHTS_RANGE: Weight[] = [
  { model: 'ECMWF IFS', weight: 0.35 },
  { model: 'ECMWF AIFS', weight: 0.3 },
  { model: 'ICON', weight: 0.2 },
  { model: 'GFS', weight: 0.15 },
  { model: 'ICON-2i', weight: 0, absent: 'out of range' },
]

export type ConfLevel = 'high' | 'medium' | 'low'

export interface ConfidenceBand {
  level: ConfLevel
  label: string
  range: string
  note: string
}

// config.CONFIDENCE_HIGH_MAX = 1.5 °C, CONFIDENCE_MEDIUM_MAX = 3.5 °C (spread of next-day high temp).
export const CONFIDENCE: ConfidenceBand[] = [
  { level: 'high', label: 'High', range: '≤ 1.5 °C', note: 'models agree; narrow range' },
  { level: 'medium', label: 'Medium', range: '≤ 3.5 °C', note: 'some disagreement' },
  { level: 'low', label: 'Low', range: '> 3.5 °C', note: 'models diverge; treat as indicative' },
]

export interface LayerInfo {
  name?: string // short display name; falls back to shortTitle(API title)
  satellite: string
  description: string
}

// Editorial copy for the info page, keyed by the stable WMS layer id from
// GET /imagery. The layer *list* and each layer's *cadence* are derived from the
// live API response (see AboutDialog + lib/layerMeta); only the satellite and the
// human description live here. A layer id with no entry still renders via a
// fallback, so a new backend layer surfaces without a UI edit.
export const LAYER_INFO: Record<string, LayerInfo> = {
  'mtg_fd:rgb_geocolour': { name: 'Geo Colour RGB', satellite: 'MTG', description: 'True colour by day; infrared cloud tops and city lights by night.' },
  'mtg_fd:ir105_hrfi': { name: 'IR 10.5 µm', satellite: 'MTG', description: 'Cloud-top temperature: colder means higher, thicker cloud. Works in the dark.' },
  'mtg_fd:rgb_cloudphase': { name: 'Cloud Phase RGB', satellite: 'MTG', description: 'Separates ice cloud from water cloud, a cue for storm structure.' },
  'mtg_fd:rgb_dust': { name: 'Dust RGB', satellite: 'MTG', description: 'Tracks airborne Saharan dust as it moves across the region.' },
  'msg_fes:rgb_airmass': { name: 'Airmass RGB', satellite: 'MSG 0°', description: 'Warm, cold and dry air masses; reveals jet streaks and stratospheric intrusions.' },
  'msg_fes:rgb_convection': { name: 'Convection RGB', satellite: 'MSG 0°', description: 'Highlights intense updraughts and severe-storm potential.' },
  'mtg_fd:li_afa': { name: 'Lightning Flash Area', satellite: 'MTG', description: 'Live lightning activity from the MTG Lightning Imager.' },
  'msg_fes:clm': { name: 'Cloud Mask', satellite: 'MSG 0°', description: 'Where cloud is present versus clear sky.' },
  'msg_rss:ir039_nrt': { name: 'IR 3.9 µm Rapid Scan', satellite: 'MSG', description: 'Fog and low-cloud detection on a five-minute rapid scan.' },
}
