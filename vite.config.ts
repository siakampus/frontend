import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": {
        target: "http://192.168.100.22:8000",
        changeOrigin: true,
      },
      "/admissiondata": {
        target: "http://192.168.100.22:8000",
        changeOrigin: true,
      },
      "/admin": {
        target: "http://192.168.100.22:8000",
        changeOrigin: true,
      },
      "/user": {
        target: "http://192.168.100.22:8000",
        changeOrigin: true,
      },
      "/admission-paths": {
        target: "http://192.168.100.22:8000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://192.168.100.22:8000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://192.168.100.22:8000",
        changeOrigin: true,
      },
    },
  },
})
