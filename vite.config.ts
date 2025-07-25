import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copy } from 'fs-extra';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/merlins-grimoire/' : '/',
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
  },
  publicDir: 'assets',
  plugins: [
    {
      name: 'copy-assets',
      async closeBundle() {
        await copy('assets', 'dist/assets', {
          overwrite: true
        });
      }
    }
  ]
}); 