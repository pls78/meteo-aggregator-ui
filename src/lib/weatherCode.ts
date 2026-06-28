// WMO weather interpretation codes -> emoji icon + label.
// Reference: Open-Meteo WMO weather_code mapping.

interface WeatherInfo {
  icon: string
  label: string
}

const CODES: Record<number, WeatherInfo> = {
  0: { icon: '☀️', label: 'Clear sky' },
  1: { icon: '🌤️', label: 'Mainly clear' },
  2: { icon: '⛅', label: 'Partly cloudy' },
  3: { icon: '☁️', label: 'Overcast' },
  45: { icon: '🌫️', label: 'Fog' },
  48: { icon: '🌫️', label: 'Depositing rime fog' },
  51: { icon: '🌦️', label: 'Light drizzle' },
  53: { icon: '🌦️', label: 'Moderate drizzle' },
  55: { icon: '🌧️', label: 'Dense drizzle' },
  56: { icon: '🌧️', label: 'Light freezing drizzle' },
  57: { icon: '🌧️', label: 'Dense freezing drizzle' },
  61: { icon: '🌦️', label: 'Slight rain' },
  63: { icon: '🌧️', label: 'Moderate rain' },
  65: { icon: '🌧️', label: 'Heavy rain' },
  66: { icon: '🌧️', label: 'Light freezing rain' },
  67: { icon: '🌧️', label: 'Heavy freezing rain' },
  71: { icon: '🌨️', label: 'Slight snow' },
  73: { icon: '🌨️', label: 'Moderate snow' },
  75: { icon: '❄️', label: 'Heavy snow' },
  77: { icon: '🌨️', label: 'Snow grains' },
  80: { icon: '🌦️', label: 'Slight rain showers' },
  81: { icon: '🌧️', label: 'Moderate rain showers' },
  82: { icon: '⛈️', label: 'Violent rain showers' },
  85: { icon: '🌨️', label: 'Slight snow showers' },
  86: { icon: '❄️', label: 'Heavy snow showers' },
  95: { icon: '⛈️', label: 'Thunderstorm' },
  96: { icon: '⛈️', label: 'Thunderstorm with slight hail' },
  99: { icon: '⛈️', label: 'Thunderstorm with heavy hail' },
}

const UNKNOWN: WeatherInfo = { icon: '❓', label: 'Unknown' }

export function weatherInfo(code: number | string | null | undefined): WeatherInfo {
  if (code === null || code === undefined) return UNKNOWN
  const n = typeof code === 'string' ? Number(code) : code
  return CODES[n] ?? UNKNOWN
}
