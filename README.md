# Geeking Out Agency — Home Page

Marketing site for Geeking Out, LLC. React + TypeScript, built with Vite, styled with
Tailwind. Twelve pages on real paths, pre-rendered to static HTML.

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm run dev      # http://localhost:3000
```

No API keys or `.env` file are needed.

## Deployment — read this before wiring up anything new

**geekingout.net is served by Plesk, from the `deploy` branch. That is the live site.**

```
merge to main
  └─ .github/workflows/deploy.yml
       ├─ npm ci, tsc --noEmit, npm run build
       ├─ sanity-checks the pre-rendered output
       ├─ force-pushes dist/ to the `deploy` branch
       └─ POSTs the Plesk webhook (repo secret PLESK_DEPLOY_HOOK)
            └─ Plesk pulls `deploy` into /httpdocs
```

About a minute, merge to live. **A merge to `main` is a production deploy**, not just a
commit.

Notes:

- **`deploy` is not a feature branch.** It holds build output only — no `package.json`, no
  source — and is force-pushed on every build. Never edit it by hand or delete it. Rolling
  back means re-running the workflow from an older commit, not reverting on `deploy`.
- Any CI that tries to *build* the `deploy` branch will fail, because there is nothing there
  to build. That is expected, not a broken build.
- To publish without CI: `npm run build`, then upload the whole **`dist/` folder** to
  `/httpdocs`. Not a single file — see below.

## Build

```bash
npm run build    # -> dist/  (~2.4 MB: one JS + one CSS asset, one HTML per route)
npm run preview  # serve the built site at http://localhost:4173
```

Three stages, in order:

1. `vite build` — the client bundle. A plugin in [vite.config.ts](vite.config.ts) then writes
   an `index.html` into every route directory with that route's `<title>`, description and
   canonical patched into the `<head>`, plus `404.html`, `sitemap.xml`, `robots.txt` and an
   Apache `.htaccess`.
2. `vite build --ssr entry-server.tsx` — the same app, built for Node.
3. `node prerender.mjs` — renders each route with `renderToString` and injects the markup
   into the file from step 1.

The result is a static folder where every URL is a real file whose content and metadata are
readable without executing any JavaScript. The client hydrates that markup rather than
replacing it.

### Things that will bite you

- **Every browser API must stay inside an effect or an event handler.** Effects do not run
  during `renderToString`, which is the only reason the tree renders in Node at all. A
  `window.` or `document.` reference at render time breaks the build, not just the page.
- **URLs carry a trailing slash on purpose** (`/services/`). The build emits
  `dist/services/index.html`, and the trailing slash is what makes a static host resolve it
  by directory index with no rewrite rule. Without it, hosts that fall back to the root
  document serve the home page's title and canonical under every URL.
  [routes.ts](routes.ts) `hrefFor()` is the only place that decides this.
- **[routes.ts](routes.ts) is imported by both the app and the build.** Keep it that way:
  separate copies of the route table would drift, and a page would quietly ship with the
  wrong canonical.
- **Tailwind is compiled, not loaded from a CDN**, because pre-rendered markup would
  otherwise paint before the CDN generated any styles. In [styles.css](styles.css) the depth
  system sits *between* `@tailwind components` and `@tailwind utilities`. Utilities must come
  last — the app assumes a utility beats a component class. Reverse it and `.panel`'s
  `position: relative` starts beating `.absolute`.
- **Tailwind's scanner cannot see classes assembled at runtime.** The product showcase turns
  `text-brand-*` into `bg-brand-*`, so those live in `safelist` in
  [tailwind.config.js](tailwind.config.js).

## Routing

Hash-free, History API, hand-rolled in [App.tsx](App.tsx) — no router dependency.

`/` `/services/` `/products/` `/philosophy/` `/team/` `/process/` `/faq/` `/arcade/`
`/contact/` `/terms/` `/privacy/` and a 404.

Two older URL schemes redirect on arrival: the original one-page anchors (`#services`) and
the hash router that briefly replaced them (`#/services`).

## Contact form → Google Sheets

The `/contact/` page is the only data path in the site. On submit it POSTs JSON to a Google
Apps Script web app, which appends a row to a spreadsheet.

The endpoint lives in `GOOGLE_SHEETS_WEBHOOK_URL` at the top of [App.tsx](App.tsx). The
payload:

| field | example |
|---|---|
| `timestamp` | `7/22/2026, 3:05:43 PM` |
| `source` | `Contact Form` |
| `name` | `Casey Rivera` |
| `email` | `casey@example.com` |
| `description` | the project text |
| `projectDescription` | same text, duplicated so either column name works |
| `organization` | `Pawsome Grooming` |

Two things worth knowing:

- The request is sent `mode: 'no-cors'`, which Google Apps Script web apps require. The
  response is therefore opaque — the site can tell that the request left the browser, but
  **not** that the script wrote the row. The success screen reflects the former.
- For the same reason `Content-Type` must be a CORS-safelisted value, so the body goes out as
  `text/plain`. Apps Script reads it via `e.postData.contents` regardless.

The form is reachable from the hero input (which prefills the project field), the header
"Get In Touch" button, the closing CTA on every page, the mobile nav rocket, and each service
modal's "Discuss This Service" — the last two prefill it through React state rather than the
URL, so nobody's project description lands in a history entry.

## Runtime dependencies

Bundled: React, Three.js. Fetched at runtime: Google Fonts, FontAwesome and GSAP, the last
two SRI-pinned in [index.html](index.html). GSAP drives the scroll choreography and is
guarded — if it fails to load the page is simply static, never blank.

All entrance animation is skipped under `prefers-reduced-motion`, and both canvas loops idle
when off-screen or backgrounded.
