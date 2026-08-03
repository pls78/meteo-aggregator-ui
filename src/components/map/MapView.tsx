// The full-screen map surface (MapLibre GL): CARTO Positron vector basemap,
// click/Shift+click selection, primary/comparison markers, programmatic recenter,
// and satellite WMS overlays as raster sources.

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useAppStore } from '../../store/appStore'
import type { SelectedLocation } from '../../store/appStore'
import { useImagery, IMAGERY_FRAMES } from '../../hooks/queries'
import type { WmsLayerParams } from '../../api/types'
import { LOC_A, LOC_B } from '../../lib/accents'

// Time-lapse cadence: how long each animation frame is shown. 12 frames at
// ~550 ms ≈ a 6.5 s loop.
const FRAME_MS = 550

// Positron: near-grayscale ground so weather overlays, markers, and panels read
// as the foreground (the basemap recedes under data).
const STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
const ITALY_CENTER: [number, number] = [12.5, 42.5] // [lng, lat]

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

// True when the given frame source exists but hasn't finished loading its
// viewport tiles. Guards against a source removed mid-teardown (isSourceLoaded
// throws for an unknown id).
function frameStillLoading(map: maplibregl.Map, id: string | null): boolean {
  if (!id || !map.getSource(id)) return false
  return !map.isSourceLoaded(id)
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

  const { primary, comparison, focus, activeLayers, opacity, selectLocation, activeSlot, animatingLayer, frameIndex, setFrameIndex, setFrameLoading } =
    useAppStore()
  const { data: imagery } = useImagery()

  // Latest frame index for the animation clock, read without re-arming the interval.
  const frameIndexRef = useRef(frameIndex)
  frameIndexRef.current = frameIndex
  // The current frame's raster source id, so the tile-load watcher can report
  // whether the frame on screen is still fetching.
  const currentFrameSourceRef = useRef<string | null>(null)

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
      primaryMarker.current = syncMarker(mapRef.current, primaryMarker.current, primary, LOC_A)
  }, [primary])

  useEffect(() => {
    if (mapRef.current)
      comparisonMarker.current = syncMarker(
        mapRef.current,
        comparisonMarker.current,
        comparison,
        LOC_B,
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
  // (all tiles preloaded) and reveals the current frame via opacity, so the
  // time-lapse plays without re-fetching tiles each tick. To avoid a basemap
  // flash between frames, the incoming frame is moved on top and snapped to full
  // opacity instantly (its tiles are already loaded), while the outgoing frame
  // only fades out beneath it — so the new frame always covers before the old
  // one leaves, and no symmetric mid-swap dip lightens the overlay.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    const known = layerUrls.current

    const ensure = (
      id: string,
      time: string | null,
      op: number,
      transitionMs: number,
      params: WmsLayerParams,
    ) => {
      const url = wmsTileUrl(params, time)
      if (!map.getLayer(id)) {
        map.addSource(id, { type: 'raster', tiles: [url], tileSize: 256 })
        map.addLayer({
          id,
          type: 'raster',
          source: id,
          paint: {
            'raster-opacity': op,
            'raster-opacity-transition': { duration: transitionMs, delay: 0 },
          },
        })
        known[id] = url
      } else {
        if (known[id] !== url) {
          ;(map.getSource(id) as maplibregl.RasterTileSource | undefined)?.setTiles([url])
          known[id] = url
        }
        map.setPaintProperty(id, 'raster-opacity-transition', { duration: transitionMs, delay: 0 })
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

    let currentFrameId: string | null = null
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
        ensure(baseId, frames[0], opacity, 180, params)
      } else {
        remove(baseId)
        const idx = Math.min(frameIndex, frames.length - 1)
        for (let f = 0; f < frames.length; f++) {
          // Current frame snaps on instantly; the rest fade out (only the
          // just-shown one is actually changing, from full to 0).
          const isCur = f === idx
          ensure(`${baseId}-f${f}`, frames[f], isCur ? opacity : 0, isCur ? 0 : 380, params)
        }
        // A layer near its archive may have fewer frames than requested.
        for (let f = frames.length; f < IMAGERY_FRAMES; f++) remove(`${baseId}-f${f}`)
        currentFrameId = `${baseId}-f${idx}`
        // Keep the current frame on top so it covers the fading outgoing one.
        map.moveLayer(currentFrameId)
      }
    }

    // Report whether the frame now on screen still needs tiles (so the control
    // can show a spinner). isSourceLoaded is false until its viewport tiles land.
    currentFrameSourceRef.current = currentFrameId
    setFrameLoading(frameStillLoading(map, currentFrameId))
  }, [loaded, activeLayers, opacity, imagery, animatingLayer, frameIndex, setFrameLoading])

  // Keep the loading flag fresh as tiles arrive between clock ticks: re-check the
  // current frame's source whenever the map reports tile data or goes idle.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loaded) return
    const refresh = () => setFrameLoading(frameStillLoading(map, currentFrameSourceRef.current))
    map.on('sourcedata', refresh)
    map.on('idle', refresh)
    return () => {
      map.off('sourcedata', refresh)
      map.off('idle', refresh)
    }
  }, [loaded, setFrameLoading])

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
