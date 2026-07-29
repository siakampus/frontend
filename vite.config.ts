import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Memuat env berdasarkan mode dan direktori saat ini
  const env = loadEnv(mode, process.env.PWD || process.cwd(), '')

  // Mengambil variabel dari env atau menggunakan fallback default ke localhost
  const API_TARGET = env.VITE_PUBLIC_API_URL
  const PORT = env.VITE_PUBLIC_PORT ? parseInt(env.VITE_PUBLIC_PORT, 10) : 5173

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // ──────────────────────────────────────────────────────────
    // Build hardening — production only
    // ──────────────────────────────────────────────────────────
    build: {
      // Strip all console.* and debugger statements from the production bundle
      minify: 'esbuild',
      // No source maps in production (prevents source code exposure)
      sourcemap: false,
      rollupOptions: {
        output: {
          // Obfuscate chunk names — no route/file names leaked
          chunkFileNames: 'assets/[hash].js',
          entryFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
        },
      },
    },

    // Strip console.* only in production builds
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

    // Expose ZERO env variables to the browser bundle by default.
    // Any variable that must be public MUST be explicitly listed here.
    // Never add secrets here — use server-side env vars for those.
    envPrefix: 'VITE_PUBLIC_',

    server: {
      // ── Tunnel / public sharing support ───────────────────────────────────
      // Bind to all interfaces so cloudflared can forward traffic.
      host: true,
      port: PORT,
      // Allow any hostname — required for *.trycloudflare.com URLs.
      // Vite ≥5 blocks unrecognised Host headers by default (HTTP host-header
      // injection protection). Setting this to true disables that check so
      // that the tunnel URL works without a static allow-list.
      allowedHosts: true,
      proxy: {
        "/auth": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/admissiondata": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/user": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/admission-paths": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/courses": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/assignments": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/materials": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/chat": {
          target: API_TARGET,
          changeOrigin: true,
          bypass(req) {
            if (req.headers.accept?.includes("text/html")) return "/index.html";
          },
        },
        "/lecturer": {
          target: API_TARGET,
          changeOrigin: true,
          bypass(req) {
            if (req.headers.accept?.includes("text/html")) return "/index.html";
          },
        },
        "/admin": {
          target: API_TARGET,
          changeOrigin: true,
          bypass(req) {
            if (req.headers.accept?.includes("text/html")) return "/index.html";
          },
        },
        "/api/auth": {
          target: API_TARGET,
          changeOrigin: true,
          headers: {
            Origin: `http://localhost:${PORT}`
          }
        },
        "/api": {
          target: API_TARGET,
          changeOrigin: true,
          headers: {
            Origin: `http://localhost:${PORT}`
          }
        },
        "/jurusan": {
          target: API_TARGET,
          changeOrigin: true,
        },
        "/health": {
          target: API_TARGET,
          changeOrigin: true,
        },
      },
    },

    // Security headers for the preview server (vite preview)
    preview: {
      headers: {
        // Prevent clickjacking
        'X-Frame-Options': 'DENY',
        // Prevent MIME sniffing
        'X-Content-Type-Options': 'nosniff',
        // Force HTTPS
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        // Restrict referrer info
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        // Disable browser features not needed
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        // Content Security Policy
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob:",
          `connect-src 'self' ${API_TARGET} https://*.trycloudflare.com`,
          "frame-src https://challenges.cloudflare.com",
          "object-src 'none'",
          "base-uri 'self'",
        ].join('; '),
      },
    },
  }
})