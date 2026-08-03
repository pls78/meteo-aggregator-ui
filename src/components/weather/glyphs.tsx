// The drawn weather-glyph set: one 24×24 monoline drawing per condition family,
// in the chrome icon vocabulary (round caps, ~1.8px stroke). Structure strokes
// currentColor (set by the consumer, normally ink-600); precipitation marks use
// the precip token, solar marks the sun token — semantic mark colors only.
//
// Each glyph is a bare SVG fragment (no <svg> wrapper) so the same drawing can
// be wrapped by WeatherIcon or embedded inside another SVG (the hourly chart).

import type { ReactElement } from 'react'

export type GlyphKind =
  | 'sun'
  | 'sun-cloud'
  | 'cloud-sun'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain-sun'
  | 'rain'
  | 'sleet'
  | 'snow'
  | 'snowflake'
  | 'thunder'
  | 'unknown'

const SW = 1.8
const CLOUD = 'M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6 19z'

const cloud = (transform?: string, dash?: boolean, sw = SW): ReactElement => (
  <path
    d={CLOUD}
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    transform={transform}
    strokeDasharray={dash ? '2 2.6' : undefined}
  />
)

// Full sun: disc + 8 rays, in the sun token.
const sun = (cx: number, cy: number, r: number, rayLen: number): ReactElement => (
  <g stroke="var(--color-sun)" strokeWidth={SW} strokeLinecap="round" fill="none">
    <circle cx={cx} cy={cy} r={r} />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4
      const r1 = r + 2
      const r2 = r + 2 + rayLen
      return (
        <line
          key={i}
          x1={cx + r1 * Math.cos(a)}
          y1={cy + r1 * Math.sin(a)}
          x2={cx + r2 * Math.cos(a)}
          y2={cy + r2 * Math.sin(a)}
        />
      )
    })}
  </g>
)

// Rain drop: a short angled dash in the precip token.
const drop = (x: number, y: number): ReactElement => (
  <line
    key={`d${x}`}
    x1={x}
    y1={y}
    x2={x - 0.9}
    y2={y + 3}
    stroke="var(--color-precip)"
    strokeWidth={1.6}
    strokeLinecap="round"
  />
)

// Snowflake mini: three crossing strokes in the precip token.
const flake = (cx: number, cy: number, r = 2): ReactElement => (
  <g key={`f${cx}`} stroke="var(--color-precip)" strokeWidth={1.3} strokeLinecap="round">
    {[0, 60, 120].map((deg) => {
      const a = (deg * Math.PI) / 180
      return (
        <line
          key={deg}
          x1={cx - r * Math.cos(a)}
          y1={cy - r * Math.sin(a)}
          x2={cx + r * Math.cos(a)}
          y2={cy + r * Math.sin(a)}
        />
      )
    })}
  </g>
)

const bolt = (
  <path d="M12.6 11 9.4 16.4h2.3L10.4 21l4.9-6.2h-2.5l1.9-3.8z" fill="currentColor" stroke="none" />
)

// A cloud raised to leave room for falling marks beneath it.
const upCloud = cloud('translate(0 -2.5)')

export const GLYPHS: Record<GlyphKind, ReactElement> = {
  sun: <>{sun(12, 12, 4, 2.2)}</>,

  // Mainly clear: full sun with a small cloud tucked low-right.
  'sun-cloud': (
    <>
      {sun(10, 10, 3.3, 1.8)}
      {cloud('translate(10.5 10.5) scale(0.5)', false, 3.2)}
    </>
  ),

  // Partly cloudy: small sun up-right behind the big cloud.
  'cloud-sun': (
    <>
      {sun(17.5, 6.5, 2.4, 1.5)}
      {cloud()}
    </>
  ),

  cloud: <>{cloud()}</>,

  fog: (
    <>
      {cloud('translate(0 -4) scale(0.92) ')}
      <g stroke="currentColor" strokeWidth={SW} strokeLinecap="round">
        <line x1={6} y1={18.5} x2={18} y2={18.5} />
        <line x1={8} y1={21.5} x2={16} y2={21.5} />
      </g>
    </>
  ),

  drizzle: (
    <>
      {upCloud}
      {drop(10, 18.5)}
      {drop(14.5, 18.5)}
    </>
  ),

  // Sun shower: partly-cloudy structure with rain beneath.
  'rain-sun': (
    <>
      {sun(17.5, 6.5, 2.4, 1.5)}
      {upCloud}
      {drop(9.5, 18.5)}
      {drop(14, 18.5)}
    </>
  ),

  rain: (
    <>
      {upCloud}
      {drop(8.5, 18)}
      {drop(12.5, 18.5)}
      {drop(16.5, 18)}
    </>
  ),

  // Freezing rain/drizzle: one drop, one flake.
  sleet: (
    <>
      {upCloud}
      {drop(9.5, 18.5)}
      {flake(15, 19.8)}
    </>
  ),

  snow: (
    <>
      {upCloud}
      {flake(9.5, 19.5)}
      {flake(15, 19.5)}
    </>
  ),

  // Heavy snow: one large flake, no cloud.
  snowflake: (
    <g stroke="var(--color-precip)" strokeWidth={1.6} strokeLinecap="round">
      {[0, 60, 120].map((deg) => {
        const a = (deg * Math.PI) / 180
        return (
          <line
            key={deg}
            x1={12 - 7 * Math.cos(a)}
            y1={12 - 7 * Math.sin(a)}
            x2={12 + 7 * Math.cos(a)}
            y2={12 + 7 * Math.sin(a)}
          />
        )
      })}
      {[30, 90, 150, 210, 270, 330].map((deg) => {
        const a = (deg * Math.PI) / 180
        return (
          <line
            key={`t${deg}`}
            x1={12 + 3.2 * Math.cos(a)}
            y1={12 + 3.2 * Math.sin(a)}
            x2={12 + 4.8 * Math.cos(a)}
            y2={12 + 4.8 * Math.sin(a)}
          />
        )
      })}
    </g>
  ),

  thunder: (
    <>
      {upCloud}
      {bolt}
    </>
  ),

  unknown: <>{cloud(undefined, true)}</>,
}
