// The full-screen map surface (MapLibre GL): CARTO Voyager vector basemap,
// click/Shift+click selection, primary/comparison markers, programmatic recenter,
// and satellite WMS overlays as raster sources.

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useAppStore } from '../../store/appStore'
import type { SelectedLocation } from '../../store/appStore'
import { useImagery } from '../../hooks/queries'
import type { WmsLayerParams } from '../../api/types'

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const ITALY_CENTER: [number, number] = [12.5, 42.5] // [lng, lat]
const PRIMARY_COLOR = '#2563eb'
const COMPARISON_COLOR = '#f59e0b'

// WMS GetMap tile template for a MapLibre raster source. v1.1.1 + srs + the
// {bbox-epsg-3857} token avoids WMS 1.3.0 axis-order pitfalls. time is omitted
// when null so the WMS serves the latest image.
function wmsTileUrl(params: WmsLayerParams): string {
  const base =
    `${params.wms_url}?service=WMS&version=1.1.1&request=GetMap` +
    `&layers=${encodeURIComponent(params.layer)}&styles=` +
    `&format=image/png&transparent=true&srs=EPSG:3857` +
    `&width=256&height=256&bbox={bbox-epsg-3857}`
  return params.time ? `${base}&time=${encodeURIComponent(params.time)}` : base
}

// If the click landed on a basemap place label, return that named place (using
// the label's own coordinates); otherwise null. A small pixel box makes labels
// easy to hit, and filtering by source-layer avoids depending on style layer ids.
function placeAtPoint(
  map: maplibregl.Map,
  point: { x: number; y: number },
): SelectedLocation | null {
  const pad = 5
  const box: [[number, number], [number, number]] = [
    [point.x - pad, point.y - pad],
    [point.x + pad, point.y + pad],
  ]
  for (const f of map.queryRenderedFeatures(box)) {
    if (f.sourceLayer !== 'place' || f.geometry.type !== 'Point') continue
    const props = f.properties ?? {}
    const name = props.name ?? props['name:en'] ?? props.name_en
    if (!name) continue
    const [lng, lat] = f.geometry.coordinates
    return { lat, lng, name: String(name) }
  }
  return null
}

// Add/move/remove a colored marker for a location slot. Returns the live marker.
function syncMarker(
  map: maplibregl.Map,
  marker: maplibregl.Marker | null,
  loc: SelectedLocation | null,
  color: string,
): maplibregl.Marker | null {
  if (!loc) {
    marker?.remove()
    return null
  }
  const m = marker ?? new maplibregl.Marker({ color })
  m.setLngLat([loc.lng, loc.lat]).addTo(map)
  return m
}

export function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const primaryMarker = useRef<maplibregl.Marker | null>(null)
  const comparisonMarker = useRef<maplibregl.Marker | null>(null)
  const [loaded, setLoaded] = useState(false)

  const { primary, comparison, focus, activeLayers, opacity, selectLocation } = useAppStore()
  const { data: imagery } = useImagery()

  // The click handler is attached once; read the latest selectLocation via a ref.
  const selectRef = useRef(selectLocation)
  selectRef.current = selectLocation

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: ITALY_CENTER,
      zoom: 5,
    })
    mapRef.current = map
    // MapLibre's default box-zoom (Shift+drag) intercepts the Shift modifier and
    // swallows Shift+click; disable it so Shift+click selects the comparison slot.
    map.boxZoom.disable()
    map.on('load', () => setLoaded(true))
    map.on('click', (e) => {
      const slot = e.originalEvent.shiftKey ? 'comparison' : 'primary'
      // Prefer a clicked place label (named); fall back to the raw coordinate.
      const loc: SelectedLocation =
        placeAtPoint(map, e.point) ?? { lat: e.lngLat.lat, lng: e.lngLat.lng }
      selectRef.current(loc, slot)
    })
    return () => {
      map.remove()
      mapRef.current = null
      primaryMarker.current = null
      comparisonMarker.current = null
      setLoaded(false)
    }
  }, [])

  // Markers (DOM overlays — no need to wait for style load).
  useEffect(() => {
    if (mapRef.current)
      primaryMarker.current = syncMarker(mapRef.current, primaryMarker.current, primary, PRIMARY_COLOR)
  }, [primary])

  useEffect(() => {
    if (mapRef.current)
      comparisonMarker.current = syncMarker(
        mapRef.current,
        comparisonMarker.current,
        comparison,
        COMPARISON_COLOR,
      )
  }, [comparison])

  // Recenter on search selection.
  useEffect(() => {
    const map = mapRef.current
    if (map && focus) {
      map.flyTo({ center: [focus.lng, focus.lat], zoom: Math.max(map.getZoom(), 8) })
    }
  }, [focus])

  // Satellite WMS overlays: add/remove raster sources and update opacity.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    for (const params of imagery?.layers ?? []) {
      const id = `wms-${params.layer}`
      const active = activeLayers.includes(params.layer)
      const exists = Boolean(map.getLayer(id))
      if (active && !exists) {
        map.addSource(id, { type: 'raster', tiles: [wmsTileUrl(params)], tileSize: 256 })
        map.addLayer({ id, type: 'raster', source: id, paint: { 'raster-opacity': opacity } })
      } else if (!active && exists) {
        map.removeLayer(id)
        map.removeSource(id)
      } else if (active && exists) {
        map.setPaintProperty(id, 'raster-opacity', opacity)
      }
    }
  }, [loaded, activeLayers, opacity, imagery])

  return <div ref={containerRef} className="map-container absolute inset-0" />
}
