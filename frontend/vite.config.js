import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ecampus-mmi.onrender.com',
        changeOrigin: true,
        secure: true,
        headers: {
          // Forcer l'Origin et le Referer pour que Better Auth accepte la requête
          Origin: 'https://ecampus-mmi.onrender.com',
          Referer: 'https://ecampus-mmi.onrender.com/',
        }
      }
    }
  }
})

