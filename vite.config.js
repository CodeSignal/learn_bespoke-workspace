import { defineConfig } from 'vite';

export default defineConfig({
  root: './client',
  server: {
    hmr: true,
    allowedHosts: true,
    port: 3000,
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/simulations': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/message': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
