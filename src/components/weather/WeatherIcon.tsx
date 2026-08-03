// Hosts for the drawn weather glyphs (see glyphs.tsx). WeatherIcon is the normal
// HTML-context host; WeatherGlyph returns the bare fragment for embedding inside
// another SVG (the hourly chart) via <g transform>.

import { weatherInfo } from '../../lib/weatherCode'
import { GLYPHS } from './glyphs'

type Code = number | string | null | undefined

export function WeatherIcon({ code, className = 'h-[18px] w-[18px]' }: { code: Code; className?: string }) {
  const { kind, label } = weatherInfo(code)
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={label} className={`shrink-0 ${className}`}>
      {GLYPHS[kind]}
    </svg>
  )
}

export function WeatherGlyph({ code }: { code: Code }) {
  return GLYPHS[weatherInfo(code).kind]
}
