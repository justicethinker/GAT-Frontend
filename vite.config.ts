import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  preview: {
    allowedHosts: ["godslovetrading.com"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '^/auth': {
        target: process.env.VITE_BACKEND_URL || 'https://gat-zm1r.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '^/dash': {
        target: process.env.VITE_BACKEND_URL || 'https://gat-zm1r.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '^/arb': {
        target: process.env.VITE_BACKEND_URL || 'https://gat-zm1r.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
