import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  // Absolute Asset-Pfade statt relativ: mit base: './' zeigt ./assets/… von
  // vorgerenderten Unterseiten (z. B. /produkt/wax-500, /blog/<slug>,
  // /rewax) auf einen falschen, verschachtelten Pfad (/produkt/assets/…),
  // der 404 wirft. vercel.json fängt das per SPA-Rewrite ab und liefert
  // index.html statt JS/CSS zurück — der Browser verweigert das Modul wegen
  // falschem Content-Type, und die Seite bleibt leer. Betrifft jede Route,
  // die direkt aufgerufen statt per Client-Navigation erreicht wird.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
