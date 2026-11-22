/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the project under /<repo>/ (the app uses HashRouter, so no server routing is needed)
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/taekwondo-learn-path/' : '/',
  plugins: [react(), tailwindcss()],
  // local audio backend (start.sh / start.bat); absent on the static site, where the page falls back to WAV
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  test: {
    environment: 'jsdom',
    // server/*.test.mjs run with node:test (npm run test:server)
    exclude: [...configDefaults.exclude, 'server/**'],
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
