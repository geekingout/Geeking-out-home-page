/**
 * Bakes each route's markup into the HTML file the build already emitted.
 *
 * Real paths made every page its own indexable URL, but the body still arrived
 * empty and was filled in by React — so a crawler had to execute the bundle to
 * see a word of the copy. Google does that; it does it slowly, and other
 * crawlers do it badly. After this step the words are simply in the file.
 *
 * The client hydrates the markup rather than replacing it, so nothing renders
 * twice.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');

const { render, routes } = await import(path.join(here, 'dist-ssr', 'entry-server.js'));

const fileFor = (route) => {
    if (route.path === '/404') return path.join(dist, '404.html');
    if (route.path === '/') return path.join(dist, 'index.html');
    return path.join(dist, route.path.slice(1), 'index.html');
};

const EMPTY_ROOT = '<div id="root"></div>';
let rendered = 0;

for (const route of routes) {
    const file = fileFor(route);
    const shell = fs.readFileSync(file, 'utf8');

    if (!shell.includes(EMPTY_ROOT)) {
        throw new Error(`prerender: no empty #root to fill in ${path.relative(here, file)}`);
    }

    const markup = render(route.path);
    fs.writeFileSync(file, shell.replace(EMPTY_ROOT, `<div id="root">${markup}</div>`));
    rendered++;
}

console.log(`prerendered ${rendered} route documents`);
