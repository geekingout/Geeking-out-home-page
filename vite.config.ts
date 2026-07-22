import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    // viteSingleFile inlines every JS/CSS asset into dist/index.html, so a build
    // produces one self-contained file that can be dropped on any static host.
    plugins: [react(), viteSingleFile()],
    build: {
      // Keep the emitted file readable-ish and avoid separate chunk files.
      assetsInlineLimit: 100000000,
      chunkSizeWarningLimit: 100000000,
      cssCodeSplit: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
