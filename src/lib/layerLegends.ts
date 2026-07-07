// Static colour keys for RGB composite overlays. These layers have no usable WMS
// legend (GetLegendGraphic returns only a ~20x20 blank placeholder), because an
// RGB composite encodes meaning in colour *mixing*, not a linear scale.
// Interpretations follow EUMETSAT's standard RGB "quick guides". Keyed by the
// backend layer id (WmsLayerParams.layer). Layers absent here fall back to their
// WMS legend image (see LayerControl).

export interface LegendSwatch {
  color: string
  label: string
}

export interface LayerLegendInfo {
  /** Short prose hint for photographic composites with no discrete colour key. */
  note?: string
  /** Discrete colour → meaning entries. */
  swatches?: LegendSwatch[]
}

export const RGB_LEGENDS: Record<string, LayerLegendInfo> = {
  'mtg_fd:rgb_geocolour': {
    note: 'True colour by day; IR cloud tops & city lights by night.',
  },
  'mtg_fd:rgb_dust': {
    note: 'Tracks Saharan dust.',
    swatches: [
      { color: '#e06be0', label: 'Airborne dust' },
      { color: '#3fb24a', label: 'Thick ice cloud' },
      { color: '#c9a45c', label: 'Cloud-free surface' },
    ],
  },
  'msg_fes:rgb_airmass': {
    swatches: [
      { color: '#3fb24a', label: 'Warm / tropical air' },
      { color: '#3e7bd6', label: 'Cold polar air' },
      { color: '#d14a3a', label: 'Dry, ozone-rich (jet / stratosphere)' },
    ],
  },
  'msg_fes:rgb_convection': {
    swatches: [
      { color: '#f2d338', label: 'Intense updraughts (severe storms)' },
      { color: '#e38b2e', label: 'Thick high cloud' },
      { color: '#35c4e8', label: 'Thin ice cloud' },
    ],
  },
  'mtg_fd:rgb_cloudphase': {
    swatches: [
      { color: '#35c4e8', label: 'Ice cloud' },
      { color: '#3fb24a', label: 'Water cloud' },
      { color: '#2f3b52', label: 'Clear / land' },
    ],
  },
}
