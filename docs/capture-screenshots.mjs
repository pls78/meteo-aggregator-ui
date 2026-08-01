// Regenerate the README screenshots (docs/screenshot-desktop.jpg, docs/screenshot-mobile.png).
//
// Playwright is deliberately not a dependency of this repo, so run it from a scratch
// directory — Node resolves the bare `playwright` import relative to this file, so the
// script has to be copied next to the install, not run in place:
//
//   mkdir -p /tmp/shots && cd /tmp/shots
//   npm init -y && npm i playwright && npx playwright install chromium   # needs Node >= 20
//   cp ~/…/meteo-aggregator-ui/docs/capture-screenshots.mjs .
//   node capture-screenshots.mjs [--headed] [--site https://…] [--city Milan]
//
// Writes desktop@2x.png (3200x2000) and mobile@2x.png (780x1688) to the cwd. Post-process
// before committing — the raw PNGs are several MB and image weight in git is permanent:
//
//   python3 - <<'PY'
//   from PIL import Image
//   d = Image.open("desktop@2x.png").convert("RGB").resize((1600, 1000), Image.LANCZOS)
//   d.save("screenshot-desktop.jpg", quality=92, subsampling=0, optimize=True, progressive=True)
//   m = Image.open("mobile@2x.png").convert("RGB")
//   m.quantize(colors=256).save("screenshot-mobile.png", optimize=True)
//   PY
//
// Desktop is JPEG because it is photographic (satellite imagery) — 256-colour PNG
// quantization shifts its blues to teal. Mobile is flat UI, where a quantized PNG is
// both sharper and smaller than the equivalent JPEG.
//
// PRIVACY — the reason this script exists rather than a hand-taken screenshot: the app
// seeds the viewer's real position from browser geolocation on load, and a location with
// no `name` renders as `lat.toFixed(3), lng.toFixed(3)` (see SearchBox.tsx). A naive
// capture therefore prints ~100 m home coordinates into a public git history. Two
// independent guards below: geolocation is stubbed out so the app falls back to
// DEFAULT_LOCATION (a town name already public in src/lib/config.ts), and the run then
// searches a city so every label is a place name.

import { chromium } from 'playwright'

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag)
  return i === -1 ? fallback : process.argv[i + 1]
}

const SITE = arg('--site', 'https://meteo-aggregator.pages.dev')
const CITY = arg('--city', 'Milan')
const HEADED = process.argv.includes('--headed')

// Fail getCurrentPosition immediately rather than wait out the app's 8s timeout.
const NO_GEOLOCATION = () => {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: (_ok, err) => err && err({ code: 1, message: 'denied' }),
      watchPosition: () => 0,
      clearWatch: () => {},
    },
    configurable: true,
  })
}

async function newPage(browser, viewport) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    permissions: [], // never grant geolocation
    locale: 'en-GB',
    timezoneId: 'Europe/Rome',
    colorScheme: 'light',
  })
  await ctx.addInitScript(NO_GEOLOCATION)
  const page = await ctx.newPage()
  // The backend runs at --max-instances 1 and may cold-start; be patient.
  page.setDefaultTimeout(60_000)
  return { ctx, page }
}

// Load the app and wait for the basemap to paint.
async function open(browser, viewport) {
  const { ctx, page } = await newPage(browser, viewport)
  await page.goto(SITE, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('canvas.maplibregl-canvas')
  await page.waitForTimeout(4000)
  return { ctx, page }
}

// Type a city into the search box and pick the first result, so the location carries
// a `name` and no label can fall back to raw coordinates.
async function search(page) {
  const box = page.getByPlaceholder('Search for a place').first()
  await box.click()
  await box.fill('')
  await box.type(CITY, { delay: 60 })
  const first = page.locator('ul li button', { hasText: CITY }).first()
  await first.waitFor()
  await first.click()
  await page.getByText(CITY, { exact: true }).first().waitFor()
}

async function desktop(browser) {
  const { ctx, page } = await open(browser, { width: 1600, height: 1000 })
  await search(page)
  await page.waitForTimeout(3000) // forecast fetch

  // Turn on the first satellite overlay and let its WMS tiles arrive.
  await page.getByRole('button', { name: 'Satellite layers' }).click()
  const layer = page.locator('input[type="checkbox"]').first()
  await layer.waitFor()
  await layer.check()
  await page.waitForTimeout(6000)

  await page.mouse.move(800, 500) // park the cursor off any hover target
  await page.screenshot({ path: 'desktop@2x.png' })
  console.log('desktop@2x.png')
  await ctx.close()
}

async function mobile(browser) {
  // Below the 768px useIsMobile threshold, so MobileShell renders.
  const { ctx, page } = await open(browser, { width: 390, height: 844 })
  await search(page)
  await page.waitForTimeout(5000) // WeatherSheet settles at its default 'half' snap
  await page.screenshot({ path: 'mobile@2x.png' })
  console.log('mobile@2x.png')
  await ctx.close()
}

const browser = await chromium.launch({
  headless: !HEADED,
  // Full Chromium, not headless-shell: MapLibre needs WebGL, via SwiftShader here.
  channel: 'chromium',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
try {
  await desktop(browser)
  await mobile(browser)
} finally {
  await browser.close()
}
