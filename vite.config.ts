import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
    // Tailwind is compiled at build time (no runtime CDN), and viteSingleFile inlines every JS/CSS
    // asset into dist/index.html, so a build produces one self-contained file for any static host.
    plugins: [react(), tailwindcss(), viteSingleFile()],
    build: {
        assetsInlineLimit: 100000000,
        chunkSizeWarningLimit: 100000000,
        cssCodeSplit: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
});
