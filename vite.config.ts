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
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/admissiondata": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/user": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/admission-paths": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/courses": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/assignments": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/chat": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/lecturer": {
        target: "http://localhost:8000",
        changeOrigin: true,
        bypass(req) {
          // Browser page navigation → let React Router handle it
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        },
      },
      "/admin": {
        target: "http://localhost:8000",
        changeOrigin: true,
        bypass(req) {
          // Browser page navigation → let React Router handle it
          if (req.headers.accept?.includes("text/html")) return "/index.html";
        },
      },
      "/api/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})
