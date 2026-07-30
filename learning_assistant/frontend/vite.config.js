import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg",
        "assets/*.pdf",
      ],
      manifest: {
        name: "EduHelp Offline-First Learning Assistant",
        short_name: "EduHelp",
        description:
          "Zero-Data Learning Platform for Classrooms With or Without Connection",
        theme_color: "#0f172a",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Cache static web assets (HTML, JS, CSS, SVG, PDF)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,pdf,woff2}"],
        runtimeCaching: [
          // 1. Stale-While-Revalidate for Web Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          // 2. Cache-First Strategy for Educational PDFs & Heavy Documents
          {
            urlPattern: /\.(?:pdf|png|jpg|jpeg|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "course-materials-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 Days Retention
              },
            },
          },
        ],
      },
    }),
  ],
});
