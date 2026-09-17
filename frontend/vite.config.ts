import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The tool is deployed under this base path on Doctor Gemma's Cloudflare Worker.
export default defineConfig({
  base: '/special-interest-countdown-timer/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
})
