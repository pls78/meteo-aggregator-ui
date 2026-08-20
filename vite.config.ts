import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Dev-only: proxy /api -> the FastAPI backend so the browser talks to Vite's
  // own origin (same-origin, no CORS in development). The target is config-only
  // and is NOT exposed in the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_PROXY_TARGET || 'http://localhost:8000'
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Backend serves bare paths (/search, /forecast, …) — strip the /api prefix.
        '/api': {
          target,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
        // Satellite tiles/legends: same-origin /wms -> EUMETSAT, because their
        // GetMap responses lack CORS headers and MapLibre fetches tiles in CORS
        // mode. Production does the same via functions/wms.js.
        '/wms': {
          target: 'https://view.eumetsat.int',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/wms/, '/geoserver/wms'),
        },
      },
    },
  }
})
