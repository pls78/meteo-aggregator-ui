## 1. Poll the imagery endpoint

- [x] 1.1 In `src/hooks/queries.ts`, add an `IMAGERY_REFETCH_MS` constant (60_000)
      and set `refetchInterval: IMAGERY_REFETCH_MS` on `useImagery`

## 2. Refresh overlay tiles when the frame advances

- [x] 2.1 In `MapView`, add a ref tracking each active layer's current tile URL
- [x] 2.2 In the WMS effect's `active && exists` branch, when `wmsTileUrl(params)`
      differs from the tracked URL, call `(getSource(id) as RasterTileSource).setTiles([url])`
      and update the tracked URL (keep the existing opacity update)
- [x] 2.3 Clear a layer's tracked URL when it is removed (the `!active && exists` branch)

## 3. Verify

- [x] 3.1 `npm run build` and `npm run lint` pass
- [x] 3.2 Live check (user): enable a fast layer (Lightning 5-min or IR Rapid
      Scan 5-min); confirm the overlay advances within ~a cadence step without
      re-toggling, and that dragging opacity does not flicker/reload
