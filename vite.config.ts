/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the project under /<repo>/ (the app uses HashRouter, so no server routing is needed)
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/taekwondo-learn-path/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
