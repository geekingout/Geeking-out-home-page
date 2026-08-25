import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { PAGES, NOT_FOUND, SITE_ORIGIN, hrefFor, type PageDef } from './routes';

/**
 * Writes a real index.html into every route directory after the bundle is built.
 *
 * The site uses real paths so each page is its own indexable document. On a
 * static host that normally needs a rewrite rule teaching the server to serve
 * index.html for unknown paths — easy to forget, and different on every host.
 * Emitting the files instead means /services is an actual file: it works
 * unchanged on S3, nginx, GitHub Pages, Netlify or a USB stick, and a crawler
 * hitting it reads that page's own title, description and canonical without
 * having to run any JavaScript first.
 */
const emitRoutePages = (): Plugin => ({
    name: 'geekingout:emit-route-pages',
    apply: 'build',
    // The SSR pass builds entry-server.tsx into dist-ssr and has no HTML to patch.
    applyToEnvironment: (env) => env.name === 'client',
    closeBundle() {
        if (this.environment?.name === 'ssr') return;
        const outDir = path.resolve(__dirname, 'dist');
        const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');

        // Only ever rewrite inside <head>. The bundle below it is untouched.
        const splitAt = shell.indexOf('</head>');
        const head = shell.slice(0, splitAt);
        const body = shell.slice(splitAt);

        const withMeta = (page: PageDef) => {
            const url = `${SITE_ORIGIN}${hrefFor(page.canonical ?? page.path)}`;
            const swap = (pattern: RegExp, replacement: string) => {
                patched = patched.replace(pattern, replacement);
            };
            let patched = head;

            swap(/<title>[\s\S]*?<\/title>/, `<title>${page.doc}</title>`);
            swap(/(<meta name="description" content=")[^"]*(")/, `$1${page.desc}$2`);
            swap(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
            swap(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
            swap(/(<meta property="og:title" content=")[^"]*(")/, `$1${page.doc}$2`);
            swap(/(<meta property="og:description" content=")[^"]*(")/, `$1${page.desc}$2`);
            swap(/(<meta property="twitter:url" content=")[^"]*(")/, `$1${url}$2`);
            swap(/(<meta property="twitter:title" content=")[^"]*(")/, `$1${page.doc}$2`);
            swap(/(<meta property="twitter:description" content=")[^"]*(")/, `$1${page.desc}$2`);
            if (page.noIndex) {
                swap(/(<meta name="robots" content=")[^"]*(")/, '$1noindex, follow$2');
            }
            return patched + body;
        };

        for (const page of PAGES) {
            const dir = page.path === '/' ? outDir : path.join(outDir, page.path.slice(1));
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, 'index.html'), withMeta(page));
        }

        // Hosts that support a custom 404 document will serve this; the app renders
        // its own not-found screen and the reader can navigate on from there.
        fs.writeFileSync(path.join(outDir, '404.html'), withMeta(NOT_FOUND));

        const indexable = PAGES.filter(p => !p.noIndex);
        const sitemap = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...indexable.map(p => `  <url><loc>${SITE_ORIGIN}${hrefFor(p.path)}</loc></url>`),
            '</urlset>',
            '',
        ].join('\n');
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);

        fs.writeFileSync(
            path.join(outDir, 'robots.txt'),
            `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`
        );

        // For the Plesk/Apache side. Apache's DirectorySlash already redirects /services
        // to /services/, so routing needs nothing here — this is the 404 document and
        // cache headers. Inert if the vhost is served by nginx.
        fs.writeFileSync(path.join(outDir, '.htaccess'), [
            'ErrorDocument 404 /404.html',
            '',
            '<IfModule mod_headers.c>',
            '  # Asset filenames carry a content hash, so they can be cached forever.',
            '  <FilesMatch "\\.(js|css|woff2?)$">',
            '    Header set Cache-Control "public, max-age=31536000, immutable"',
            '  </FilesMatch>',
            '  # The HTML must revalidate, or a deploy goes unnoticed.',
            '  <FilesMatch "\\.html$">',
            '    Header set Cache-Control "public, max-age=0, must-revalidate"',
            '  </FilesMatch>',
            '</IfModule>',
            '',
            '<IfModule mod_deflate.c>',
            '  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/xml image/svg+xml',
            '</IfModule>',
            '',
        ].join('\n'));

        const emitted = PAGES.length + 1;
        this.warn(`emitted ${emitted} route documents, sitemap.xml, robots.txt and .htaccess`);
    },
});

export default defineConfig({
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    // vite-plugin-singlefile is gone: with real paths the build emits one HTML per
    // route, and inlining the bundle into each would ship the same ~800 kB ten times
    // over with no caching between pages. One shared asset is both smaller and faster.
    plugins: [react(), emitRoutePages()],
    build: {
      cssCodeSplit: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
});
