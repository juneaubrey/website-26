# June Aubrey — website

A static, dependency-free editorial website for June Aubrey: strategic consulting, change management, mentoring, pattern recognition and remote viewing.

## Structure

```
index.html              Single-page site (hero, approach, expertise, principle, work, clients, about, contact)
imprint.html            Imprint (placeholder details — complete before launch)
privacy.html            Privacy notice (template — review before launch)
assets/css/styles.css   All styles; design tokens at the top (:root)
assets/js/main.js       Header, mobile nav, scroll reveals, pattern field, contact form
assets/images/          Art-directed placeholder images (SVG) and favicon
```

## Run locally

Open `index.html` directly, or:

```
npm run build   # copies the site into dist/
npm start       # serves it on http://localhost:3000 (or $PORT)
```

## Hosting

No dependencies are required.

- **Static hosting** (Netlify, Vercel, Cloudflare Pages, …): build command `npm run build`, output/publish directory `dist`.
- **Node.js hosting**: build command `npm run build`, start command `npm start`. The server listens on `$PORT`.

## Before launch

- **Photography** — replace the three placeholders in `assets/images/` with real photographs and update the `src` in `index.html`:
  - `portrait.svg` → hero portrait (portrait format, ~4:5, natural window light, calm, direct gaze)
  - `interior.svg` → a quiet, understated European interior or detail (3:2)
  - `portrait-study.svg` → June at work, in context (portrait format, ~8:11)
  Use JPG/WebP around 1600px on the long edge.
- **Email** — `hello@juneaubrey.com` is a placeholder; it appears in `index.html`, `imprint.html` and `assets/js/main.js`.
- **Contact form** — without a backend it opens the visitor's email client with the message pre-filled. To submit directly, point the form at a form service (e.g. Formspree) and adjust the submit handler in `main.js`.
- **Legal** — complete `imprint.html` and review `privacy.html`. Consider self-hosting the fonts (Cormorant Garamond, Inter).
