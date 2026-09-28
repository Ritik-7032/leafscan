import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.svg', 'model/**/*', 'tips.json'],
      manifest: {
        name: 'LeafScan - Vegetable Leaf Disease Detector',
        short_name: 'LeafScan',
        description: 'Lightweight on-device vegetable leaf disease detector powered by deep learning',
        theme_color: '#059669',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB to cache TF.js chunks
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|json|bin)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leafscan-model-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-tfjs': ['@tensorflow/tfjs'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['lucide-react', 'react-parallax-tilt', 'canvas-confetti']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
