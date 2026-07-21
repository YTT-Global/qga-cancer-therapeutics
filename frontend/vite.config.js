import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sets base path to root for local dev, and sub-path folder for organization deployment
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    base: command === 'serve' ? '/' : '/qga-cancer-therapeutics/',
  }
})
