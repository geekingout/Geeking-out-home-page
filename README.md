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
npm run build    # -> dist/  (~360 kB: one JS + one CSS asset, one HTML per route)
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
Apps Script web app, which validates the lead, appends a row to the "geeking out landing
page" spreadsheet and answers with JSON. The success screen only shows once that answer
says the row was written; anything else shows an error and a "Try again" button that
resends the same lead.

The script's source is [apps-script/Code.gs](apps-script/Code.gs), with deployment notes
at the top of the file. The endpoint URL lives in `LEAD_ENDPOINT` at the top of
[App.tsx](App.tsx). The payload:

| field | example |
|---|---|
| `source` | `Contact Form` |
| `name` | `Casey Rivera` |
| `email` | `casey@example.com` |
| `organization` | `Pawsome Grooming` |
| `description` | the project text |
| `submissionId` | a UUID minted when the form opens, reused on retries |
| `elapsedMs` | milliseconds between opening the form and sending |
| `website` | honeypot; always empty for a person |

The script answers `{ ok: true, id }` (or `duplicate: true` for a retry of a lead it already
has), `{ ok: false, code: 'validation', fields }` for bad input, or `{ ok: false, code,
error }` for anything else. The timestamp in the sheet is the server's, not the browser's.

Things worth knowing:

- The body goes out as `text/plain` so the request stays "simple" and needs no CORS
  preflight — Apps Script answers through a redirect that cannot handle one. The response
  is readable because Apps Script sends `Access-Control-Allow-Origin: *`.
- Submissions that trip the honeypot, arrive in under three seconds, look like the bot
  traffic the sheet has historically received, or exceed the rate limits are written to a
  "Needs review" sheet with the reason instead of being dropped. The client is still told
  "ok" so bots learn nothing.
- The same email and description sent twice inside ten minutes count as one lead.
- Editing the script does nothing until the **existing** "Lead Collector" deployment is
  updated to a new version. A *new* deployment has a new URL and the site keeps posting to
  the old one.

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
