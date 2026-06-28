// TypeScript mirror of the backend pydantic models
// (../meteo-aggregator/meteo_aggregator/models.py). Keep in sync with that file.

export type Role = 'general' | 'local'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

// A variable's reading: numeric for most, string for sunrise/sunset, null when
// a contributing model doesn't provide it. weather_code is a numeric WMO code.
export type DailyValue = number | string | null
export type DailyValues = Record<string, DailyValue>

export interface Location {
  latitude: number
  longitude: number
  name?: string | null
}

export interface Place {
  id?: number | null
  name: string
  latitude: number
  longitude: number
  country?: string | null
  country_code?: string | null
  admin1?: string | null
  timezone?: string | null
  population?: number | null
  elevation?: number | null
}

export interface Confidence {
  level: ConfidenceLevel
  low: number | null
  high: number | null
  spread: number | null
}

export interface ModelContribution {
  model: string
  role: Role
  values: DailyValues
}

export interface DayConsensus {
  date: string // YYYY-MM-DD
  lead_day: number
  values: DailyValues
  confidence: Confidence
  breakdown: ModelContribution[]
}

export interface AggregatedForecast {
  location: Location
  generated_at: string // ISO-8601 UTC
  days: DayConsensus[]
}

export interface HourConsensus {
  date: string // ISO-8601 timestamp
  lead_hour: number
  values: DailyValues
  confidence: Confidence
  breakdown: ModelContribution[]
}

export interface AggregatedHourlyForecast {
  location: Location
  generated_at: string
  hours: HourConsensus[]
}

export interface WmsLayerParams {
  wms_url: string
  layer: string
  title: string
  time: string | null // ISO-8601 UTC, pre-snapped to the layer's cadence; null = latest
  crs: string // "EPSG:3857"
  format: string // "image/png"
}

export interface SatelliteImagery {
  generated_at: string
  layers: WmsLayerParams[]
}
