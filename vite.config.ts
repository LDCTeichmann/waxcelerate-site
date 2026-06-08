import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/gsap/')) return 'gsap';
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor';
            if (id.includes('/d3-delaunay/') || id.includes('/delaunator/') || id.includes('/robust-predicates/')) return 'd3';
            if (id.includes('/lucide-react/')) return 'icons';
          }
        },
      },
    },
  },
});
