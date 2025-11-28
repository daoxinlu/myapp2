import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for GitHub Pages compatibility
  server: {
    host: true, // bind to 0.0.0.0 so the dev server is reachable on the LAN
    port: 5173,
    strictPort: false
  },
  build: {
    rollupOptions: {
      external: ['@google/genai']
    }
  }
})