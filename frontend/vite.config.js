// frontend/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // Load .env files based on the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  const API_BASE_URL = env.VITE_API_BASE_URL || 'http://localhost:8000';

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    define: {
      // Makes env available in React code via import.meta.env
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(API_BASE_URL),
    },
  });
};
