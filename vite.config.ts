import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/silent-metronome/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Silent Metronome',
        short_name: 'Metronome',
        description: 'A silent visual metronome',
        start_url: '/silent-metronome/',
        scope: '/silent-metronome/',
        display: 'standalone',
        theme_color: '#1c1713',
        background_color: '#1c1713',
        icons: [
          {
            src: 'icons/lyre192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/lyre512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/lyremascable512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})