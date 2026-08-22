# Geeking Out — Home Page

Marketing site for Geeking Out, LLC, designed to feel like the menu system of a 2026 AAA game:
a cinematic title screen, then Missions (services), Arsenal (products), Squad (team), Campaign
(process), Codex (FAQ + field reports) and a Mission Briefing (contact form).

React 19 + TypeScript, built with Vite, styled with Tailwind v4. Builds to a **single
self-contained `dist/index.html`** you can drop on any static host.

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev      # http://localhost:3000
```

No API keys or `.env` file are needed.

## Build

```bash
npm run build    # -> dist/index.html  (one file)
npm run preview  # serve the built file at http://localhost:4173
```

`vite-plugin-singlefile` inlines all JS and CSS into `dist/index.html`; Tailwind is compiled at
build time, so the page has **one runtime dependency: Google Fonts** (Barlow Condensed, Barlow,
Rajdhani). Everything else — React, styles, the logo — ships inside the file.

## Structure

```
index.html            head: SEO meta, JSON-LD, inlined favicon, fonts link
index.tsx             mounts <App/>
src/
  App.tsx             hash router table → page, document.title, scroll-to-top
  router.ts           useRoute(), href(), navigate()   (hash routes: #/missions …)
  content.ts          ALL site copy: services, products, team, testimonials, FAQ, process, legal
  sheets.ts           contact form → Google Apps Script webhook
  logo.ts             brand mark as a data URI
  styles.css          design tokens (@theme) + the component CSS (panels, buttons, bars, …)
  ui/                 Panel, Button, Bar, Typewriter, PageTitle, Reveal, Icon, Atmosphere
  layout/             HUD (header + full-screen menu), Footer
  pages/              Home, Missions, Arsenal, Squad, Campaign, Codex, Contact, Legal, NotFound
```

Routes are hash-based (`#/missions`) so every URL resolves to the single `index.html` with no
server configuration. Copy lives only in `content.ts`; pages add the game-UI framing around it.

## Contact form → Google Sheets

The contact page is the only data path on the site. On submit it POSTs JSON to a Google Apps
Script web app, which appends a row to a spreadsheet. The endpoint is
`GOOGLE_SHEETS_WEBHOOK_URL` in [src/sheets.ts](src/sheets.ts). Payload:

| field | example |
|---|---|
| `timestamp` | `7/22/2026, 3:05:43 PM` |
| `source` | `Contact Form` |
| `name` | `Casey Rivera` |
| `email` | `casey@example.com` |
| `organization` | `Pawsome Grooming` |
| `description` | the project text |
| `projectDescription` | same text, duplicated so either column name works |

Two things worth knowing:

- The request is sent `mode: 'no-cors'`, which Apps Script web apps require. The response is
  opaque — the site can tell the request left the browser, but **not** that the script wrote
  the row. The success screen reflects the former.
- `Content-Type` must be a CORS-safelisted value, so the body goes out as `text/plain`. Apps
  Script reads it via `e.postData.contents` regardless.

Linking to `#/contact?quest=<service title>` prefills the project field — every "Deploy" button
on the Missions page does this.
