import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

const POLA_REACT =
  /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/
const POLA_ZOD = /node_modules[\\/]zod[\\/]/

/**
 * Pisahkan vendor besar ke chunk sendiri.
 * Catatan: Vite 8 (rolldown) hanya menerima manualChunks berbentuk fungsi.
 */
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined

  if (POLA_REACT.test(id)) return 'react-vendor'
  if (id.includes('@tanstack')) return 'query-vendor'
  if (id.includes('lucide-react')) return 'ui-vendor'
  if (
    id.includes('react-hook-form') ||
    id.includes('@hookform/resolvers') ||
    POLA_ZOD.test(id)
  ) {
    return 'form-vendor'
  }

  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: { manualChunks },
    },
  },
})