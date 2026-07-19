// The full-screen map surface (MapLibre GL): CARTO Voyager vector basemap,
// click/Shift+click selection, primary/comparison markers, programmatic recenter,
// and satellite WMS overlays as raster sources.

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useAppStore } from '../../store/appStore'
import type { SelectedLocation } from '../../store/appStore'
import { useImagery, IMAGERY_FRAMES } from '../../hooks/queries'
import type { WmsLayerParams } from '../../api/types'

// Time-lapse cadence: how long each animation frame is shown. 12 frames at
// ~550 ms ≈ a 6.5 s loop.
const FRAME_MS = 550

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
const ITALY_CENTER: [number, number] = [12.5, 42.5] // [lng, lat]
const PRIMARY_COLOR = '#2563eb'
const COMPARISON_COLOR = '#f59e0b'

// WMS GetMap tile template for a MapLibre raster source. v1.1.1 + srs + the
// {bbox-epsg-3857} token avoids WMS 1.3.0 axis-order pitfalls. time is omitted
// when null so the WMS serves the latest image.
function wmsTileUrl(params: WmsLayerParams, time: string | null): string {
  const base =
    `${params.wms_url}?service=WMS&version=1.1.1&request=GetMap` +
    `&layers=${encodeURIComponent(params.layer)}&styles=` +
    `&format=image/png&transparent=true&srs=EPSG:3857` +
    `&width=256&height=256&bbox={bbox-epsg-3857}`
  return time ? `${base}&time=${encodeURIComponent(time)}` : base
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
  // Current tile URL per active WMS layer id, so tiles are re-fetched only when a
  // layer's snapped frame time actually advances — not on every opacity change.
  const layerUrls = useRef<Record<string, string>>({})

  const { primary, comparison, focus, activeLayers, opacity, selectLocation, activeSlot, animatingLayer, frameIndex, setFrameIndex } =
    useAppStore()
  const { data: imagery } = useImagery()

  // Latest frame index for the animation clock, read without re-arming the interval.
  const frameIndexRef = useRef(frameIndex)
  frameIndexRef.current = frameIndex

  // The click handler is attached once; read the latest values via refs.
  const selectRef = useRef(selectLocation)
  selectRef.current = selectLocation
  const activeSlotRef = useRef(activeSlot)
  activeSlotRef.current = activeSlot

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
    // Keep the map north-up: disable rotation (drag-rotate and the two-finger
    // twist) and the accompanying pitch so stray touch gestures can't tilt/spin it.
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.touchPitch.disable()
    map.keyboard.disableRotation()
    map.on('load', () => setLoaded(true))
    map.on('click', (e) => {
      // Desktop: Shift picks comparison, else primary (activeSlot stays 'primary').
      // Mobile: the A/B control sets activeSlot, so a plain tap fills the chosen slot.
      const slot = e.originalEvent.shiftKey ? 'comparison' : activeSlotRef.current
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

  // Satellite WMS overlays. Static mode shows one raster layer per active overlay
  // (its newest frame). Animation mode instead mounts one raster layer per frame
  // (all tiles preloaded) and reveals only the current frame via opacity, so the
  // time-lapse plays without re-fetching tiles each tick. A short raster-opacity
  // transition cross-fades between frames: the outgoing frame lingers while the
  // incoming one appears, so the basemap never shows through between frames.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    const known = layerUrls.current

    const ensure = (id: string, time: string | null, op: number, params: WmsLayerParams) => {
      const url = wmsTileUrl(params, time)
      if (!map.getLayer(id)) {
        map.addSource(id, { type: 'raster', tiles: [url], tileSize: 256 })
        map.addLayer({
          id,
          type: 'raster',
          source: id,
          paint: {
            'raster-opacity': op,
            'raster-opacity-transition': { duration: 220, delay: 0 },
          },
        })
        known[id] = url
      } else {
        if (known[id] !== url) {
          ;(map.getSource(id) as maplibregl.RasterTileSource | undefined)?.setTiles([url])
          known[id] = url
        }
        map.setPaintProperty(id, 'raster-opacity', op)
      }
    }
    const remove = (id: string) => {
      if (map.getLayer(id)) {
        map.removeLayer(id)
        map.removeSource(id)
        delete known[id]
      }
    }

    for (const params of imagery?.layers ?? []) {
      const baseId = `wms-${params.layer}`
      const active = activeLayers.includes(params.layer)
      const isAnimating = animatingLayer === params.layer
      const frames = params.times?.length ? params.times : [params.time]

      if (!active) {
        remove(baseId)
        for (let f = 0; f < IMAGERY_FRAMES; f++) remove(`${baseId}-f${f}`)
      } else if (!isAnimating) {
        // Single newest-frame layer; tear down any leftover frame stack.
        for (let f = 0; f < IMAGERY_FRAMES; f++) remove(`${baseId}-f${f}`)
        ensure(baseId, frames[0], opacity, params)
      } else {
        remove(baseId)
        const idx = Math.min(frameIndex, frames.length - 1)
        for (let f = 0; f < frames.length; f++) {
          ensure(`${baseId}-f${f}`, frames[f], f === idx ? opacity : 0, params)
        }
        // A layer near its archive may have fewer frames than requested.
        for (let f = frames.length; f < IMAGERY_FRAMES; f++) remove(`${baseId}-f${f}`)
      }
    }
  }, [loaded, activeLayers, opacity, imagery, animatingLayer, frameIndex])

  // Animation clock: while a layer is playing, step the frame oldest→newest and
  // loop. The interval is re-armed only when the animating layer changes; the
  // current index is read via a ref so ticks stay 550 ms apart.
  useEffect(() => {
    if (!animatingLayer) return
    const id = window.setInterval(() => {
      setFrameIndex((frameIndexRef.current - 1 + IMAGERY_FRAMES) % IMAGERY_FRAMES)
    }, FRAME_MS)
    return () => window.clearInterval(id)
  }, [animatingLayer, setFrameIndex])

  return <div ref={containerRef} className="map-container absolute inset-0" />
}
