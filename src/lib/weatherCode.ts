// WMO weather interpretation codes -> drawn glyph kind + label.
// Reference: Open-Meteo WMO weather_code mapping. Rendering lives in
// components/weather/ (WeatherIcon / WeatherGlyph over the glyph set).

import type { GlyphKind } from '../components/weather/glyphs'

interface WeatherInfo {
  kind: GlyphKind
  label: string
}

const CODES: Record<number, WeatherInfo> = {
  0: { kind: 'sun', label: 'Clear sky' },
  1: { kind: 'sun-cloud', label: 'Mainly clear' },
  2: { kind: 'cloud-sun', label: 'Partly cloudy' },
  3: { kind: 'cloud', label: 'Overcast' },
  45: { kind: 'fog', label: 'Fog' },
  48: { kind: 'fog', label: 'Depositing rime fog' },
  51: { kind: 'drizzle', label: 'Light drizzle' },
  53: { kind: 'drizzle', label: 'Moderate drizzle' },
  55: { kind: 'drizzle', label: 'Dense drizzle' },
  56: { kind: 'sleet', label: 'Light freezing drizzle' },
  57: { kind: 'sleet', label: 'Dense freezing drizzle' },
  61: { kind: 'rain-sun', label: 'Slight rain' },
  63: { kind: 'rain', label: 'Moderate rain' },
  65: { kind: 'rain', label: 'Heavy rain' },
  66: { kind: 'sleet', label: 'Light freezing rain' },
  67: { kind: 'sleet', label: 'Heavy freezing rain' },
  71: { kind: 'snow', label: 'Slight snow' },
  73: { kind: 'snow', label: 'Moderate snow' },
  75: { kind: 'snowflake', label: 'Heavy snow' },
  77: { kind: 'snow', label: 'Snow grains' },
  80: { kind: 'rain-sun', label: 'Slight rain showers' },
  81: { kind: 'rain', label: 'Moderate rain showers' },
  82: { kind: 'rain', label: 'Violent rain showers' },
  85: { kind: 'snow', label: 'Slight snow showers' },
  86: { kind: 'snowflake', label: 'Heavy snow showers' },
  95: { kind: 'thunder', label: 'Thunderstorm' },
  96: { kind: 'thunder', label: 'Thunderstorm with slight hail' },
  99: { kind: 'thunder', label: 'Thunderstorm with heavy hail' },
}

const UNKNOWN: WeatherInfo = { kind: 'unknown', label: 'Unknown' }

export function weatherInfo(code: number | string | null | undefined): WeatherInfo {
  if (code === null || code === undefined) return UNKNOWN
  const n = typeof code === 'string' ? Number(code) : code
  return CODES[n] ?? UNKNOWN
}
