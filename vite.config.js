import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',  // chạy FE trực tiếp trên root
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['harinezumi.myddns.me'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // backend container port đã expose
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
