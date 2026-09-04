import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The game API runs beside Vite in dev; proxying keeps the browser same-origin
// so there is no CORS layer to re-create when this moves to a hosted database.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.GAME_API_PORT ?? 8787}`,
        changeOrigin: true,
      },
    },
  },
})
