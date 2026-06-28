## 1. Legend URL helper

- [x] 1.1 Add a `legendUrl(params: WmsLayerParams)` helper that builds the `GetLegendGraphic` URL from `wms_url` + `layer`

## 2. Render legends in LayerControl

- [x] 2.1 Under each active layer's row, render its legend `<img>` constrained to the panel width
- [x] 2.2 Hide the legend on image load error (`onError`)

## 3. Verify

- [x] 3.1 `npm run build` and `npm run lint` pass
- [x] 3.2 Live check: enable a layer (e.g. Cloud Mask, K-Index) → its color key appears under the row; disable → key disappears; layers without a legend show nothing and cause no layout bump — verified by the user
