import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'lucide-react']
        }
      }
    },
    // Éviter les erreurs de dépendances manquantes
    commonjsOptions: {
      include: [/recharts/, /react-is/, /node_modules/]
    }
  },
  // Configuration pour le développement
  optimizeDeps: {
    include: ['react-is', 'recharts']
  }
})
