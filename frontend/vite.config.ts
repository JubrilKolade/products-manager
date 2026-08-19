import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    // Proxy API requests to the backend, avoiding CORS in dev
    proxy: {
      '/api': {
        target: 'http://localhost:5113',
        changeOrigin: true,
      },
    },
  },
});