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

// The full hourly week, fetched lazily — only when a day is open in the hourly
// view (`enabled`). Its own cache entry (hours=168) independent of the 24h
// `useHourly` used for current conditions.
export function useHourlyRange(
  loc: LatLng | null,
  { enabled }: { enabled: boolean },
  hours = 168,
) {
  return useQuery({
    queryKey: ['hourly', loc && round(loc.lat), loc && round(loc.lng), hours],
    queryFn: () => getHourly(loc!.lat, loc!.lng, hours),
    enabled: loc !== null && enabled,
    staleTime: 10 * 60_000,
  })
}

// Re-poll /imagery so active overlays track the latest cadence frame. The call is
// cheap (the backend computes WMS params, no upstream HTTP) and React Query's
// structural sharing makes an unchanged response between boundaries a no-op.
const IMAGERY_REFETCH_MS = 60_000

// Frames per layer to request, for the time-lapse animation (newest first). The
// span depends on each layer's cadence: e.g. 12 × 10 min = 2 h, × 15 min = 3 h.
export const IMAGERY_FRAMES = 12

export function useImagery() {
  return useQuery({
    queryKey: ['imagery', IMAGERY_FRAMES],
    queryFn: () => getImagery(undefined, IMAGERY_FRAMES),
    staleTime: IMAGERY_REFETCH_MS,
    refetchInterval: IMAGERY_REFETCH_MS,
  })
}
