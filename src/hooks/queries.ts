// React Query hooks over the typed API client. Forecast/hourly query keys use
// rounded coordinates so the same location is not refetched and the two compared
// locations cache independently.

import { useQuery } from '@tanstack/react-query'
import { getForecast, getHourly, getImagery, searchPlaces } from '../api/client'
import type { LatLng } from '../store/appStore'

// ~11 m precision is far finer than any model grid; rounding stabilizes cache keys.
const round = (n: number) => Math.round(n * 10000) / 10000

export function useSearch(query: string) {
  const name = query.trim()
  return useQuery({
    queryKey: ['search', name],
    queryFn: () => searchPlaces(name, { count: 8 }),
    enabled: name.length >= 2,
    staleTime: 5 * 60_000,
  })
}

export function useForecast(loc: LatLng | null, days = 7) {
  return useQuery({
    queryKey: ['forecast', loc && round(loc.lat), loc && round(loc.lng), days],
    queryFn: () => getForecast(loc!.lat, loc!.lng, days),
    enabled: loc !== null,
    staleTime: 10 * 60_000,
  })
}

export function useHourly(loc: LatLng | null, hours = 24) {
  return useQuery({
    queryKey: ['hourly', loc && round(loc.lat), loc && round(loc.lng), hours],
    queryFn: () => getHourly(loc!.lat, loc!.lng, hours),
    enabled: loc !== null,
    staleTime: 10 * 60_000,
  })
}

export function useImagery() {
  return useQuery({
    queryKey: ['imagery'],
    queryFn: () => getImagery(),
    staleTime: 5 * 60_000,
  })
}
