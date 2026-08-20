# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

General weather users — anyone checking the weather for a place they care about. Typical situations: a quick glance at today/this week for their current location (seeded by geolocation on load), looking up a destination by search or by clicking the map, and comparing two places side by side (trip planning, "here vs. there"). Used on both desktop and phones; the mobile layout is a first-class path, not a fallback.

## Product Purpose

A map-driven UI for aggregated multi-model weather forecasts. Click or search anywhere on a full-screen map to see a blended 7-day forecast, hour-by-hour detail per day, per-day confidence, and EUMETSAT satellite overlays. Success means a general user trusts and prefers this single blended forecast over checking one model (or several apps) — and can see why, via confidence tags and per-model breakdowns, without needing to.

## Positioning

Consensus is better: blending multiple weather models yields a more reliable single forecast than any one model alone. The aggregation itself is the product's value; the transparency features (confidence tags, per-model temperatures, blend weights, the "how it works" explanation) exist to support trust in that consensus, not as the headline.

## Operating Context

- Pure frontend (Vite + React 19 + TypeScript + Tailwind v4 + MapLibre GL) over the sibling FastAPI backend `../meteo-aggregator-api`, reached only via same-origin `/api` (Vite dev proxy locally; Cloudflare Pages Function in production). CORS is never involved by design.
- Live at <https://meteo-aggregator.pages.dev> as a capped free-tier demo (single backend instance, may be slow to wake); others can deploy their own backend and point the UI at it with one secret (`API_ORIGIN`).
- Data: Open-Meteo (forecasts, place search; CC-BY-4.0, non-commercial tier) via the backend; EUMETSAT WMS for satellite imagery (via the same-origin `/wms` proxy — EUMETSAT sends no CORS headers on tile images); CARTO Voyager / OpenStreetMap basemap. Sources are credited in the in-app "how it works" dialog.
- Spec-driven development via OpenSpec (`openspec/`); features go through change proposals, not ad hoc edits.

## Capabilities and Constraints

- Capabilities: location search; click-to-select on the map; Shift+click (desktop) / A-B target (mobile) two-location comparison; 7-day blended forecast with per-day confidence; per-day hourly chart (temperature + precipitation, both locations overlaid when comparing); per-day confidence detail (per-model temperatures, blend weights, plain-language explanation); toggleable satellite layers with time-lapse; in-app "how it works" page.
- Free-tier economics are a durable constraint: no paid APIs, keep the edge cache protecting the single backend instance, respect Open-Meteo's non-commercial terms.
- Keyless and no-auth, permanently: no accounts, no client API keys, no personalization or persistence beyond the session.
- Metric units only. No i18n. Map is locked north-up; the viewport is intentionally non-zoomable (`user-scalable=no`) because the map owns zoom.
- Two layouts (desktop overlays, mobile shell) intentionally duplicate presentation; behavior lives in the shared map/store/query layers.
- Backend contract (4 keyless GET endpoints) is owned by the sibling repo; `src/api/types.ts` must stay in sync with its pydantic models.

## Brand Commitments

- Visual direction (chosen 2026-08-02, standing; replaces the earlier canon pick the same day): **The Meteogram** — the scientific meteogram / ensemble-plume tradition. Paper-white data ground, ink hairlines, annotation-style labels; the consensus drawn as a bold stroke over the visible spread of per-model values, so uncertainty is shown, not just labeled. Consensus blue carries location A; a reserved red carries location B. The map (CARTO Positron) stays a quiet field under the data. Windy.com remains the craft bar.

## Evidence on Hand

- Real, working data end-to-end: live demo at meteo-aggregator.pages.dev; screenshots in `docs/screenshot-desktop.jpg` and `docs/screenshot-mobile.png`.
- The in-app About content (`src/components/about/aboutContent.ts`) transcribes the backend's real model list and blend weights — factual, must stay in sync with the backend.
- No testimonials, usage numbers, or third-party endorsements exist; future work must not fabricate any.

## Product Principles

1. The blend is the headline — present one trustworthy forecast first; per-model detail is a drill-down, never the default view.
2. Honest about uncertainty — confidence is shown, explained in plain language, and never overstated; no false precision.
3. The map is the interface — selecting, comparing, and layering happen on the map itself; panels annotate it rather than replace it.
4. Free to run, free to fork — every feature must survive free-tier hosting and keyless, no-auth operation.
5. Two layouts, one behavior — mobile and desktop may present differently but must never diverge in what the product does.

## Accessibility & Inclusion

WCAG-level accessibility is a real requirement, not best-effort: sufficient contrast (including text over the map and satellite overlays), keyboard operability of overlays/sheets/controls, and screen-reader support for the forecast content. The map canvas itself is inherently visual; ensure the forecast data it drives is fully available through the panels/sheets.
