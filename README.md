# Geeking Out Agency — Home Page

Marketing site for Geeking Out, LLC. React + TypeScript, built with Vite, styled with
Tailwind. Twelve pages on real paths, pre-rendered to static HTML.

## Where things live

| file | holds |
|---|---|
| [App.tsx](App.tsx) | the pages: home sections, every inner page, the contact form, the app shell |
| [nav.tsx](nav.tsx) | routing, `RouteLink`, header, footer, closing CTA, chapter pager, phone bar, scroll/reveal hooks |
| [showcase.tsx](showcase.tsx) | the pinned product showcase and its seven live vignettes |
| [hero-sky.ts](hero-sky.ts) | the home hero's WebGL skyline (two raw shaders, no three.js) |
| [content.ts](content.ts) | every word on the site — services, products, team, quotes, FAQ, legal |
| [arcade-cabinets.tsx](arcade-cabinets.tsx) | the four canvas games |
| [routes.ts](routes.ts) | the route table, shared by the app and the build |
| [styles.css](styles.css) | design tokens, type, buttons, header tones, arcade chrome |

## Design

The look is the September 2026 mockup, applied to every page: warm paper (`#FAF8F5`) with
near-black bands (`#0D0908`), one vivid orange (`#FF5A1F`, plus a lit and an ink step for
text on dark and on light), Barlow for reading, Barlow Condensed in caps for display, IBM
Plex Mono for labels. Tokens are named in [tailwind.config.js](tailwind.config.js) so the
markup says `text-ink-3` or `bg-night`, never a hex.

Every page opens on a dark band. The sticky header watches for `[data-dark]` sections
passing under it and flips between its dark and light tones by attribute; the CSS for both
lives in `styles.css` under `.site-header`.

There is no dark-mode toggle: the dark and light bands are part of the design rather than
a preference.

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

1. `vite build` — the client bundle (~314 kB, one JS and one CSS asset). A plugin in [vite.config.ts](vite.config.ts) then writes
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
- **`overflow-x: hidden` goes on `<html>` only.** Putting it on `<body>` too makes the body
  its own scroll container, and every `position: sticky` on the page — the header, the
  pinned product visual — silently stops sticking. The app root clips the x axis instead.
- **The WebGL context is never forced lost on unmount.** React's development double-mount
  reuses the same canvas, and a context that was made lost cannot compile a shader; the
  hero would fall back to CSS every time under `vite dev`. The canvas is discarded with
  the page on navigation, which is disposal enough.
- **Tailwind's scanner only reads the files listed in `content`.** Add any new source
  module there or its classes will be missing from the build.

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

The form is reachable from the hero buttons, the header "Get In Touch" button, the closing
CTA on every page, the phone's bottom bar, and each service row's "Discuss this service" —
the last prefills it through React state rather than the URL, so nobody's project
description lands in a history entry.

## Runtime dependencies

Bundled: React. Fetched at runtime: Google Fonts only. There is no icon font and no
animation library — reveals are an IntersectionObserver, the scroll choreography is a
handful of `getBoundingClientRect` reads coalesced to one per frame, and the hero is two
hand-written shaders.

All entrance animation is skipped under `prefers-reduced-motion`, the product vignettes hold
still, and the hero's render loop idles when off-screen or backgrounded.
