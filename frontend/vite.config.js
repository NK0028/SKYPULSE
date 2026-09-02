import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'SkyPulse Weather',
        short_name: 'SkyPulse',
        description: 'Real-time weather intelligence',
        theme_color: '#302b63',
        background_color: '#0f0c29',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        // Default is 2 MB — raised to accommodate the Three.js
        // globe / charts / map bundle chunks below
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB

        runtimeCaching: [
          {
            // Matches /api/ on ANY origin — works for both
            // localhost:8000 in dev and the real Render URL
            // in production, since the origin is dynamic
            // (set via VITE_API_URL at build time).
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'skypulse-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30, // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        // Split heavy libraries into their own chunks so the
        // initial page load stays light — the globe, charts,
        // and map only download when the user actually
        // scrolls to those components.
        manualChunks: {
          'vendor-three'    : ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-charts'   : ['recharts'],
          'vendor-map'      : ['leaflet', 'react-leaflet'],
          'vendor-pdf'      : ['jspdf', 'html2canvas-pro'],
          'vendor-motion'   : ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // silence the warning for intentional vendor chunks
  },
})