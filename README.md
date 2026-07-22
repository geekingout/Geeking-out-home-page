# Geeking Out Agency — Home Page

Marketing site for Geeking Out, LLC. React + TypeScript, built with Vite, styled with
Tailwind. Builds to a **single self-contained `index.html`** you can drop on any static host.

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev      # http://localhost:3000
```

No API keys or `.env` file are needed.

## Build

```bash
npm run build    # -> dist/index.html  (one file, ~718 kB / ~196 kB gzipped)
npm run preview  # serve the built file at http://localhost:4173
```

`vite-plugin-singlefile` inlines all JS and CSS into `dist/index.html`. Deploying is just
copying that one file. It still fetches Tailwind, GSAP, FontAwesome and Google Fonts from
their CDNs at runtime, so it needs a network connection but no build step on the server.

## Contact form → Google Sheets

The contact modal is the only data path in the site. On submit it POSTs JSON to a Google
Apps Script web app, which appends a row to a spreadsheet.

The endpoint lives in `GOOGLE_SHEETS_WEBHOOK_URL` at the top of [App.tsx](App.tsx). The
payload it sends:

| field | example |
|---|---|
| `timestamp` | `7/22/2026, 3:05:43 PM` |
| `source` | `Contact Form` |
| `name` | `Casey Rivera` |
| `email` | `casey@example.com` |
| `description` | the project text |
| `projectDescription` | same text, duplicated so either column name works |
| `organization` | `Pawsome Grooming` |

Two things worth knowing about this integration:

- The request is sent `mode: 'no-cors'`, which Google Apps Script web apps require. The
  response is therefore opaque — the site can tell that the request left the browser, but
  **not** that the script actually wrote the row. The success screen reflects the former.
- For the same reason `Content-Type` must be a CORS-safelisted value, so the body goes out
  as `text/plain`. Apps Script reads it via `e.postData.contents` regardless.

The form is reachable from the hero input (which prefills the project field), the header
"Get In Touch" button, the bottom CTA, the mobile nav rocket button, and each service
modal's "Discuss This Service".

## Notes

- Tailwind is loaded from `cdn.tailwindcss.com`, which logs a production warning in the
  console. Converting to a real Tailwind build would remove it and cut the CSS payload.
- The 3D hero and footer backgrounds use Three.js; scroll and entrance animation use GSAP
  + ScrollTrigger, both loaded from CDN in [index.html](index.html).
