// Presentation helpers for satellite layers derived from the backend /imagery
// response, shared by the map animation control and the info page.

export type Cadence = 'fast' | 'normal' | 'daily'

// Compact display name: drop any parenthetical "(…)" groups and everything from
// the first dash-delimited clause on, e.g. "Geo Colour RGB (day + night) – MTG"
// → "Geo Colour RGB", "IR 10.5 µm – MTG (cloud imagery)" → "IR 10.5 µm".
export function shortTitle(title: string): string {
  return title
    .replace(/\s*\([^)]*\)/g, '')
    .split(/\s+[–—-]\s+/)[0]
    .trim()
}

// Derive a layer's update cadence from the spacing of its frame timestamps
// (newest first). Returns null when there aren't two frames to measure.
export function cadenceFromTimes(times: (string | null)[] | undefined): {
  label: string
  kind: Cadence
} | null {
  if (!times || times.length < 2 || !times[0] || !times[1]) return null
  const minutes = Math.round((Date.parse(times[0]) - Date.parse(times[1])) / 60_000)
  if (!Number.isFinite(minutes) || minutes <= 0) return null

  const kind: Cadence = minutes >= 1440 ? 'daily' : minutes <= 5 ? 'fast' : 'normal'
  let label: string
  if (minutes >= 1440) label = minutes === 1440 ? 'Daily' : `${Math.round(minutes / 1440)} d`
  else if (minutes >= 60) label = `${Math.round(minutes / 60)} h`
  else label = `${minutes} min`
  return { label, kind }
}
