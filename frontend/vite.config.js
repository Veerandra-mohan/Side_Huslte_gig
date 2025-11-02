import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // Proxy all other requests to the backend to handle SPA routing
      '^/(?!api|@vite|src|node_modules).*': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});