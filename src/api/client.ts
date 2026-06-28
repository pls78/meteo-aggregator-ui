// Thin typed client over the meteo-aggregator FastAPI backend.
// Base URL comes from VITE_API_BASE_URL (see .env). No logic here beyond
// building the request and parsing JSON; throws on non-OK responses.

import type {
  AggregatedForecast,
  AggregatedHourlyForecast,
  Place,
  SatelliteImagery,
} from './types'

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
).replace(/\/$/, '')

async function getJson<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`${path} failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export function searchPlaces(
  name: string,
  opts: { count?: number; language?: string } = {},
): Promise<Place[]> {
  return getJson<Place[]>('/search', { name, count: opts.count, language: opts.language })
}

export function getForecast(
  lat: number,
  lon: number,
  days?: number,
): Promise<AggregatedForecast> {
  return getJson<AggregatedForecast>('/forecast', { lat, lon, days })
}

export function getHourly(
  lat: number,
  lon: number,
  hours?: number,
): Promise<AggregatedHourlyForecast> {
  return getJson<AggregatedHourlyForecast>('/hourly', { lat, lon, hours })
}

export function getImagery(time?: string): Promise<SatelliteImagery> {
  return getJson<SatelliteImagery>('/imagery', { time })
}
