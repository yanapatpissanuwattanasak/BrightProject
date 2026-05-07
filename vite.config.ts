import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/tat-api': {
        target: 'https://tatdataapi.io/api/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tat-api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
          // admin bundle is code-split via React.lazy in pages/admin/
        },
      },
    },
  },
})
