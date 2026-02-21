import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api-gateway-6auawohmoa-el.a.run.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
